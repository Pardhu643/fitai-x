import { prisma } from '../../core/database/prisma';
import { NotFoundError } from '../../core/errors/AppError';
import { UpdateProfileInput, UserProfile } from './user.types';

export class UserRepository {
  async findById(id: string): Promise<UserProfile> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        age: true,
        gender: true,
        heightCm: true,
        weightKg: true,
        fitnessLevel: true,
        primaryGoal: true,
        profileImageUrl: true,
        hasCompletedOnboarding: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user as UserProfile;
  }

  async updateProfile(id: string, data: UpdateProfileInput): Promise<UserProfile> {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        age: true,
        gender: true,
        heightCm: true,
        weightKg: true,
        fitnessLevel: true,
        primaryGoal: true,
        profileImageUrl: true,
        hasCompletedOnboarding: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user as UserProfile;
  }
}

export const userRepository = new UserRepository();
