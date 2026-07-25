import { Router } from 'express';
import { fatigueController } from './fatigue.controller';
import { authenticate } from '../../middleware/authenticate.middleware';

const router = Router();

// All fatigue routes require authentication
router.use(authenticate);

router.post('/calculate', fatigueController.calculateFatigue);
router.get('/current', fatigueController.getCurrentFatigue);
router.get('/history', fatigueController.getFatigueHistory);
router.get('/:id', fatigueController.getFatigueById);

export const fatigueRoutes = router;
