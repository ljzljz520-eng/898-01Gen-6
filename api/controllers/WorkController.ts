import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { WorkService } from '../services/WorkService.js';
import { UploadWorkRequest, AuthorizeWorkRequest } from '../../shared/types.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const WorkController = {
  async getWorks(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { visibility, shootingPlanId, userId, public: isPublic } = req.query;
      
      if (isPublic === 'true') {
        const works = await WorkService.findPublicWorks();
        res.json(works);
        return;
      }

      if (!req.user) {
        res.status(401).json({ error: '未登录' });
        return;
      }

      const filters = {
        visibility: visibility as 'private' | 'both' | 'public' | undefined,
        shootingPlanId: shootingPlanId ? parseInt(shootingPlanId as string) : undefined,
        userId: userId ? parseInt(userId as string) : undefined,
        currentUserId: req.user.id
      };
      
      const works = await WorkService.findAll(filters);
      res.json(works);
    } catch (error) {
      console.error('Get works error:', error);
      res.status(500).json({ error: '获取作品列表失败' });
    }
  },

  async getWorkById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: '无效的作品ID' });
        return;
      }

      const currentUserId = req.user?.id;
      const work = await WorkService.findById(id, currentUserId);
      
      if (!work) {
        res.status(404).json({ error: '作品不存在或无权限查看' });
        return;
      }

      res.json(work);
    } catch (error) {
      console.error('Get work error:', error);
      res.status(500).json({ error: '获取作品详情失败' });
    }
  },

  async uploadWork(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: '未登录' });
        return;
      }

      const data = req.body as UploadWorkRequest;
      
      if (!req.file) {
        res.status(400).json({ error: '请上传图片' });
        return;
      }

      if (!data.title) {
        res.status(400).json({ error: '请填写作品标题' });
        return;
      }

      const imageUrl = `/uploads/${req.file.filename}`;
      const work = await WorkService.create(req.user.id, data, imageUrl);
      res.status(201).json(work);
    } catch (error) {
      console.error('Upload work error:', error);
      res.status(500).json({ error: '上传作品失败' });
    }
  },

  async authorizeWork(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: '未登录' });
        return;
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: '无效的作品ID' });
        return;
      }

      const { visibility } = req.body as AuthorizeWorkRequest;
      if (!visibility || !['private', 'both', 'public'].includes(visibility)) {
        res.status(400).json({ error: '请选择有效的可见范围' });
        return;
      }

      const work = await WorkService.authorize(id, req.user.id, visibility);
      if (!work) {
        res.status(404).json({ error: '作品不存在或无权限授权' });
        return;
      }

      res.json(work);
    } catch (error) {
      console.error('Authorize work error:', error);
      res.status(500).json({ error: '授权作品失败' });
    }
  },

  async getWorkAuthorizations(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: '未登录' });
        return;
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: '无效的作品ID' });
        return;
      }

      const work = await WorkService.findById(id, req.user.id);
      if (!work) {
        res.status(404).json({ error: '作品不存在或无权限查看' });
        return;
      }

      const authorizations = await WorkService.getAuthorizations(id);
      res.json(authorizations);
    } catch (error) {
      console.error('Get work authorizations error:', error);
      res.status(500).json({ error: '获取授权记录失败' });
    }
  },

  async deleteWork(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: '未登录' });
        return;
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: '无效的作品ID' });
        return;
      }

      const success = await WorkService.delete(id, req.user.id);
      if (!success) {
        res.status(404).json({ error: '作品不存在或无权限删除' });
        return;
      }

      res.json({ message: '删除成功' });
    } catch (error) {
      console.error('Delete work error:', error);
      res.status(500).json({ error: '删除作品失败' });
    }
  }
};
