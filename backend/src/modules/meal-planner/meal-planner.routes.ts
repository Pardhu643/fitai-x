import { Router } from 'express';
import { mealPlannerController } from './meal-planner.controller';
import { authenticate } from '../../middleware/authenticate.middleware';

export const mealPlannerRoutes = Router();

// Apply authentication to all endpoints
mealPlannerRoutes.use(authenticate);

mealPlannerRoutes.post('/meal-plans/generate', mealPlannerController.generatePlan);
mealPlannerRoutes.get('/meal-plans', mealPlannerController.getPlansList);
mealPlannerRoutes.get('/meal-plans/current', mealPlannerController.getCurrentPlan);
mealPlannerRoutes.get('/meal-plans/:mealPlanId', mealPlannerController.getPlanById);
mealPlannerRoutes.delete('/meal-plans/:mealPlanId', mealPlannerController.deletePlan);
mealPlannerRoutes.post('/meal-plans/:mealPlanId/regenerate', mealPlannerController.regeneratePlan);

mealPlannerRoutes.post('/meals/:mealId/replace', mealPlannerController.replaceMealOption);
mealPlannerRoutes.post('/meals/:mealId/log', mealPlannerController.logMealConsumption);
mealPlannerRoutes.get('/meals/logs', mealPlannerController.getMealLogsList);
