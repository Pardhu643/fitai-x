import { Request, Response } from 'express';
import { logger } from '../../core/logger/logger';

export const healthController = {
  getHealth: (req: Request, res: Response): any => {
    const healthData = {
      status: 'ok',
      application: 'FitAI X',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };

    logger.info('Health check accessed', { path: req.path });
    return res.status(200).json(healthData);
  },
};
