import { prisma } from '../../core/database/prisma';

export class CalendarIntegrationService {
  async syncMealPlanEvents(userId: string, mealPlanId: string) {
    const plan = await prisma.mealPlan.findUnique({
      where: { id: mealPlanId },
      include: {
        days: {
          include: {
            meals: true
          }
        }
      }
    });

    if (!plan) return;

    // Delete existing MEAL/GROCERY events for this meal plan's time range
    await prisma.calendarEvent.deleteMany({
      where: {
        userId,
        type: { in: ['MEAL', 'GROCERY'] },
        startTime: {
          gte: plan.startDate,
          lte: plan.endDate
        }
      }
    });

    const eventsData: any[] = [];

    // Create MEAL events based on preferred hours
    const mealHours: Record<string, number> = {
      BREAKFAST: 8,
      LUNCH: 13,
      SNACK: 16,
      DINNER: 19
    };

    plan.days.forEach(day => {
      day.meals.forEach(meal => {
        const hour = mealHours[meal.mealType] || 12;
        
        const startTime = new Date(day.date);
        startTime.setHours(hour, 0, 0, 0);

        const endTime = new Date(day.date);
        endTime.setHours(hour + 1, 0, 0, 0);

        eventsData.push({
          userId,
          title: `Meal: ${meal.title} (${meal.mealType})`,
          description: `Prep: ${meal.preparationMinutes}m, Cook: ${meal.cookingMinutes}m. Target: ${meal.calories} kcal.`,
          type: 'MEAL',
          startTime,
          endTime,
          allDay: false,
          status: 'SCHEDULED',
          reminderMinutes: 15
        });
      });
    });

    // Create a GROCERY shopping reminder on the start date
    const groceryTime = new Date(plan.startDate);
    groceryTime.setHours(10, 0, 0, 0); // 10:00 AM

    const groceryEndTime = new Date(plan.startDate);
    groceryEndTime.setHours(11, 0, 0, 0);

    eventsData.push({
      userId,
      title: `Grocery Shopping: ${plan.title}`,
      description: `Shop ingredients for the newly active meal plan.`,
      type: 'GROCERY',
      startTime: groceryTime,
      endTime: groceryEndTime,
      allDay: false,
      status: 'SCHEDULED',
      reminderMinutes: 30
    });

    if (eventsData.length > 0) {
      await prisma.calendarEvent.createMany({
        data: eventsData
      });
    }
  }

  async removeMealPlanEvents(userId: string, startDate: Date, endDate: Date) {
    await prisma.calendarEvent.deleteMany({
      where: {
        userId,
        type: { in: ['MEAL', 'GROCERY'] },
        startTime: {
          gte: startDate,
          lte: endDate
        }
      }
    });
  }
}

export const calendarIntegrationService = new CalendarIntegrationService();
