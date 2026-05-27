import { PaymentProvider } from '../../types/enums.js';
import * as webhookRepo from './webhooks.repository.js';

export async function processWebhook(
  provider: PaymentProvider,
  eventType: string,
  rawBody: unknown,
  headers: unknown,
) {
  return webhookRepo.createWebhookEvent(provider, eventType, rawBody, headers);
}

export async function markProcessed(id: string) {
  await webhookRepo.markProcessed(id);
}

export async function markFailed(id: string, reason: string) {
  await webhookRepo.markFailed(id, reason);
}
