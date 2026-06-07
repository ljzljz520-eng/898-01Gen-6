import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { UserService } from '../services/UserService.js';
import { User } from '../../shared/types.js';

export const UserController = {
  async getUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { city, role, style } = req.query;
      const filters = {
        city: city as string | undefined,
        role: role as string | undefined,
        style: style as string | undefined
      };
      
      const users = await UserService.findAll(filters);
      res.json(users);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: '获取用户列表失败' });
    }
  },

  async getUserById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: '无效的用户ID' });
        return;
      }

      const user = await UserService.findById(id);
      if (!user) {
        res.status(404).json({ error: '用户不存在' });
        return;
      }

      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: '获取用户信息失败' });
    }
  },

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: '未登录' });
        return;
      }

      const data = req.body as Partial<User>;
      
      const user = await UserService.update(req.user.id, data);
      if (!user) {
        res.status(404).json({ error: '用户不存在' });
        return;
      }

      res.json(user);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: '更新个人资料失败' });
    }
  },

  async getCancellationRecords(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: '未登录' });
        return;
      }

      const { CreditService } = await import('../services/CreditService.js');
      const records = await CreditService.getUserCancellationRecords(req.user.id);
      res.json(records);
    } catch (error) {
      console.error('Get cancellation records error:', error);
      res.status(500).json({ error: '获取取消记录失败' });
    }
  }
};
