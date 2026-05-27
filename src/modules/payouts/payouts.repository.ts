import { CurrencyCode, PaymentProvider } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';

export async function createTransaction(data: {
  reference: string;
  idempotencyKey: string;
  userId: string;
  sourceCurrency: CurrencyCode;
  destinationCurrency: CurrencyCode;
  sourceAmount: number;
  destinationAmount: number;
  provider: PaymentProvider;
  recipientPhone: string;
  recipientName?: string;
  recipientProvider: PaymentProvider;
  description?: string;
  environment?: string;
}) {
  return prisma.transaction.create({
    data: {
      reference: data.reference,
      idempotencyKey: data.idempotencyKey,
      userId: data.userId,
      type: 'PAYOUT',
      status: 'PROCESSING',
      sourceCurrency: data.sourceCurrency,
      destinationCurrency: data.destinationCurrency,
      sourceAmount: data.sourceAmount,
      destinationAmount: data.destinationAmount,
      provider: data.provider,
      recipientPhone: data.recipientPhone,
      recipientName: data.recipientName,
      recipientProvider: data.recipientProvider,
      description: data.description,
      environment: (data.environment ?? 'PRODUCTION') as any,
    },
  });
}

export async function updateTransactionSuccess(
  transactionId: string,
  providerTransactionId: string,
) {
  return prisma.transaction.update({
    where: { id: transactionId },
    data: {
      providerTransactionId,
      status: 'SUCCESS',
      completedAt: new Date(),
    },
  });
}

export async function updateTransactionProcessing(
  transactionId: string,
  providerTransactionId: string,
) {
  return prisma.transaction.update({
    where: { id: transactionId },
    data: {
      providerTransactionId,
      status: 'PROCESSING',
    },
  });
}

export async function failTransaction(transactionId: string, failureReason: string) {
  return prisma.transaction.update({
    where: { id: transactionId },
    data: { status: 'FAILED', failureReason },
  });
}

export async function getTransactionsByUserId(userId: string, cursor?: string, limit = 20) {
  return prisma.transaction.findMany({
    where: { userId, type: 'PAYOUT' },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: 'desc' },
  });
}

export async function getTransactionById(transactionId: string) {
  return prisma.transaction.findUnique({ where: { id: transactionId } });
}

export async function checkIdempotency(key: string) {
  return prisma.transaction.findUnique({ where: { idempotencyKey: key } });
}
