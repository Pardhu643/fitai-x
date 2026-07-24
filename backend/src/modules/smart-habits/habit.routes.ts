import { Router } from 'express';
import { habitController } from './habit.controller';
import { authenticate } from '../../middleware/authenticate.middleware';

export const habitRoutes = Router();

habitRoutes.use(authenticate);
habitRoutes.get('/', habitController.getHabits);
habitRoutes.post('/', habitController.createHabit);
habitRoutes.delete('/:id', habitController.deleteHabit);
habitRoutes.post('/:id/log', habitController.logHabit);
habitRoutes.post('/:id/complete', habitController.completeHabit);
habitRoutes.get('/:id/streak', habitController.getStreak);
