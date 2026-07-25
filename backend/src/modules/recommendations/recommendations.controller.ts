import { Request, Response } from 'express';
import { recommendationsService } from './recommendations.service';
import { generateProgressiveOverloadSchema } from './recommendations.validation';
import { AuthRequest } from '../../middleware/authenticate.middleware';

export const recommendationsController = {
  generateProgressiveOverload: async (req: Request, res: Response): Promise<any> => {
    const userId = (req as AuthRequest).user.userId;
    const data = await generateProgressiveOverloadSchema.parseAsync(req.body);
    const recommendation = await recommendationsService.generateProgressiveOverloadRecommendation(
      userId,
      data.exerciseId,
      data.currentSets,
      data.currentReps,
      data.currentWeight
    );

    return res.status(201).json({
      success: true,
      message: 'Progressive overload recommendation generated',
      data: recommendation,
    });
  },

  generateDeload: async (req: Request, res: Response): Promise<any> => {
    const userId = (req as AuthRequest).user.userId;
    const recommendation = await recommendationsService.generateDeloadRecommendation(userId);

    if (!recommendation) {
      return res.status(200).json({
        success: true,
        message: 'No deload recommendation needed at this time',
        data: null,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Deload recommendation generated',
      data: recommendation,
    });
  },

  getPendingRecommendations: async (req: Request, res: Response): Promise<any> => {
    const userId = (req as AuthRequest).user.userId;
    const recommendations = await recommendationsService.getPendingRecommendations(userId);

    return res.status(200).json({
      success: true,
      data: recommendations,
    });
  },

  getAllRecommendations: async (req: Request, res: Response): Promise<any> => {
    const userId = (req as AuthRequest).user.userId;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const recommendations = await recommendationsService.getAllRecommendations(userId, limit);

    return res.status(200).json({
      success: true,
      data: recommendations,
    });
  },

  getRecommendationById: async (req: Request, res: Response): Promise<any> => {
    const userId = (req as AuthRequest).user.userId;
    const { id } = req.params;
    const recommendation = await recommendationsService.getRecommendationById(userId, id);

    return res.status(200).json({
      success: true,
      data: recommendation,
    });
  },

  applyRecommendation: async (req: Request, res: Response): Promise<any> => {
    const userId = (req as AuthRequest).user.userId;
    const { id } = req.params;
    const recommendation = await recommendationsService.applyRecommendation(userId, id);

    return res.status(200).json({
      success: true,
      message: 'Recommendation applied successfully',
      data: recommendation,
    });
  },

  dismissRecommendation: async (req: Request, res: Response): Promise<any> => {
    const userId = (req as AuthRequest).user.userId;
    const { id } = req.params;
    const recommendation = await recommendationsService.dismissRecommendation(userId, id);

    return res.status(200).json({
      success: true,
      message: 'Recommendation dismissed',
      data: recommendation,
    });
  },
};
