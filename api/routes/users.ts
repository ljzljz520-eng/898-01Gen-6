import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, UserController.getUsers);
router.get('/cancellations', authMiddleware, UserController.getCancellationRecords);
router.get('/:id', authMiddleware, UserController.getUserById);
router.put('/profile', authMiddleware, UserController.updateProfile);

export default router;
