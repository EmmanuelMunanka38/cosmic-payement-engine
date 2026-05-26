import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { getConfig } from '../../config/index.js';
import { logger } from '../../config/logger.js';

const connection = new Redis(getConfig().REDIS_URL, { maxRetriesPerRequest: null });

export function createWebhookDeliveryWorker() {
  const worker = new Worker(
    'webhook-delivery',
    async (job) => {
      const { webhookId, url, payload } = job.data;
      logger.info({ webhookId, url, attempt: job.attemptsMade + 1 }, 'Delivering webhook');

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) throw new Error(`Webhook delivery failed: ${res.status}`);
    },
    { connection: connection as any, concurrency: 10 },
  );

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Webhook delivery failed');
  });

  return worker;
}
