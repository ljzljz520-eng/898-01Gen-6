import { runQuery, runExecute } from '../db/database.js';
import { Schedule, CreateScheduleRequest, User } from '../../shared/types.js';
import { UserService } from './UserService.js';

function parseSchedule(row: any): Schedule {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    city: row.city,
    date: row.date,
    style: row.style ? JSON.parse(row.style) : [],
    fee: row.fee,
    feeType: row.fee_type as 'free' | 'paid' | 'negotiable',
    feeNote: row.fee_note,
    duration: row.duration,
    workRequirements: row.work_requirements,
    contact: row.contact,
    description: row.description || '',
    samplePhotos: row.sample_photos ? JSON.parse(row.sample_photos) : [],
    status: row.status as 'active' | 'booked' | 'expired',
    createdAt: row.created_at
  };
}

async function withUser(schedule: Schedule): Promise<Schedule> {
  const user = await UserService.findById(schedule.userId);
  return { ...schedule, user };
}

export const ScheduleService = {
  async findAll(filters?: { city?: string; style?: string; userId?: number; status?: string }): Promise<Schedule[]> {
    let sql = 'SELECT * FROM schedules WHERE 1=1';
    const params: any[] = [];

    if (filters?.city) {
      sql += ' AND city LIKE ?';
      params.push(`%${filters.city}%`);
    }
    if (filters?.style) {
      sql += ' AND style LIKE ?';
      params.push(`%${filters.style}%`);
    }
    if (filters?.userId) {
      sql += ' AND user_id = ?';
      params.push(filters.userId);
    }
    if (filters?.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }

    sql += ' ORDER BY date ASC, created_at DESC';
    const rows = runQuery(sql, params);
    
    const schedules = rows.map(parseSchedule);
    return Promise.all(schedules.map(withUser));
  },

  async findById(id: number): Promise<Schedule | null> {
    const rows = runQuery('SELECT * FROM schedules WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    
    const schedule = parseSchedule(rows[0]);
    return withUser(schedule);
  },

  async create(userId: number, data: CreateScheduleRequest): Promise<Schedule> {
    const result = runExecute(
      `INSERT INTO schedules (user_id, title, city, date, style, fee, fee_type, fee_note, duration, work_requirements, contact, description, sample_photos, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [userId, data.title, data.city, data.date, JSON.stringify(data.style), data.fee, data.feeType, data.feeNote, data.duration, data.workRequirements, data.contact, data.description, JSON.stringify(data.samplePhotos)]
    );

    const schedule = await this.findById(result.lastInsertRowid);
    if (!schedule) throw new Error('创建档期失败');
    return schedule;
  },

  async update(id: number, userId: number, data: Partial<CreateScheduleRequest>): Promise<Schedule | null> {
    const schedule = await this.findById(id);
    if (!schedule || schedule.userId !== userId) return null;

    const fields: string[] = [];
    const params: any[] = [];

    if (data.title !== undefined) {
      fields.push('title = ?');
      params.push(data.title);
    }
    if (data.city !== undefined) {
      fields.push('city = ?');
      params.push(data.city);
    }
    if (data.date !== undefined) {
      fields.push('date = ?');
      params.push(data.date);
    }
    if (data.style !== undefined) {
      fields.push('style = ?');
      params.push(JSON.stringify(data.style));
    }
    if (data.fee !== undefined) {
      fields.push('fee = ?');
      params.push(data.fee);
    }
    if (data.feeType !== undefined) {
      fields.push('fee_type = ?');
      params.push(data.feeType);
    }
    if (data.feeNote !== undefined) {
      fields.push('fee_note = ?');
      params.push(data.feeNote);
    }
    if (data.duration !== undefined) {
      fields.push('duration = ?');
      params.push(data.duration);
    }
    if (data.workRequirements !== undefined) {
      fields.push('work_requirements = ?');
      params.push(data.workRequirements);
    }
    if (data.contact !== undefined) {
      fields.push('contact = ?');
      params.push(data.contact);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      params.push(data.description);
    }
    if (data.samplePhotos !== undefined) {
      fields.push('sample_photos = ?');
      params.push(JSON.stringify(data.samplePhotos));
    }

    if (fields.length === 0) return schedule;

    params.push(id);
    runExecute(`UPDATE schedules SET ${fields.join(', ')} WHERE id = ?`, params);
    return this.findById(id);
  },

  async updateStatus(id: number, status: 'active' | 'booked' | 'expired'): Promise<void> {
    runExecute('UPDATE schedules SET status = ? WHERE id = ?', [status, id]);
  },

  async delete(id: number, userId: number): Promise<boolean> {
    const schedule = await this.findById(id);
    if (!schedule || schedule.userId !== userId) return false;

    runExecute('DELETE FROM schedules WHERE id = ?', [id]);
    return true;
  }
};
