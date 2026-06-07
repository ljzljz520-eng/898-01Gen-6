import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { ShootingService } from '../services/ShootingService.js';
import { CreateShootingPlanRequest, CancelShootingRequest } from '../../shared/types.js';

export const ShootingController = {
  async getShootingPlans(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: '未登录' });
        return;
      }

      const plans = await ShootingService.findByUserId(req.user.id);
      res.json(plans);
    } catch (error) {
      console.error('Get shooting plans error:', error);
      res.status(500).json({ error: '获取拍摄计划列表失败' });
    }
  },

  async getShootingPlanById(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: '未登录' });
        return;
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: '无效的计划ID' });
        return;
      }

      const plan = await ShootingService.findById(id);
      if (!plan) {
        res.status(404).json({ error: '拍摄计划不存在' });
        return;
      }

      if (plan.requesterId !== req.user.id && plan.recipientId !== req.user.id) {
        res.status(403).json({ error: '无权查看此拍摄计划' });
        return;
      }

      res.json(plan);
    } catch (error) {
      console.error('Get shooting plan error:', error);
      res.status(500).json({ error: '获取拍摄计划详情失败' });
    }
  },

  async createShootingPlan(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: '未登录' });
        return;
      }

      const data = req.body as CreateShootingPlanRequest;
      
      if (!data.recipientId || !data.shootingDate || !data.shootingLocation) {
        res.status(400).json({ error: '请填写接收方、拍摄日期和地点' });
        return;
      }

      if (data.recipientId === req.user.id) {
        res.status(400).json({ error: '不能邀请自己' });
        return;
      }

      const plan = await ShootingService.create(req.user.id, data);
      res.status(201).json(plan);
    } catch (error) {
      console.error('Create shooting plan error:', error);
      res.status(500).json({ error: '创建拍摄计划失败' });
    }
  },

  async confirmShootingPlan(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: '未登录' });
        return;
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: '无效的计划ID' });
        return;
      }

      const plan = await ShootingService.confirm(id, req.user.id);
      if (!plan) {
        res.status(404).json({ error: '拍摄计划不存在或无权限确认' });
        return;
      }

      res.json(plan);
    } catch (error) {
      console.error('Confirm shooting plan error:', error);
      res.status(500).json({ error: '确认拍摄计划失败' });
    }
  },

  async rejectShootingPlan(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: '未登录' });
        return;
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: '无效的计划ID' });
        return;
      }

      const plan = await ShootingService.reject(id, req.user.id);
      if (!plan) {
        res.status(404).json({ error: '拍摄计划不存在或无权限拒绝' });
        return;
      }

      res.json(plan);
    } catch (error) {
      console.error('Reject shooting plan error:', error);
      res.status(500).json({ error: '拒绝拍摄计划失败' });
    }
  },

  async completeShootingPlan(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: '未登录' });
        return;
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: '无效的计划ID' });
        return;
      }

      const plan = await ShootingService.complete(id, req.user.id);
      if (!plan) {
        res.status(404).json({ error: '拍摄计划不存在或无权限标记完成' });
        return;
      }

      res.json(plan);
    } catch (error) {
      console.error('Complete shooting plan error:', error);
      res.status(500).json({ error: '标记拍摄计划完成失败' });
    }
  },

  async cancelShootingPlan(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: '未登录' });
        return;
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: '无效的计划ID' });
        return;
      }

      const { reason } = req.body as CancelShootingRequest;
      if (!reason || reason.trim().length === 0) {
        res.status(400).json({ error: '请填写取消原因' });
        return;
      }

      const plan = await ShootingService.cancel(id, req.user.id, reason);
      if (!plan) {
        res.status(404).json({ error: '拍摄计划不存在或无权限取消' });
        return;
      }

      res.json(plan);
    } catch (error) {
      console.error('Cancel shooting plan error:', error);
      res.status(500).json({ error: '取消拍摄计划失败' });
    }
  }
};
