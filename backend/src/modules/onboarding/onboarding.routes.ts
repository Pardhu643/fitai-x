import { Router } from 'express';
import { onboardingController } from './onboarding.controller';
import { authenticate } from '../../middleware/authenticate.middleware';

const router = Router();

router.post('/', authenticate, onboardingController.completeOnboarding);
router.get('/status', authenticate, onboardingController.getOnboardingStatus);

export { router as onboardingRoutes };
