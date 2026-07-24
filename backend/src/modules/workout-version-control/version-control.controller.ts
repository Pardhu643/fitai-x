import { Request, Response } from 'express';
import { versionControlService } from './version-control.service';
import { AuthRequest } from '../../middleware/authenticate.middleware';

export const versionControlController = {
  getVersions: async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthRequest).user.userId;
    const { id: planId } = req.params;
    const versions = await versionControlService.getVersions(planId, userId);

    res.status(200).json({
      success: true,
      data: versions,
    });
  },

  getVersionSnapshot: async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthRequest).user.userId;
    const { id: planId, version } = req.params;
    const versionNum = parseInt(version, 10);
    const snapshot = await versionControlService.getVersionSnapshot(planId, versionNum, userId);

    res.status(200).json({
      success: true,
      data: snapshot,
    });
  },

  rollback: async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthRequest).user.userId;
    const { id: planId } = req.params;
    const { version } = req.body;
    const versionNum = parseInt(version, 10);
    const plan = await versionControlService.rollback(planId, versionNum, userId);

    res.status(200).json({
      success: true,
      message: `Successfully rolled back to version ${versionNum}`,
      data: plan,
    });
  },
};
