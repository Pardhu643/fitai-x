import { Request, Response } from 'express';
import { authService } from './auth.service';
import { registerSchema, loginSchema } from './auth.validation';
import { AUTH_MESSAGES } from './auth.constants';

export const authController = {
  register: async (req: Request, res: Response): Promise<any> => {
    const data = await registerSchema.parseAsync(req.body);
    const result = await authService.register(data);

    res.status(201).json({
      success: true,
      message: AUTH_MESSAGES.REGISTER_SUCCESS,
      data: result,
    });
  },

  login: async (req: Request, res: Response): Promise<any> => {
    const data = await loginSchema.parseAsync(req.body);
    const result = await authService.login(data);

    res.status(200).json({
      success: true,
      message: AUTH_MESSAGES.LOGIN_SUCCESS,
      data: result,
    });
  },

  logout: async (_req: Request, res: Response): Promise<any> => {
    res.status(200).json({
      success: true,
      message: AUTH_MESSAGES.LOGOUT_SUCCESS,
    });
  },

  me: async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user.userId;
    const user = await authService.getCurrentUser(userId);

    res.status(200).json({
      success: true,
      data: { user },
    });
  },
};
