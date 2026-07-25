import { Request, Response, NextFunction } from 'express';
import { geminiService } from '../../services/ai/gemini.service';
import { prisma } from '../../core/database/prisma';

const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const coachController = {
  chat: asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { prompt, message } = req.body;
    const activePrompt = prompt || message;
    const userId = (req as any).user?.userId || (req as any).user?.id; // fallback based on auth middleware shape

    if (!activePrompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    let context = {};
    if (userId) {
      const userProfile = await prisma.user.findUnique({ where: { id: userId } });
      const currentPlan = await prisma.workoutPlan.findFirst({
        where: { userId, status: 'ACTIVE' },
      });
      const recoveryScore = await prisma.recoveryEntry.findFirst({
        where: { userId },
        orderBy: { date: 'desc' }
      });
      
      const nutritionProfile = await prisma.nutritionProfile.findUnique({ where: { userId } });
      const nutritionTarget = await prisma.nutritionTarget.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });
      const activeMealPlan = await prisma.mealPlan.findFirst({
        where: { userId, status: 'ACTIVE' },
        include: {
          days: {
            include: { meals: { include: { ingredients: true } } },
            orderBy: { date: 'asc' }
          }
        }
      });
      const activeGroceryList = await prisma.groceryList.findFirst({
        where: { userId, status: 'ACTIVE' },
        include: { items: true }
      });
      const todayMealLogs = await prisma.mealLog.findMany({
        where: {
          userId,
          createdAt: {
            gte: (() => {
              const d = new Date();
              d.setHours(0,0,0,0);
              return d;
            })()
          }
        },
        include: { meal: true }
      });

      context = { 
        userProfile, 
        currentPlan, 
        recoveryScore,
        nutritionProfile,
        nutritionTarget,
        activeMealPlan,
        activeGroceryList,
        todayMealLogs
      };
    }

    try {
      const reply = await geminiService.generateCoachResponse(activePrompt, context);
      return res.json({ data: { reply } });
    } catch (err: any) {
      console.error('Error in Coach controller chat:', err);
      const errMsg = err.message || '';
      
      if (
        errMsg.includes('API key') || 
        errMsg.includes('API_KEY_INVALID') || 
        errMsg.includes('key not valid') ||
        (err.status === 400 && errMsg.includes('API key'))
      ) {
        return res.status(503).json({
          success: false,
          code: 'AI_PROVIDER_BUSY',
          message: 'AI Coach is temporarily offline (API key not configured)'
        });
      }
      
      return res.status(503).json({
        success: false,
        code: 'AI_PROVIDER_BUSY',
        message: 'Rachel is receiving heavy traffic right now. Please retry in a moment.'
      });
    }
  }),

  status: asyncHandler(async (_req: Request, res: Response): Promise<any> => {
    const isConfigured = !!process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-flash-latest';
    return res.json({
      success: true,
      configured: isConfigured,
      provider: 'Gemini',
      model: model,
      reachable: isConfigured
    });
  })
};
