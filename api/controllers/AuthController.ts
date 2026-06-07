import { Response } from 'express';
import { AuthRequest, generateToken } from '../middleware/auth.js';
import { UserService } from '../services/UserService.js';
import { LoginRequest, RegisterRequest, AuthResponse } from '../../shared/types.js';

export const AuthController = {
  async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { username, password } = req.body as LoginRequest;

      if (!username || !password) {
        res.status(400).json({ error: '用户名和密码不能为空' });
        return;
      }

      const user = await UserService.verifyPassword(username, password);
      if (!user) {
        res.status(401).json({ error: '用户名或密码错误' });
        return;
      }

      const token = generateToken(user);
      const response: AuthResponse = { user, token };
      res.json(response);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: '登录失败' });
    }
  },

  async register(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = req.body as RegisterRequest;

      if (!data.username || !data.password || !data.realName || !data.phone || !data.role || !data.city) {
        res.status(400).json({ error: '请填写所有必填字段' });
        return;
      }

      if (!['photographer', 'model'].includes(data.role)) {
        res.status(400).json({ error: '角色必须是摄影师或模特' });
        return;
      }

      const existingUser = await UserService.findByUsername(data.username);
      if (existingUser) {
        res.status(400).json({ error: '用户名已存在' });
        return;
      }

      if (data.password.length < 6) {
        res.status(400).json({ error: '密码长度至少6位' });
        return;
      }

      const user = await UserService.create(data);
      const token = generateToken(user);
      const response: AuthResponse = { user, token };
      res.status(201).json(response);
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: '注册失败' });
    }
  },

  async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: '未登录' });
        return;
      }

      const user = await UserService.findById(req.user.id);
      if (!user) {
        res.status(404).json({ error: '用户不存在' });
        return;
      }

      res.json(user);
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ error: '获取用户信息失败' });
    }
  }
};
