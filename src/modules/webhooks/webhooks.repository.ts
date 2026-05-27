import { PaymentProvider } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';

export async function createWebhookEvent(
  provider: PaymentProvider,
  eventType: string,
  rawBody: unknown,
  headers: unknown,
) {
  return prisma.webhookEvent.create({
    data: {
      provider,
      eventType,
      rawBody: rawBody as any,
      headers: headers as any,
      status: 'RECEIVED',
    },
  });
}

export async function markProcessed(id: string) {
  return prisma.webhookEvent.update({
    where: { id },
    data: { status: 'PROCESSED', processedAt: new Date() },
  });
}

export async function markFailed(id: string, reason: string) {
  return prisma.webhookEvent.update({
    where: { id },
    data: { status: 'FAILED', failureReason: reason },
  });
}
