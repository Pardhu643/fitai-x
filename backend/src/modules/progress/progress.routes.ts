import { Router } from 'express';
import { progressController } from './progress.controller';
import { authenticate } from '../../middleware/authenticate.middleware';

export const progressRoutes = Router();

progressRoutes.use(authenticate);
progressRoutes.get('/', progressController.getProgress);
progressRoutes.post('/measurements', progressController.addBodyMeasurement);
progressRoutes.post('/workouts', progressController.addWorkoutHistory);
