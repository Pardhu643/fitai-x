import { Router } from 'express';
import { workoutController } from './workouts.controller';
import { authenticate } from '../../middleware/authenticate.middleware';

const router = Router();

router.get('/', authenticate, workoutController.getWorkouts);
router.post('/generate', authenticate, workoutController.generateWorkout);
router.post('/from-ai', authenticate, workoutController.createFromAi);
router.get('/:id', authenticate, workoutController.getWorkoutById);
router.patch('/:id/active', authenticate, workoutController.setActivePlan);
router.get('/history/all', authenticate, workoutController.getHistory);
router.get('/history/:id', authenticate, workoutController.getHistoryById);
router.post('/history', authenticate, workoutController.completeWorkout);

export { router as workoutRoutes };
