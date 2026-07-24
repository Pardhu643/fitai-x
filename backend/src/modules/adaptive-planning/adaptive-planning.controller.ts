import { Request, Response } from 'express';
import { adaptivePlanningService } from './adaptive-planning.service';
import { AuthRequest } from '../../middleware/authenticate.middleware';

export const adaptivePlanningController = {
  generatePlan: async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthRequest).user.userId;
    const plan = await adaptivePlanningService.generatePlan(userId);

    res.status(201).json({
      success: true,
      message: 'Workout plan generated successfully',
      data: plan,
    });
  },

  getPlans: async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthRequest).user.userId;
    const plans = await adaptivePlanningService.getPlans(userId);

    res.status(200).json({
      success: true,
      data: plans,
    });
  },

  getCurrentPlan: async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthRequest).user.userId;
    const plan = await adaptivePlanningService.getCurrentPlan(userId);

    res.status(200).json({
      success: true,
      data: plan,
    });
  },

  getPlanById: async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthRequest).user.userId;
    const { id } = req.params;
    const plan = await adaptivePlanningService.getPlanById(id, userId);

    res.status(200).json({
      success: true,
      data: plan,
    });
  },
};
