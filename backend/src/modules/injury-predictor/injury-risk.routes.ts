import { Router } from 'express';
import { injuryRiskController } from './injury-risk.controller';
import { authenticate } from '../../middleware/authenticate.middleware';

const router = Router();

// All injury-risk routes require authentication
router.use(authenticate);

router.post('/calculate', injuryRiskController.calculateInjuryRisk);
router.get('/current', injuryRiskController.getCurrentInjuryRisk);
router.get('/history', injuryRiskController.getInjuryRiskHistory);
router.get('/:id', injuryRiskController.getInjuryRiskById);

export const injuryRiskRoutes = router;
