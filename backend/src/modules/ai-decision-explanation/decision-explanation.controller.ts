import { Request, Response } from 'express';
import { decisionExplanationService } from './decision-explanation.service';
import { AuthRequest } from '../../middleware/authenticate.middleware';

export const decisionExplanationController = {
  getExplanations: async (req: Request, res: Response): Promise<any> => {
    const userId = (req as AuthRequest).user.userId;
    const { id: planId } = req.params;
    const explanations = await decisionExplanationService.getExplanations(planId, userId);

    return res.status(200).json({
      success: true,
      data: explanations,
    });
  },
};
