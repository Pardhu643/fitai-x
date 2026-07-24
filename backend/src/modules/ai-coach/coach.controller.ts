import { Request, Response, NextFunction } from 'express';
import { geminiService } from '../../services/ai/gemini.service';
import { prisma } from '../../core/database/prisma';

const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const coachController = {
  chat: asyncHandler(async (req: Request, res: Response) => {
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
      return res.json({ reply });
    } catch (err: any) {
      if (err.message?.includes('API key')) {
        return res.status(503).json({ error: 'AI Coach is temporarily offline (API key not configured)' });
      }
      return res.status(500).json({ error: err.message || 'AI Coach error' });
    }
  })
};
