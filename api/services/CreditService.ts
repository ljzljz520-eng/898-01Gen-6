import { runQuery, runExecute } from '../db/database.js';
import { CancellationRecord } from '../../shared/types.js';
import { UserService } from './UserService.js';

function parseCancellationRecord(row: any): CancellationRecord {
  return {
    id: row.id,
    shootingPlanId: row.shooting_plan_id,
    userId: row.user_id,
    reason: row.reason,
    hoursBeforeShooting: row.hours_before_shooting,
    creditDeducted: row.credit_deducted,
    createdAt: row.created_at
  };
}

export const CreditService = {
  calculateDeduction(hoursBeforeShooting: number, reason: string): number {
    if (hoursBeforeShooting < 24) {
      if (reason.includes('紧急') || reason.includes('临时')) {
        return 10;
      }
      return 5;
    } else if (hoursBeforeShooting < 72) {
      return 3;
    }
    return 1;
  },

  async recordCancellation(
    shootingPlanId: number,
    userId: number,
    reason: string,
    hoursBeforeShooting: number
  ): Promise<CancellationRecord> {
    const creditDeducted = this.calculateDeduction(hoursBeforeShooting, reason);
    
    const result = runExecute(
      `INSERT INTO cancellation_records (shooting_plan_id, user_id, reason, hours_before_shooting, credit_deducted)
       VALUES (?, ?, ?, ?, ?)`,
      [shootingPlanId, userId, reason, hoursBeforeShooting, creditDeducted]
    );

    await UserService.updateCreditScore(userId, -creditDeducted);

    const rows = runQuery('SELECT * FROM cancellation_records WHERE id = ?', [result.lastInsertRowid]);
    return parseCancellationRecord(rows[0]);
  },

  async getCancellationRecords(shootingPlanId: number): Promise<CancellationRecord[]> {
    const rows = runQuery(
      'SELECT * FROM cancellation_records WHERE shooting_plan_id = ? ORDER BY created_at DESC',
      [shootingPlanId]
    );
    return rows.map(parseCancellationRecord);
  },

  async getUserCancellationRecords(userId: number): Promise<CancellationRecord[]> {
    const rows = runQuery(
      'SELECT * FROM cancellation_records WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows.map(parseCancellationRecord);
  }
};
