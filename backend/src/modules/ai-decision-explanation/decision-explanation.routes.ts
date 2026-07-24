import { Router } from 'express';
import { decisionExplanationController } from './decision-explanation.controller';
import { authenticate } from '../../middleware/authenticate.middleware';

const router = Router();

router.get('/:id/explanations', authenticate, decisionExplanationController.getExplanations);

export { router as decisionExplanationRoutes };
