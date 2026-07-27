import { Router } from 'express';
import { goalsController } from './goals.controller';
import { authenticate } from '../../middleware/authenticate.middleware';

export const goalsRoutes = Router();

goalsRoutes.use(authenticate);
goalsRoutes.get('/', goalsController.getGoals);
goalsRoutes.post('/', goalsController.createGoal);
goalsRoutes.put('/:id', goalsController.updateGoal);
goalsRoutes.delete('/:id', goalsController.deleteGoal);
