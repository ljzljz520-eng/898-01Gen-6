import bcrypt from 'bcryptjs';
import { runQuery, runExecute } from '../db/database.js';
import { User, RegisterRequest } from '../../shared/types.js';

function parseUser(row: any): User {
  return {
    id: row.id,
    username: row.username,
    avatar: row.avatar || '',
    role: row.role as 'photographer' | 'model',
    realName: row.real_name,
    phone: row.phone,
    city: row.city || '',
    styles: row.styles ? JSON.parse(row.styles) : [],
    bio: row.bio || '',
    creditScore: row.credit_score,
    samplePhotos: row.sample_photos ? JSON.parse(row.sample_photos) : [],
    createdAt: row.created_at
  };
}

export const UserService = {
  async findByUsername(username: string): Promise<User | null> {
    const rows = runQuery(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows.length > 0 ? parseUser(rows[0]) : null;
  },

  async findByUsernameWithPassword(username: string): Promise<any | null> {
    const rows = runQuery(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows.length > 0 ? rows[0] : null;
  },

  async findById(id: number): Promise<User | null> {
    const rows = runQuery(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? parseUser(rows[0]) : null;
  },

  async findAll(filters?: { city?: string; role?: string; style?: string }): Promise<User[]> {
    let sql = 'SELECT * FROM users WHERE 1=1';
    const params: any[] = [];

    if (filters?.city) {
      sql += ' AND city LIKE ?';
      params.push(`%${filters.city}%`);
    }
    if (filters?.role) {
      sql += ' AND role = ?';
      params.push(filters.role);
    }
    if (filters?.style) {
      sql += ' AND styles LIKE ?';
      params.push(`%${filters.style}%`);
    }

    sql += ' ORDER BY credit_score DESC, created_at DESC';
    const rows = runQuery(sql, params);
    return rows.map(parseUser);
  },

  async create(data: RegisterRequest): Promise<User> {
    const hashedPassword = bcrypt.hashSync(data.password, 10);
    
    const result = runExecute(
      `INSERT INTO users (username, password_hash, role, real_name, phone, city, avatar, styles, bio, credit_score)
       VALUES (?, ?, ?, ?, ?, ?, '', '[]', '', 100)`,
      [data.username, hashedPassword, data.role, data.realName, data.phone, data.city]
    );

    const user = await this.findById(result.lastInsertRowid);
    if (!user) throw new Error('创建用户失败');
    return user;
  },

  async update(id: number, data: Partial<User> & { password?: string }): Promise<User | null> {
    const fields: string[] = [];
    const params: any[] = [];

    if (data.avatar !== undefined) {
      fields.push('avatar = ?');
      params.push(data.avatar);
    }
    if (data.city !== undefined) {
      fields.push('city = ?');
      params.push(data.city);
    }
    if (data.styles !== undefined) {
      fields.push('styles = ?');
      params.push(JSON.stringify(data.styles));
    }
    if (data.bio !== undefined) {
      fields.push('bio = ?');
      params.push(data.bio);
    }
    if (data.samplePhotos !== undefined) {
      fields.push('sample_photos = ?');
      params.push(JSON.stringify(data.samplePhotos));
    }
    if (data.realName !== undefined) {
      fields.push('real_name = ?');
      params.push(data.realName);
    }
    if (data.phone !== undefined) {
      fields.push('phone = ?');
      params.push(data.phone);
    }
    if (data.password !== undefined) {
      const hashedPassword = bcrypt.hashSync(data.password, 10);
      fields.push('password_hash = ?');
      params.push(hashedPassword);
    }

    if (fields.length === 0) return this.findById(id);

    params.push(id);
    runExecute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
    return this.findById(id);
  },

  async updateCreditScore(id: number, delta: number): Promise<number> {
    const user = await this.findById(id);
    if (!user) throw new Error('用户不存在');
    
    const newScore = Math.max(0, Math.min(100, user.creditScore + delta));
    runExecute('UPDATE users SET credit_score = ? WHERE id = ?', [newScore, id]);
    return newScore;
  },

  async verifyPassword(username: string, password: string): Promise<User | null> {
    const user = await this.findByUsernameWithPassword(username);
    if (!user) return null;

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) return null;

    return parseUser(user);
  }
};
