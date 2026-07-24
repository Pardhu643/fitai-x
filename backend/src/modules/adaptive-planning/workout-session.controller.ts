import { Request, Response } from 'express';
import { workoutSessionService } from './workout-session.service';
import { AuthRequest } from '../../middleware/authenticate.middleware';

export const workoutSessionController = {
  startSession: async (req: Request, res: Response): Promise<any> => {
    const userId = (req as AuthRequest).user.userId;
    const { workoutDayId } = req.body;
    
    if (!workoutDayId) {
      return res.status(400).json({ success: false, message: 'workoutDayId is required' });
      return;
    }

    const session = await workoutSessionService.startSession(userId, workoutDayId);

    return res.status(201).json({
      success: true,
      message: 'Workout session started',
      data: session,
    });
  },

  completeSession: async (req: Request, res: Response): Promise<any> => {
    const userId = (req as AuthRequest).user.userId;
    const { id } = req.params;
    const { perceivedDifficulty, notes, durationMinutes } = req.body;

    if (perceivedDifficulty === undefined) {
      return res.status(400).json({ success: false, message: 'perceivedDifficulty is required' });
      return;
    }

    const session = await workoutSessionService.completeSession(id, userId, {
      perceivedDifficulty,
      notes,
      durationMinutes,
    });

    return res.status(200).json({
      success: true,
      message: 'Workout session completed',
      data: session,
    });
  },
};
