import { Worker } from 'bullmq';
import { redis } from '../../lib/redis.js';
import { prisma } from '../../lib/prisma.js';
import { logger } from '../../config/logger.js';

export function createTransactionTimeoutWorker() {
  const worker = new Worker(
    'transaction-timeout',
    async (job) => {
      const { transactionId } = job.data;

      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
      });

      if (!transaction || transaction.status !== 'PENDING') return;

      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
      if (transaction.createdAt < threeHoursAgo) {
        await prisma.transaction.update({
          where: { id: transactionId },
          data: { status: 'EXPIRED' as any },
        });
        logger.info({ transactionId }, 'Transaction expired due to timeout');
      }
    },
    { connection: redis as any, concurrency: 10 },
  );

  return worker;
}
