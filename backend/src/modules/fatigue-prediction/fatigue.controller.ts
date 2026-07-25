import { Request, Response } from 'express';
import { fatigueService } from './fatigue.service';
import { calculateFatigueSchema } from './fatigue.validation';
import { AuthRequest } from '../../middleware/authenticate.middleware';

export const fatigueController = {
  calculateFatigue: async (req: Request, res: Response): Promise<any> => {
    const userId = (req as AuthRequest).user.userId;
    const data = await calculateFatigueSchema.parseAsync(req.body);
    const assessment = await fatigueService.calculateFatigue(userId, data);

    return res.status(200).json({
      success: true,
      message: 'Fatigue assessment calculated successfully',
      data: assessment,
    });
  },

  getCurrentFatigue: async (req: Request, res: Response): Promise<any> => {
    const userId = (req as AuthRequest).user.userId;
    const assessment = await fatigueService.getCurrentFatigue(userId);

    if (!assessment) {
      return res.status(200).json({
        success: true,
        message: 'No fatigue assessment found',
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      data: assessment,
    });
  },

  getFatigueHistory: async (req: Request, res: Response): Promise<any> => {
    const userId = (req as AuthRequest).user.userId;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const history = await fatigueService.getFatigueHistory(userId, limit);

    return res.status(200).json({
      success: true,
      data: history,
    });
  },

  getFatigueById: async (req: Request, res: Response): Promise<any> => {
    const userId = (req as AuthRequest).user.userId;
    const { id } = req.params;
    const assessment = await fatigueService.getFatigueById(id, userId);

    return res.status(200).json({
      success: true,
      data: assessment,
    });
  },
};
