import { PrismaClient } from '@prisma/client';
import { PaymentProvider } from '../../types/enums.js';

const prisma = new PrismaClient();

export async function processWebhook(
  provider: PaymentProvider,
  eventType: string,
  rawBody: unknown,
  headers: unknown,
) {
  const webhookEvent = await prisma.webhookEvent.create({
    data: {
      provider,
      eventType,
      rawBody: rawBody as any,
      headers: headers as any,
      status: 'RECEIVED',
    },
  });

  return webhookEvent;
}

export async function markProcessed(id: string) {
  await prisma.webhookEvent.update({
    where: { id },
    data: { status: 'PROCESSED', processedAt: new Date() },
  });
}

export async function markFailed(id: string, reason: string) {
  await prisma.webhookEvent.update({
    where: { id },
    data: { status: 'FAILED', failureReason: reason },
  });
}
