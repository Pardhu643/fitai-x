import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate } from '../../middleware/authenticate.middleware';

const router = Router();

router.get('/profile', authenticate, userController.getProfile);
router.patch('/profile', authenticate, userController.updateProfile);

export { router as userRoutes };
