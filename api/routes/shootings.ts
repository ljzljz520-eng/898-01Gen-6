import { Router } from 'express';
import { ShootingController } from '../controllers/ShootingController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, ShootingController.getShootingPlans);
router.post('/', authMiddleware, ShootingController.createShootingPlan);
router.get('/:id', authMiddleware, ShootingController.getShootingPlanById);
router.post('/:id/confirm', authMiddleware, ShootingController.confirmShootingPlan);
router.post('/:id/reject', authMiddleware, ShootingController.rejectShootingPlan);
router.post('/:id/complete', authMiddleware, ShootingController.completeShootingPlan);
router.post('/:id/cancel', authMiddleware, ShootingController.cancelShootingPlan);

export default router;
