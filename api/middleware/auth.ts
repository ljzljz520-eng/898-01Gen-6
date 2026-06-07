import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../../shared/types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'lensmeet-secret-key-2024';

export interface AuthRequest extends Request {
  user?: User;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: '未提供认证令牌' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as User;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: '认证令牌无效或已过期' });
  }
}

export function generateToken(user: User): string {
  const { password_hash, ...userWithoutPassword } = user as any;
  return jwt.sign(userWithoutPassword, JWT_SECRET, { expiresIn: '7d' });
}
