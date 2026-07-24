import { Request, Response } from 'express';
import { userService } from './user.service';
import { updateProfileSchema } from './user.validation';
import { AuthRequest } from '../../middleware/authenticate.middleware';

export const userController = {
  getProfile: async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthRequest).user.userId;
    const profile = await userService.getProfile(userId);

    res.status(200).json({
      success: true,
      data: { profile },
    });
  },

  updateProfile: async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthRequest).user.userId;
    const data = await updateProfileSchema.parseAsync(req.body);
    const profile = await userService.updateProfile(userId, data);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { profile },
    });
  },
};
