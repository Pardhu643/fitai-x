import { Request, Response } from 'express';
import { dashboardService } from './dashboard.service';
import { AuthRequest } from '../../middleware/authenticate.middleware';

export const dashboardController = {
  getDashboard: async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthRequest).user.userId;
    const data = await dashboardService.getDashboard(userId);

    res.status(200).json({
      success: true,
      data,
    });
  },
};
