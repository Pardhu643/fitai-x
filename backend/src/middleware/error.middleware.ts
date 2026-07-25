import { Request, Response, NextFunction } from 'express';
import { logger } from '../core/logger/logger';
import { AppError } from '../core/errors/AppError';

import { ZodError } from 'zod';

export const errorHandler = (
  error: Error | AppError | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (error instanceof ZodError) {
    logger.warn('Validation error', {
      message: error.message,
      path: req.path,
    });
    res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: error.errors
    });
    return;
  }

  if (error instanceof AppError) {
    logger.warn('Application error', {
      statusCode: error.statusCode,
      message: error.message,
      path: req.path,
    });

    res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
      ...(error.statusCode >= 500 && { stack: process.env.NODE_ENV === 'development' ? error.stack : undefined }),
    });
    return;
  }

  logger.error('Unexpected error', {
    error: error.message,
    stack: error.stack,
    path: req.path,
  });

  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};
