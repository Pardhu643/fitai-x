import { PrismaClient } from '@prisma/client';
import { logger } from '../logger/logger';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();
  
  if (process.env.NODE_ENV === 'development') {
    logger.info(`Query ${params.model}.${params.action} took ${after - before}ms`);
  }
  
  return result;
});

export { prisma };
