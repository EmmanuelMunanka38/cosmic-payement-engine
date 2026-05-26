import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { getConfig } from '../../config/index.js';
import { logger } from '../../config/logger.js';
import { providerRegistry } from '../../modules/paymentProviders/provider-registry.js';

const connection = new Redis(getConfig().REDIS_URL, { maxRetriesPerRequest: null });
const prisma = new PrismaClient();

export function createPayoutSettlementWorker() {
  const worker = new Worker(
    'payout-settlement',
    async (job) => {
      const { transactionId, provider: providerName, providerTransactionId } = job.data;

      logger.info({ transactionId, providerName }, 'Settling payout');

      const provider = providerRegistry.getMobileProvider(providerName);

      const status = await provider.checkPaymentStatus(providerTransactionId);

      const txnStatus = status.status === 'success' ? 'SUCCESS' : 'PROCESSING';

      await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: txnStatus as any,
          ...(txnStatus === 'SUCCESS' ? { completedAt: new Date() } : {}),
        },
      });

      logger.info({ transactionId, status: txnStatus }, 'Payout settled');
    },
    { connection: connection as any, concurrency: 5 },
  );

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Payout settlement failed');
  });

  return worker;
}
