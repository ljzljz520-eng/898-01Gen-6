import { Router } from 'express';
import { ScheduleController } from '../controllers/ScheduleController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, ScheduleController.getSchedules);
router.post('/', authMiddleware, ScheduleController.createSchedule);
router.get('/:id', authMiddleware, ScheduleController.getScheduleById);
router.put('/:id', authMiddleware, ScheduleController.updateSchedule);
router.delete('/:id', authMiddleware, ScheduleController.deleteSchedule);

export default router;
