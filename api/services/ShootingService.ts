import { runQuery, runExecute } from '../db/database.js';
import { ShootingPlan, CreateShootingPlanRequest, User } from '../../shared/types.js';
import { UserService } from './UserService.js';
import { ScheduleService } from './ScheduleService.js';
import { CreditService } from './CreditService.js';

function parseShootingPlan(row: any): ShootingPlan {
  return {
    id: row.id,
    scheduleId: row.schedule_id,
    requesterId: row.requester_id,
    recipientId: row.recipient_id,
    status: row.status as 'pending' | 'confirmed' | 'completed' | 'cancelled',
    shootingDate: row.shooting_date,
    shootingLocation: row.shooting_location || '',
    notes: row.notes || '',
    createdAt: row.created_at,
    confirmedAt: row.confirmed_at
  };
}

async function withRelations(plan: ShootingPlan): Promise<ShootingPlan> {
  const [requester, recipient, schedule] = await Promise.all([
    UserService.findById(plan.requesterId),
    UserService.findById(plan.recipientId),
    plan.scheduleId ? ScheduleService.findById(plan.scheduleId) : null
  ]);
  return { ...plan, requester, recipient, schedule };
}

export const ShootingService = {
  async findByUserId(userId: number): Promise<ShootingPlan[]> {
    const rows = runQuery(
      `SELECT * FROM shooting_plans 
       WHERE requester_id = ? OR recipient_id = ? 
       ORDER BY shooting_date DESC, created_at DESC`,
      [userId, userId]
    );
    
    const plans = rows.map(parseShootingPlan);
    return Promise.all(plans.map(withRelations));
  },

  async findById(id: number): Promise<ShootingPlan | null> {
    const rows = runQuery('SELECT * FROM shooting_plans WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    
    const plan = parseShootingPlan(rows[0]);
    return withRelations(plan);
  },

  async create(requesterId: number, data: CreateShootingPlanRequest): Promise<ShootingPlan> {
    const result = runExecute(
      `INSERT INTO shooting_plans (schedule_id, requester_id, recipient_id, shooting_date, shooting_location, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [data.scheduleId || null, requesterId, data.recipientId, data.shootingDate, data.shootingLocation, data.notes]
    );

    if (data.scheduleId) {
      await ScheduleService.updateStatus(data.scheduleId, 'booked');
    }

    const plan = await this.findById(result.lastInsertRowid);
    if (!plan) throw new Error('创建拍摄计划失败');
    return plan;
  },

  async confirm(id: number, userId: number): Promise<ShootingPlan | null> {
    const plan = await this.findById(id);
    if (!plan || plan.recipientId !== userId || plan.status !== 'pending') return null;

    runExecute(
      `UPDATE shooting_plans SET status = 'confirmed', confirmed_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [id]
    );

    return this.findById(id);
  },

  async reject(id: number, userId: number): Promise<ShootingPlan | null> {
    const plan = await this.findById(id);
    if (!plan || plan.recipientId !== userId || plan.status !== 'pending') return null;

    runExecute(`UPDATE shooting_plans SET status = 'cancelled' WHERE id = ?`, [id]);

    if (plan.scheduleId) {
      await ScheduleService.updateStatus(plan.scheduleId, 'active');
    }

    return this.findById(id);
  },

  async complete(id: number, userId: number): Promise<ShootingPlan | null> {
    const plan = await this.findById(id);
    if (!plan) return null;
    if (plan.requesterId !== userId && plan.recipientId !== userId) return null;
    if (plan.status !== 'confirmed') return null;

    runExecute(`UPDATE shooting_plans SET status = 'completed' WHERE id = ?`, [id]);
    return this.findById(id);
  },

  async cancel(id: number, userId: number, reason: string): Promise<ShootingPlan | null> {
    const plan = await this.findById(id);
    if (!plan) return null;
    if (plan.requesterId !== userId && plan.recipientId !== userId) return null;
    if (plan.status === 'completed' || plan.status === 'cancelled') return null;

    const shootingDate = new Date(plan.shootingDate);
    const now = new Date();
    const hoursBeforeShooting = Math.max(0, (shootingDate.getTime() - now.getTime()) / (1000 * 60 * 60));

    await CreditService.recordCancellation(id, userId, reason, Math.floor(hoursBeforeShooting));

    runExecute(`UPDATE shooting_plans SET status = 'cancelled' WHERE id = ?`, [id]);

    if (plan.scheduleId) {
      await ScheduleService.updateStatus(plan.scheduleId, 'active');
    }

    return this.findById(id);
  }
};
