import { Request } from 'express';
import { NotFoundError } from '../core/errors/AppError';

export const notFoundHandler = (req: Request): never => {
  throw new NotFoundError(`Route ${req.method} ${req.path} not found`);
};
