import { Worker } from 'bullmq';
import { redis } from '../../lib/redis.js';
import { logger } from '../../config/logger.js';
import { refreshRates } from '../../modules/exchangeRates/rates.cron.js';

export function createRateRefreshWorker() {
  const worker = new Worker(
    'rate-refresh',
    async () => {
      await refreshRates();
    },
    { connection: redis as any },
  );

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Rate refresh failed');
  });

  return worker;
}
