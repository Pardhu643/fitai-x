import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/database/prisma';

const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const habitController = {
  getHabits: asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const habits = await prisma.habit.findMany({
      where: { userId },
      include: { logs: { orderBy: { logDate: 'desc' } } },
      orderBy: { createdAt: 'desc' }
    });

    const today = new Date();
    today.setUTCHours(0,0,0,0);

    const habitsWithStatus = habits.map(habit => {
      const completedToday = habit.logs.some(log => {
        const logDate = new Date(log.logDate);
        logDate.setUTCHours(0,0,0,0);
        return logDate.getTime() === today.getTime() && log.completed;
      });

      // Calculate streak
      let streak = 0;
      const completedLogs = habit.logs.filter(log => log.completed);
      if (completedLogs.length > 0) {
        const firstLogDate = new Date(completedLogs[0].logDate);
        firstLogDate.setUTCHours(0,0,0,0);
        const diffDays = Math.floor((today.getTime() - firstLogDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 1) {
          streak = 1;
          let expectedNextDate = new Date(firstLogDate);
          expectedNextDate.setDate(expectedNextDate.getDate() - 1);
          for (let i = 1; i < completedLogs.length; i++) {
            const logD = new Date(completedLogs[i].logDate);
            logD.setUTCHours(0,0,0,0);
            if (logD.getTime() === expectedNextDate.getTime()) {
              streak++;
              expectedNextDate.setDate(expectedNextDate.getDate() - 1);
            } else {
              break;
            }
          }
        }
      }

      return {
        ...habit,
        completedToday,
        streak,
        type: habit.category.toLowerCase()
      };
    });

    return res.json({ data: { habits: habitsWithStatus } });
  }),

  createHabit: asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const { name, description, category, type, targetValue, unit, frequency } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const resolvedCategory = (category || type || 'CUSTOM').toUpperCase();
    const resolvedTarget = targetValue !== undefined ? Number(targetValue) : 1;
    const resolvedUnit = unit || 'times';
    
    const habit = await prisma.habit.create({
      data: {
        userId,
        name,
        description: description || '',
        category: resolvedCategory,
        targetValue: resolvedTarget,
        unit: resolvedUnit,
        frequency: frequency || 'DAILY'
      }
    });

    return res.status(201).json({
      data: {
        habit: {
          ...habit,
          completedToday: false,
          streak: 0,
          type: habit.category.toLowerCase()
        }
      }
    });
  }),

  deleteHabit: asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const { id } = req.params;

    const habit = await prisma.habit.findFirst({ where: { id, userId } });
    if (!habit) return res.status(404).json({ error: 'Habit not found' });

    await prisma.habit.delete({ where: { id } });
    return res.json({ success: true });
  }),

  logHabit: asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const { id } = req.params;
    const { value, logDate, notes } = req.body;

    const habit = await prisma.habit.findFirst({ where: { id, userId } });
    if (!habit) return res.status(404).json({ error: 'Habit not found' });

    const completed = value >= habit.targetValue;
    const date = logDate ? new Date(logDate) : new Date();
    date.setUTCHours(0,0,0,0);

    const log = await prisma.habitLog.upsert({
      where: { habitId_logDate: { habitId: id, logDate: date } },
      update: { value, completed, notes },
      create: { habitId: id, userId, value, completed, logDate: date, notes }
    });
    
    return res.json({ data: { log } });
  }),

  completeHabit: asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const { id } = req.params;

    const habit = await prisma.habit.findFirst({ where: { id, userId } });
    if (!habit) return res.status(404).json({ error: 'Habit not found' });

    const date = new Date();
    date.setUTCHours(0,0,0,0);

    await prisma.habitLog.upsert({
      where: { habitId_logDate: { habitId: id, logDate: date } },
      update: { value: habit.targetValue, completed: true },
      create: { habitId: id, userId, value: habit.targetValue, completed: true, logDate: date }
    });

    return res.json({
      data: {
        habit: {
          ...habit,
          completedToday: true,
          streak: 1,
          type: habit.category.toLowerCase()
        }
      }
    });
  }),
  
  getStreak: asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const { id } = req.params;

    const habit = await prisma.habit.findFirst({ where: { id, userId } });
    if (!habit) return res.status(404).json({ error: 'Habit not found' });

    const logs = await prisma.habitLog.findMany({
      where: { habitId: id, completed: true },
      orderBy: { logDate: 'desc' }
    });

    let streak = 0;
    if (logs.length > 0) {
      const today = new Date();
      today.setUTCHours(0,0,0,0);
      let currentDate = today;
      
      const firstLogDate = new Date(logs[0].logDate);
      firstLogDate.setUTCHours(0,0,0,0);
      const diffDays = Math.floor((currentDate.getTime() - firstLogDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays > 1) {
        streak = 0;
      } else {
        streak = 1;
        let expectedNextDate = new Date(firstLogDate);
        expectedNextDate.setDate(expectedNextDate.getDate() - 1);
        
        for (let i = 1; i < logs.length; i++) {
          const logD = new Date(logs[i].logDate);
          logD.setUTCHours(0,0,0,0);
          if (logD.getTime() === expectedNextDate.getTime()) {
            streak++;
            expectedNextDate.setDate(expectedNextDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    return res.json({ streak });
  })
};
