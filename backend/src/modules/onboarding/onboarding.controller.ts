import { Request, Response } from 'express';
import { onboardingService } from './onboarding.service';
import { onboardingSchema } from './onboarding.validation';
import { AuthRequest } from '../../middleware/authenticate.middleware';

export const onboardingController = {
  completeOnboarding: async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthRequest).user.userId;
    const data = await onboardingSchema.parseAsync(req.body);
    await onboardingService.completeOnboarding(userId, data);

    res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully',
      data: {
        userId,
        hasCompletedOnboarding: true,
      },
    });
  },

  getOnboardingStatus: async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthRequest).user.userId;
    const status = await onboardingService.getOnboardingStatus(userId);

    res.status(200).json({
      success: true,
      data: status,
    });
  },
};
