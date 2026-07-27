import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/database/prisma';

const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const goalsController = {
  getGoals: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ data: { goals } });
  }),

  createGoal: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const { targetWeightKg, targetBodyFat, targetDate } = req.body;

    const goal = await prisma.goal.create({
      data: {
        userId,
        targetWeightKg: targetWeightKg ? parseFloat(targetWeightKg) : null,
        targetBodyFat: targetBodyFat ? parseFloat(targetBodyFat) : null,
        targetDate: targetDate ? new Date(targetDate) : null,
        isAchieved: false
      }
    });
    return res.status(201).json({ data: { goal } });
  }),

  updateGoal: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const { id } = req.params;
    const { targetWeightKg, targetBodyFat, targetDate, isAchieved } = req.body;

    const goal = await prisma.goal.findFirst({ where: { id, userId } });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    const updated = await prisma.goal.update({
      where: { id },
      data: {
        targetWeightKg: targetWeightKg !== undefined ? parseFloat(targetWeightKg) : undefined,
        targetBodyFat: targetBodyFat !== undefined ? parseFloat(targetBodyFat) : undefined,
        targetDate: targetDate ? new Date(targetDate) : undefined,
        isAchieved: isAchieved !== undefined ? isAchieved : undefined
      }
    });
    return res.json({ data: { goal: updated } });
  }),

  deleteGoal: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const { id } = req.params;

    const goal = await prisma.goal.findFirst({ where: { id, userId } });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    await prisma.goal.delete({ where: { id } });
    return res.json({ success: true });
  })
};
