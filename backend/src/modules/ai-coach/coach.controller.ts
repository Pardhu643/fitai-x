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
      
      context = { userProfile, currentPlan, recoveryScore };
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
        return res.status(503).json({ error: 'AI Coach is temporarily offline (API key not configured)' });
      }
      return res.status(503).json({ error: 'Rachel is temporarily unavailable. Please try again shortly.' });
    }
  })
};
