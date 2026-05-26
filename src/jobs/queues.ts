import { Queue, QueueOptions } from 'bullmq';
import Redis from 'ioredis';
import { getConfig } from '../config/index.js';

const connection = new Redis(getConfig().REDIS_URL, { maxRetriesPerRequest: null });

const defaultOptions: QueueOptions = {
  connection: connection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
};

export const webhookDeliveryQueue = new Queue('webhook-delivery', defaultOptions);
export const payoutSettlementQueue = new Queue('payout-settlement', defaultOptions);
export const transactionTimeoutQueue = new Queue('transaction-timeout', {
  ...defaultOptions,
  defaultJobOptions: { ...defaultOptions.defaultJobOptions, attempts: 1 },
});
export const notificationQueue = new Queue('notification', defaultOptions);
export const rateRefreshQueue = new Queue('rate-refresh', {
  ...defaultOptions,
  defaultJobOptions: { ...defaultOptions.defaultJobOptions, removeOnComplete: true },
});
