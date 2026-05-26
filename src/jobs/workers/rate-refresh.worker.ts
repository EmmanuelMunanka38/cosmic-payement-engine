import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { getConfig } from '../../config/index.js';
import { logger } from '../../config/logger.js';
import { refreshRates } from '../../modules/exchangeRates/rates.cron.js';

const connection = new Redis(getConfig().REDIS_URL, { maxRetriesPerRequest: null });

export function createRateRefreshWorker() {
  const worker = new Worker(
    'rate-refresh',
    async () => {
      await refreshRates();
    },
    { connection: connection as any },
  );

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Rate refresh failed');
  });

  return worker;
}
