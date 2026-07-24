import { Request, Response } from 'express';
import { recoveryScoreService } from './recovery-score.service';
import { createRecoverySchema } from './recovery-score.validation';
import { AuthRequest } from '../../middleware/authenticate.middleware';

export const recoveryScoreController = {
  createEntry: async (req: Request, res: Response): Promise<any> => {
    const userId = (req as AuthRequest).user.userId;
    const validatedData = await createRecoverySchema.parseAsync(req.body);
    const entry = await recoveryScoreService.createEntry(userId, validatedData);

    return res.status(201).json({
      success: true,
      message: 'Recovery entry logged successfully',
      data: entry,
    });
  },

  getLatestEntry: async (req: Request, res: Response): Promise<any> => {
    const userId = (req as AuthRequest).user.userId;
    const entry = await recoveryScoreService.getLatestEntry(userId);

    return res.status(200).json({
      success: true,
      data: entry,
    });
  },
};
