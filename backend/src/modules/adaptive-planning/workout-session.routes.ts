import { Router } from 'express';
import { workoutSessionController } from './workout-session.controller';
import { authenticate } from '../../middleware/authenticate.middleware';

const router = Router();

router.post('/', authenticate, workoutSessionController.startSession);
router.patch('/:id/complete', authenticate, workoutSessionController.completeSession);

export { router as workoutSessionRoutes };
