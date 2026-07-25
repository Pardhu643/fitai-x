import { prisma } from '../../core/database/prisma';

export class NotificationIntegrationService {
  async triggerNotification(userId: string, type: string, title: string, message: string, actionUrl?: string) {
    // Avoid duplicate notifications in the last 2 hours
    const twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

    const duplicate = await prisma.notification.findFirst({
      where: {
        userId,
        type,
        title,
        createdAt: { gte: twoHoursAgo }
      }
    });

    if (duplicate) {
      console.log(`[Notification Integration] Suppressing duplicate notification: ${title}`);
      return;
    }

    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        actionUrl,
        read: false
      }
    });
  }

  async triggerMealPreparationReminder(userId: string, mealTitle: string) {
    await this.triggerNotification(
      userId,
      'MEAL_PREP_REMINDER',
      'Meal Prep Reminder',
      `Time to prep your scheduled meal: ${mealTitle}. Stay aligned with your macro targets!`,
      '/meal-planner'
    );
  }

  async triggerHydrationReminder(userId: string) {
    await this.triggerNotification(
      userId,
      'HYDRATION_REMINDER',
      'Hydration Reminder',
      'Make sure to log your water consumption today. Hit your daily target ml hydration!',
      '/nutrition'
    );
  }

  async triggerGroceryReminder(userId: string) {
    await this.triggerNotification(
      userId,
      'GROCERY_REMINDER',
      'Grocery Shopping',
      'You have unchecked items on your active grocery list. Head to the store and mark them off!',
      '/grocery-list'
    );
  }

  async triggerExpiringPlanReminder(userId: string) {
    await this.triggerNotification(
      userId,
      'MEAL_PLAN_EXPIRING',
      'Active Plan Ending Soon',
      'Your active meal plan is reaching its end date. Make sure to generate your next weekly schedule!',
      '/meal-planner'
    );
  }
}

export const notificationIntegrationService = new NotificationIntegrationService();
