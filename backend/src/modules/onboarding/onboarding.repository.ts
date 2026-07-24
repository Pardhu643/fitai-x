import { prisma } from '../../core/database/prisma';
import { OnboardingData } from './onboarding.types';
import { NotFoundError } from '../../core/errors/AppError';

export class OnboardingRepository {
  async completeOnboarding(userId: string, data: OnboardingData) {
    return prisma.$transaction(async (tx: any) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          age: data.personal.age,
          gender: data.personal.gender,
          heightCm: data.personal.heightCm,
          weightKg: data.personal.weightKg,
          fitnessLevel: data.fitness.fitnessLevel,
          hasCompletedOnboarding: true,
        },
      });

      await tx.userPreferences.upsert({
        where: { userId },
        create: {
          userId,
          dietType: data.diet.dietType,
          budget: data.diet.budget,
          cookingSkill: data.diet.cookingSkill,
          preferredTime: data.schedule.preferredTime,
          workoutDaysPerWeek: data.schedule.workoutDaysPerWeek,
          workoutDurationMinutes: data.schedule.workoutDurationMinutes,
        },
        update: {
          dietType: data.diet.dietType,
          budget: data.diet.budget,
          cookingSkill: data.diet.cookingSkill,
          preferredTime: data.schedule.preferredTime,
          workoutDaysPerWeek: data.schedule.workoutDaysPerWeek,
          workoutDurationMinutes: data.schedule.workoutDurationMinutes,
        },
      });

      for (const equipmentType of data.equipment.equipment) {
        const equipment = await tx.equipment.findFirst({
          where: { type: equipmentType },
        });

        if (equipment) {
          await tx.userEquipment.upsert({
            where: {
              userId_equipmentId: {
                userId,
                equipmentId: equipment.id,
              },
            },
            create: {
              userId,
              equipmentId: equipment.id,
            },
            update: {},
          });
        }
      }

      for (const injury of data.medical.injuries) {
        await tx.injury.create({
          data: {
            userId,
            type: injury.type,
            details: injury.details,
          },
        });
      }

      return user;
    }, { timeout: 20000, maxWait: 20000 });
  }

  async getOnboardingStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        hasCompletedOnboarding: true,
        age: true,
        gender: true,
        heightCm: true,
        weightKg: true,
        fitnessLevel: true,
        userPreferences: true,
        userEquipments: {
          include: {
            equipment: true,
          },
        },
        injuries: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }
}

export const onboardingRepository = new OnboardingRepository();
