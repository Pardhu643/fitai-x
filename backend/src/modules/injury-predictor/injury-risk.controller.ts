import { Request, Response } from 'express';
import { injuryRiskService } from './injury-risk.service';
import { calculateInjuryRiskSchema } from './injury-risk.validation';
import { AuthRequest } from '../../middleware/authenticate.middleware';

export const injuryRiskController = {
  calculateInjuryRisk: async (req: Request, res: Response): Promise<any> => {
    const userId = (req as AuthRequest).user.userId;
    const data = await calculateInjuryRiskSchema.parseAsync(req.body);
    const assessment = await injuryRiskService.calculateInjuryRisk(userId, data);

    return res.status(200).json({
      success: true,
      message: 'Injury risk assessment calculated successfully',
      data: assessment,
    });
  },

  getCurrentInjuryRisk: async (req: Request, res: Response): Promise<any> => {
    const userId = (req as AuthRequest).user.userId;
    const assessment = await injuryRiskService.getCurrentInjuryRisk(userId);

    if (!assessment) {
      return res.status(200).json({
        success: true,
        message: 'No injury risk assessment found',
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      data: assessment,
    });
  },

  getInjuryRiskHistory: async (req: Request, res: Response): Promise<any> => {
    const userId = (req as AuthRequest).user.userId;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const history = await injuryRiskService.getInjuryRiskHistory(userId, limit);

    return res.status(200).json({
      success: true,
      data: history,
    });
  },

  getInjuryRiskById: async (req: Request, res: Response): Promise<any> => {
    const userId = (req as AuthRequest).user.userId;
    const { id } = req.params;
    const assessment = await injuryRiskService.getInjuryRiskById(id, userId);

    return res.status(200).json({
      success: true,
      data: assessment,
    });
  },
};
