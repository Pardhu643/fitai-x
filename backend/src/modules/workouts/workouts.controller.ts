import { Request, Response } from 'express';
import { workoutService } from './workouts.service';
import { completeWorkoutSchema, generateWorkoutSchema } from './workouts.validation';
import { AuthRequest } from '../../middleware/authenticate.middleware';

export const workoutController = {
  getWorkouts: async (req: Request, res: Response): Promise<any> => {
    const userId = (req as AuthRequest).user.userId;
    const plans = await workoutService.getWorkoutPlans(userId);

    return res.status(200).json({
      success: true,
      data: plans,
    });
  },

  getWorkoutById: async (req: Request, res: Response): Promise<any> => {
    const userId = (req as AuthRequest).user.userId;
    const { id } = req.params;
    const plan = await workoutService.getWorkoutPlanById(id, userId);

    return res.status(200).json({
      success: true,
      data: plan,
    });
  },

  generateWorkout: async (req: Request, res: Response): Promise<any> => {
    const userId = (req as AuthRequest).user.userId;
    const data = await generateWorkoutSchema.parseAsync(req.body);
    const plan = await workoutService.generateWorkout(userId, data);

    return res.status(201).json({
      success: true,
      message: 'Workout plan generated successfully',
      data: plan,
    });
  },

  getHistory: async (req: Request, res: Response): Promise<any> => {
    const userId = (req as AuthRequest).user.userId;
    const history = await workoutService.getWorkoutHistory(userId);

    return res.status(200).json({
      success: true,
      data: history,
    });
  },

  getHistoryById: async (req: Request, res: Response): Promise<any> => {
    const userId = (req as AuthRequest).user.userId;
    const { id } = req.params;
    const history = await workoutService.getWorkoutHistoryById(id, userId);

    return res.status(200).json({
      success: true,
      data: history,
    });
  },

  completeWorkout: async (req: Request, res: Response): Promise<any> => {
    const userId = (req as AuthRequest).user.userId;
    const data = await completeWorkoutSchema.parseAsync(req.body);
    const history = await workoutService.completeWorkout(userId, data);

    return res.status(201).json({
      success: true,
      message: 'Workout completed successfully',
      data: history,
    });
  },

  setActivePlan: async (req: Request, res: Response): Promise<any> => {
    const userId = (req as AuthRequest).user.userId;
    const { id } = req.params;
    await workoutService.setActivePlan(userId, id);

    return res.status(200).json({
      success: true,
      message: 'Active plan updated successfully',
    });
  },
};
