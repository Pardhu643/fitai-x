import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../core/security/jwt';
import { UnauthorizedError } from '../core/errors/AppError';

export interface AuthRequest extends Request {
  user: JwtPayload;
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7);

  try {
    const payload = verifyToken(token);
    (req as AuthRequest).user = payload;
    next();
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
};
