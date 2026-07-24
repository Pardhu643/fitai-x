import { prisma } from '../../core/database/prisma';

export class VersionControlRepository {
  async createSnapshot(planId: string, version: number, snapshot: any, changeReason?: string) {
    return prisma.workoutPlanVersion.create({
      data: {
        workoutPlanId: planId,
        version,
        snapshot,
        changeReason: changeReason || null,
      },
    });
  }

  async getVersions(planId: string) {
    return prisma.workoutPlanVersion.findMany({
      where: { workoutPlanId: planId },
      orderBy: { version: 'desc' },
      select: {
        id: true,
        workoutPlanId: true,
        version: true,
        changeReason: true,
        createdAt: true,
      },
    });
  }

  async getVersionSnapshot(planId: string, version: number) {
    return prisma.workoutPlanVersion.findFirst({
      where: {
        workoutPlanId: planId,
        version,
      },
    });
  }

  async getLatestVersionNumber(planId: string): Promise<number> {
    const latest = await prisma.workoutPlanVersion.findFirst({
      where: { workoutPlanId: planId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });
    return latest ? latest.version : 0;
  }
}

export const versionControlRepository = new VersionControlRepository();
