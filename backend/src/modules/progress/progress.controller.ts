import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/database/prisma';

const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const progressController = {
  getProgress: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || (req as any).user?.id;

    // Get workout history
    const workoutHistory = await prisma.workoutHistory.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: 20
    });

    // Get body measurements
    const bodyMeasurements = await prisma.bodyMeasurement.findMany({
      where: { userId },
      orderBy: { measuredAt: 'desc' },
      take: 10
    });

    // Get goals
    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate summary stats
    const totalWorkouts = workoutHistory.length;
    const totalMinutes = workoutHistory.reduce((sum, w) => sum + w.durationMinutes, 0);
    const totalCalories = workoutHistory.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
    const avgRating = workoutHistory.filter(w => w.rating !== null).length > 0
      ? workoutHistory.filter(w => w.rating !== null).reduce((sum, w) => sum + (w.rating || 0), 0) / workoutHistory.filter(w => w.rating !== null).length
      : null;

    const latestMeasurement = bodyMeasurements[0] || null;

    return res.json({
      data: {
        workoutHistory,
        bodyMeasurements,
        goals,
        summary: {
          totalWorkouts,
          totalMinutes,
          totalCalories,
          avgRating,
          latestMeasurement
        }
      }
    });
  }),

  addBodyMeasurement: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const { weightKg, bodyFatPercent, chestCm, waistCm, hipsCm, bicepsCm, thighsCm } = req.body;

    const measurement = await prisma.bodyMeasurement.create({
      data: {
        userId,
        weightKg: parseFloat(weightKg),
        bodyFatPercent: bodyFatPercent ? parseFloat(bodyFatPercent) : null,
        chestCm: chestCm ? parseFloat(chestCm) : null,
        waistCm: waistCm ? parseFloat(waistCm) : null,
        hipsCm: hipsCm ? parseFloat(hipsCm) : null,
        bicepsCm: bicepsCm ? parseFloat(bicepsCm) : null,
        thighsCm: thighsCm ? parseFloat(thighsCm) : null
      }
    });

    return res.status(201).json({ data: { measurement } });
  }),

  addWorkoutHistory: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const { workoutPlanId, workoutDayId, durationMinutes, caloriesBurned, notes, rating } = req.body;

    const history = await prisma.workoutHistory.create({
      data: {
        userId,
        workoutPlanId,
        workoutDayId,
        durationMinutes: parseInt(durationMinutes),
        caloriesBurned: caloriesBurned ? parseInt(caloriesBurned) : null,
        notes,
        rating: rating ? parseInt(rating) : null
      }
    });

    return res.status(201).json({ data: { history } });
  })
};
