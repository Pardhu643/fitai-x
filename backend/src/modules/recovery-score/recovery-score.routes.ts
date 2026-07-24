import { Router } from 'express';
import { recoveryScoreController } from './recovery-score.controller';
import { authenticate } from '../../middleware/authenticate.middleware';

const router = Router();

router.post('/', authenticate, recoveryScoreController.createEntry);
router.get('/latest', authenticate, recoveryScoreController.getLatestEntry);

export { router as recoveryRoutes };
