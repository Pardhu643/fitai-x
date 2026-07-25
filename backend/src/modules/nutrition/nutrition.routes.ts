import { Router } from 'express';
import { nutritionController } from './nutrition.controller';
import { authenticate } from '../../middleware/authenticate.middleware';

export const nutritionRoutes = Router();

// Apply auth to all endpoints
nutritionRoutes.use(authenticate);

nutritionRoutes.get('/nutrition/profile', nutritionController.getProfile);
nutritionRoutes.put('/nutrition/profile', nutritionController.updateProfile);

nutritionRoutes.get('/nutrition/targets', nutritionController.getTargets);
nutritionRoutes.post('/nutrition/targets/calculate', nutritionController.calculateTargets);
