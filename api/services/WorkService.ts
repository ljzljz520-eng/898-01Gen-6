import { runQuery, runExecute } from '../db/database.js';
import { Work, UploadWorkRequest, Authorization } from '../../shared/types.js';
import { UserService } from './UserService.js';
import { ShootingService } from './ShootingService.js';

function parseWork(row: any): Work {
  return {
    id: row.id,
    shootingPlanId: row.shooting_plan_id,
    uploaderId: row.uploader_id,
    photographerId: row.photographer_id,
    modelId: row.model_id,
    title: row.title || '',
    description: row.description || '',
    imageUrl: row.image_url,
    visibility: row.visibility as 'private' | 'both' | 'public',
    photographerConfirmed: !!row.photographer_confirmed,
    modelConfirmed: !!row.model_confirmed,
    createdAt: row.created_at
  };
}

function parseAuthorization(row: any): Authorization {
  return {
    id: row.id,
    workId: row.work_id,
    userId: row.user_id,
    visibility: row.visibility as 'private' | 'both' | 'public',
    confirmed: !!row.confirmed,
    confirmedAt: row.confirmed_at
  };
}

async function withRelations(work: Work): Promise<Work> {
  const [uploader, shootingPlan] = await Promise.all([
    UserService.findById(work.uploaderId),
    work.shootingPlanId ? ShootingService.findById(work.shootingPlanId) : null
  ]);
  return { ...work, uploader, shootingPlan };
}

export const WorkService = {
  async findAll(filters?: { 
    userId?: number; 
    visibility?: 'private' | 'both' | 'public';
    shootingPlanId?: number;
    currentUserId?: number;
  }): Promise<Work[]> {
    let sql = 'SELECT * FROM works WHERE 1=1';
    const params: any[] = [];

    if (filters?.visibility) {
      sql += ' AND visibility = ?';
      params.push(filters.visibility);
    }
    if (filters?.shootingPlanId) {
      sql += ' AND shooting_plan_id = ?';
      params.push(filters.shootingPlanId);
    }
    if (filters?.userId) {
      sql += ' AND (uploader_id = ? OR photographer_id = ? OR model_id = ?)';
      params.push(filters.userId, filters.userId, filters.userId);
    }

    if (filters?.currentUserId) {
      sql += ` AND (
        visibility = 'public'
        OR uploader_id = ?
        OR photographer_id = ?
        OR model_id = ?
        OR visibility = 'both' AND (photographer_id = ? OR model_id = ?)
      )`;
      params.push(filters.currentUserId, filters.currentUserId, filters.currentUserId, filters.currentUserId, filters.currentUserId);
    }

    sql += ' ORDER BY created_at DESC';
    const rows = runQuery(sql, params);
    
    const works = rows.map(parseWork);
    return Promise.all(works.map(withRelations));
  },

  async findPublicWorks(): Promise<Work[]> {
    const rows = runQuery(
      "SELECT * FROM works WHERE visibility = 'public' AND photographer_confirmed = 1 AND model_confirmed = 1 ORDER BY created_at DESC"
    );
    const works = rows.map(parseWork);
    return Promise.all(works.map(withRelations));
  },

  async findById(id: number, currentUserId?: number): Promise<Work | null> {
    let sql = 'SELECT * FROM works WHERE id = ?';
    const params: any[] = [id];

    if (currentUserId) {
      sql += ` AND (
        visibility = 'public'
        OR uploader_id = ?
        OR photographer_id = ?
        OR model_id = ?
        OR visibility = 'both' AND (photographer_id = ? OR model_id = ?)
      )`;
      params.push(currentUserId, currentUserId, currentUserId, currentUserId, currentUserId);
    }

    const rows = runQuery(sql, params);
    if (rows.length === 0) return null;
    
    const work = parseWork(rows[0]);
    return withRelations(work);
  },

  async create(uploaderId: number, data: UploadWorkRequest, imageUrl: string): Promise<Work> {
    let photographerId: number | undefined;
    let modelId: number | undefined;

    if (data.shootingPlanId) {
      const plan = await ShootingService.findById(data.shootingPlanId);
      if (plan) {
        if (plan.requester?.role === 'photographer') {
          photographerId = plan.requesterId;
          modelId = plan.recipientId;
        } else {
          photographerId = plan.recipientId;
          modelId = plan.requesterId;
        }
      }
    }

    const result = runExecute(
      `INSERT INTO works (shooting_plan_id, uploader_id, photographer_id, model_id, title, description, image_url, visibility, photographer_confirmed, model_confirmed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.shootingPlanId || null,
        uploaderId,
        photographerId || null,
        modelId || null,
        data.title,
        data.description,
        imageUrl,
        'private',
        photographerId === uploaderId ? 1 : 0,
        modelId === uploaderId ? 1 : 0
      ]
    );

    if (photographerId && modelId) {
      runExecute(
        `INSERT INTO authorizations (work_id, user_id, visibility, confirmed)
         VALUES (?, ?, ?, ?)`,
        [result.lastInsertRowid, photographerId, data.visibility, photographerId === uploaderId ? 1 : 0]
      );
      runExecute(
        `INSERT INTO authorizations (work_id, user_id, visibility, confirmed)
         VALUES (?, ?, ?, ?)`,
        [result.lastInsertRowid, modelId, data.visibility, modelId === uploaderId ? 1 : 0]
      );
    }

    const work = await this.findById(result.lastInsertRowid);
    if (!work) throw new Error('创建作品失败');
    return work;
  },

  async authorize(workId: number, userId: number, visibility: 'private' | 'both' | 'public'): Promise<Work | null> {
    const work = await this.findById(workId, userId);
    if (!work) return null;

    const isPhotographer = work.photographerId === userId;
    const isModel = work.modelId === userId;

    if (!isPhotographer && !isModel) return null;

    const rows = runQuery(
      'SELECT * FROM authorizations WHERE work_id = ? AND user_id = ?',
      [workId, userId]
    );

    if (rows.length > 0) {
      runExecute(
        `UPDATE authorizations SET visibility = ?, confirmed = 1, confirmed_at = CURRENT_TIMESTAMP
         WHERE work_id = ? AND user_id = ?`,
        [visibility, workId, userId]
      );
    } else {
      runExecute(
        `INSERT INTO authorizations (work_id, user_id, visibility, confirmed, confirmed_at)
         VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)`,
        [workId, userId, visibility]
      );
    }

    const updateFields: string[] = [];
    const updateParams: any[] = [];

    if (isPhotographer) {
      updateFields.push('photographer_confirmed = 1');
    }
    if (isModel) {
      updateFields.push('model_confirmed = 1');
    }

    const authRows = runQuery(
      'SELECT * FROM authorizations WHERE work_id = ? AND confirmed = 1',
      [workId]
    );

    if (authRows.length >= 2) {
      const visibilities = authRows.map(r => r.visibility);
      const finalVisibility = visibilities.includes('private') ? 'private' :
                              visibilities.includes('both') ? 'both' : 'public';
      updateFields.push('visibility = ?');
      updateParams.push(finalVisibility);
    }

    updateParams.push(workId);
    if (updateFields.length > 0) {
      runExecute(`UPDATE works SET ${updateFields.join(', ')} WHERE id = ?`, updateParams);
    }

    return this.findById(workId, userId);
  },

  async getAuthorizations(workId: number): Promise<Authorization[]> {
    const rows = runQuery(
      'SELECT * FROM authorizations WHERE work_id = ? ORDER BY created_at',
      [workId]
    );
    return rows.map(parseAuthorization);
  },

  async delete(id: number, userId: number): Promise<boolean> {
    const work = await this.findById(id, userId);
    if (!work || work.uploaderId !== userId) return false;

    runExecute('DELETE FROM authorizations WHERE work_id = ?', [id]);
    runExecute('DELETE FROM works WHERE id = ?', [id]);
    return true;
  }
};
