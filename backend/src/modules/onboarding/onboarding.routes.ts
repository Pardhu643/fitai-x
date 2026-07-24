import { Router } from 'express';
import { onboardingController } from './onboarding.controller';
import { authenticate } from '../../middleware/authenticate.middleware';
import { asyncHandler } from '../../shared/utilities';

const router = Router();

router.post('/', authenticate, asyncHandler(onboardingController.completeOnboarding));
router.get('/status', authenticate, asyncHandler(onboardingController.getOnboardingStatus));

export { router as onboardingRoutes };
