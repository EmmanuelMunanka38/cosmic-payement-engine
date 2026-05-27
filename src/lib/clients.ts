import { prisma } from './prisma.js';
import { redis } from './redis.js';
import { logger } from '../config/logger.js';

export async function shutdownClients(): Promise<void> {
  logger.info('Shutting down clients...');

  await prisma.$disconnect();
  logger.info('Prisma disconnected');

  redis.disconnect();
  logger.info('Redis disconnected');
}

export { prisma, redis };
