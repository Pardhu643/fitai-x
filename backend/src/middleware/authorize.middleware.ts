import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate.middleware';
import { ForbiddenError } from '../core/errors/AppError';

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as unknown as AuthRequest;
    const userRole = authReq.user.role;

    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
};
