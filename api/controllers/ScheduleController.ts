import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { ScheduleService } from '../services/ScheduleService.js';
import { CreateScheduleRequest } from '../../shared/types.js';

export const ScheduleController = {
  async getSchedules(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { city, style, userId, status } = req.query;
      const filters = {
        city: city as string | undefined,
        style: style as string | undefined,
        userId: userId ? parseInt(userId as string) : undefined,
        status: status as string | undefined
      };
      
      const schedules = await ScheduleService.findAll(filters);
      res.json(schedules);
    } catch (error) {
      console.error('Get schedules error:', error);
      res.status(500).json({ error: '获取档期列表失败' });
    }
  },

  async getScheduleById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: '无效的档期ID' });
        return;
      }

      const schedule = await ScheduleService.findById(id);
      if (!schedule) {
        res.status(404).json({ error: '档期不存在' });
        return;
      }

      res.json(schedule);
    } catch (error) {
      console.error('Get schedule error:', error);
      res.status(500).json({ error: '获取档期详情失败' });
    }
  },

  async createSchedule(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: '未登录' });
        return;
      }

      const body = req.body as any;
      
      const data: CreateScheduleRequest = {
        title: body.title,
        city: body.city,
        date: body.date,
        style: typeof body.style === 'string' ? JSON.parse(body.style) : body.style || [],
        feeType: body.feeType || 'negotiable',
        fee: body.fee ? parseInt(body.fee) : 0,
        feeNote: body.feeNote || undefined,
        duration: body.duration || undefined,
        workRequirements: body.workRequirements || undefined,
        contact: body.contact,
        description: body.description || '',
        samplePhotos: []
      };
      
      if (req.files && Array.isArray(req.files)) {
        data.samplePhotos = req.files.map((file: Express.Multer.File) => `/uploads/${file.filename}`);
      }
      
      if (!data.title || !data.city || !data.date || !data.style || data.style.length === 0) {
        res.status(400).json({ error: '请填写标题、城市、日期和拍摄风格' });
        return;
      }

      const schedule = await ScheduleService.create(req.user.id, data);
      res.status(201).json(schedule);
    } catch (error) {
      console.error('Create schedule error:', error);
      res.status(500).json({ error: '创建档期失败' });
    }
  },

  async updateSchedule(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: '未登录' });
        return;
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: '无效的档期ID' });
        return;
      }

      const body = req.body as any;
      const data: Partial<CreateScheduleRequest> = {};
      
      if (body.title !== undefined) data.title = body.title;
      if (body.city !== undefined) data.city = body.city;
      if (body.date !== undefined) data.date = body.date;
      if (body.style !== undefined) {
        data.style = typeof body.style === 'string' ? JSON.parse(body.style) : body.style;
      }
      if (body.feeType !== undefined) data.feeType = body.feeType;
      if (body.fee !== undefined) data.fee = parseInt(body.fee);
      if (body.feeNote !== undefined) data.feeNote = body.feeNote;
      if (body.duration !== undefined) data.duration = body.duration;
      if (body.workRequirements !== undefined) data.workRequirements = body.workRequirements;
      if (body.contact !== undefined) data.contact = body.contact;
      if (body.description !== undefined) data.description = body.description;
      
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        data.samplePhotos = req.files.map((file: Express.Multer.File) => `/uploads/${file.filename}`);
      }
      
      const schedule = await ScheduleService.update(id, req.user.id, data);
      if (!schedule) {
        res.status(404).json({ error: '档期不存在或无权限修改' });
        return;
      }

      res.json(schedule);
    } catch (error) {
      console.error('Update schedule error:', error);
      res.status(500).json({ error: '更新档期失败' });
    }
  },

  async deleteSchedule(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: '未登录' });
        return;
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: '无效的档期ID' });
        return;
      }

      const success = await ScheduleService.delete(id, req.user.id);
      if (!success) {
        res.status(404).json({ error: '档期不存在或无权限删除' });
        return;
      }

      res.json({ message: '删除成功' });
    } catch (error) {
      console.error('Delete schedule error:', error);
      res.status(500).json({ error: '删除档期失败' });
    }
  }
};
