import { prisma } from '../../core/database/prisma';
import { RegisterInput } from './auth.types';
import { ConflictError, NotFoundError } from '../../core/errors/AppError';

export class AuthRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
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

    return user;
  }

  async create(data: RegisterInput, passwordHash: string) {
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        hasCompletedOnboarding: true,
      },
    });
  }
}

export const authRepository = new AuthRepository();
