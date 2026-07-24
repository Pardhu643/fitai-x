import { Router } from 'express';
import { adaptivePlanningController } from './adaptive-planning.controller';
import { authenticate } from '../../middleware/authenticate.middleware';

const router = Router();

router.post('/generate', authenticate, adaptivePlanningController.generatePlan);
router.get('/', authenticate, adaptivePlanningController.getPlans);
router.get('/current', authenticate, adaptivePlanningController.getCurrentPlan);
router.get('/:id', authenticate, adaptivePlanningController.getPlanById);

export { router as adaptivePlanningRoutes };
