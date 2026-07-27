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
      
      const fatigueAssessment = await prisma.fatigueAssessment.findFirst({
        where: { userId },
        orderBy: { calculatedAt: 'desc' }
      });

      const injuryRiskAssessment = await prisma.injuryRiskAssessment.findFirst({
        where: { userId },
        orderBy: { calculatedAt: 'desc' }
      });

      const pendingRecommendations = await prisma.workoutRecommendation.findMany({
        where: { userId, status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        take: 5
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
        fatigueAssessment,
        injuryRiskAssessment,
        pendingRecommendations,
        nutritionProfile,
        nutritionTarget,
        activeMealPlan,
        activeGroceryList,
        todayMealLogs
      };
    }

    try {
      const reply = await geminiService.generateCoachResponse(activePrompt, context);
      
      // Simple response classification based on content
      // In future upgrades, this can be enhanced with AI-powered classification
      let responseType = 'general';
      let responseData = undefined;

      const lowerPrompt = activePrompt.toLowerCase();
      if (lowerPrompt.includes('workout') || lowerPrompt.includes('exercise') || lowerPrompt.includes('training')) {
        if (lowerPrompt.includes('exercise')) {
          responseType = 'exercise';
          responseData = { name: 'Recommended Exercise', sets: 3, reps: 12, muscle: 'Full Body' };
        } else {
          responseType = 'workout';
          // Return multi-day workout structure
          responseData = {
            name: 'Full Body Strength Plan',
            daysPerWeek: 3,
            workoutDays: [
              {
                dayOfWeek: 0,
                name: 'Monday',
                focus: 'Chest & Triceps',
                durationMinutes: 45,
                exercises: [
                  { name: 'Push Ups', sets: 3, reps: 12, restSeconds: 60, muscleGroup: 'Chest' },
                  { name: 'Incline Dumbbell Press', sets: 3, reps: 10, restSeconds: 60, muscleGroup: 'Chest' },
                  { name: 'Tricep Dips', sets: 3, reps: 12, restSeconds: 60, muscleGroup: 'Triceps' },
                  { name: 'Chest Fly', sets: 3, reps: 12, restSeconds: 60, muscleGroup: 'Chest' }
                ]
              },
              {
                dayOfWeek: 2,
                name: 'Wednesday',
                focus: 'Back & Biceps',
                durationMinutes: 45,
                exercises: [
                  { name: 'Pull Ups', sets: 3, reps: 10, restSeconds: 60, muscleGroup: 'Back' },
                  { name: 'Barbell Rows', sets: 3, reps: 10, restSeconds: 60, muscleGroup: 'Back' },
                  { name: 'Bicep Curls', sets: 3, reps: 12, restSeconds: 45, muscleGroup: 'Biceps' },
                  { name: 'Hammer Curls', sets: 3, reps: 12, restSeconds: 45, muscleGroup: 'Biceps' }
                ]
              },
              {
                dayOfWeek: 4,
                name: 'Friday',
                focus: 'Legs & Shoulders',
                durationMinutes: 45,
                exercises: [
                  { name: 'Squats', sets: 3, reps: 12, restSeconds: 90, muscleGroup: 'Legs' },
                  { name: 'Lunges', sets: 3, reps: 10, restSeconds: 60, muscleGroup: 'Legs' },
                  { name: 'Shoulder Press', sets: 3, reps: 12, restSeconds: 60, muscleGroup: 'Shoulders' },
                  { name: 'Lateral Raises', sets: 3, reps: 12, restSeconds: 45, muscleGroup: 'Shoulders' }
                ]
              }
            ]
          };
        }
      } else if (lowerPrompt.includes('meal') || lowerPrompt.includes('food') || lowerPrompt.includes('eat') || lowerPrompt.includes('nutrition')) {
        responseType = 'meal';
        responseData = { name: 'Recommended Meal', calories: 500, protein: 30, carbs: 50, fat: 15 };
      } else if (lowerPrompt.includes('grocery') || lowerPrompt.includes('shopping') || lowerPrompt.includes('buy')) {
        responseType = 'grocery';
        responseData = { items: [{ name: 'Chicken Breast', quantity: '500g', category: 'Protein' }], totalItems: 1 };
      } else if (lowerPrompt.includes('habit') || lowerPrompt.includes('routine')) {
        responseType = 'habit';
        responseData = { habit: 'Daily Stretching', frequency: 'Daily', duration: '10 minutes', bestTime: 'Morning' };
      } else if (lowerPrompt.includes('goal') || lowerPrompt.includes('target')) {
        responseType = 'goal';
        responseData = { goal: 'Weight Loss', target: '75 kg', deadline: '3 months', progress: 25 };
      } else if (lowerPrompt.includes('recovery') || lowerPrompt.includes('sore') || lowerPrompt.includes('rest')) {
        responseType = 'recovery';
        responseData = { activity: 'Light Stretching', duration: '15 minutes', intensity: 'Low', benefit: 'Reduces muscle tension' };
      } else if (lowerPrompt.includes('calendar') || lowerPrompt.includes('schedule') || lowerPrompt.includes('event')) {
        responseType = 'calendar';
        responseData = { event: 'Workout Session', date: 'Tomorrow', time: '6:00 PM', type: 'Workout' };
      } else if (lowerPrompt.includes('progress') || lowerPrompt.includes('track') || lowerPrompt.includes('stats')) {
        responseType = 'progress';
        responseData = { metric: 'Weight Loss', value: '2.5 kg', change: '+0.5 kg', trend: 'Positive', timeframe: 'This week' };
      }

      return res.json({ 
        data: { 
          reply, 
          type: responseType,
          data: responseData
        } 
      });
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
