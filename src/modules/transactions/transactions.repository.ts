import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { v4 as uuidv4 } from 'uuid';
import { CreateTransactionInput } from '../../types/index.js';
import { NotFoundError } from '../../utils/errors.js';

export async function createTransaction(input: CreateTransactionInput) {
  const reference = `TXN-${Date.now()}-${uuidv4().slice(0, 8)}`;

  return prisma.transaction.create({
    data: {
      reference,
      idempotencyKey: input.idempotencyKey,
      userId: input.userId,
      type: input.type as any,
      status: 'PENDING' as any,
      sourceCurrency: input.sourceCurrency as any,
      destinationCurrency: input.destinationCurrency as any,
      sourceAmount: input.sourceAmount,
      destinationAmount: input.destinationAmount ?? 0,
      fee: input.fee ?? 0,
      fxRate: input.fxRate,
      provider: input.provider as any,
      senderPhone: input.senderPhone,
      recipientPhone: input.recipientPhone,
      recipientName: input.recipientName,
      recipientProvider: input.recipientProvider as any,
      description: input.description,
      metadata: input.metadata as Prisma.InputJsonValue,
      statusHistory: {
        create: {
          fromStatus: 'PENDING' as any,
          toStatus: 'PENDING' as any,
          reason: 'Transaction created',
        },
      },
    },
    include: {
      statusHistory: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  });
}

export async function getTransactionById(transactionId: string, userId?: string) {
  const where: Prisma.TransactionWhereInput = { id: transactionId };
  if (userId) where.userId = userId;

  const transaction = await prisma.transaction.findFirst({
    where,
    include: {
      statusHistory: { orderBy: { createdAt: 'desc' }, take: 10 },
    },
  });

  if (!transaction) throw new NotFoundError('Transaction', transactionId);
  return transaction;
}

export async function getTransactionByReference(reference: string, userId?: string) {
  const where: Prisma.TransactionWhereInput = { reference };
  if (userId) where.userId = userId;

  const transaction = await prisma.transaction.findFirst({
    where,
    include: {
      statusHistory: { orderBy: { createdAt: 'desc' }, take: 10 },
    },
  });

  if (!transaction) throw new NotFoundError('Transaction', reference);
  return transaction;
}

export async function getUserTransactions(
  userId: string,
  cursor?: string,
  limit = 20,
  status?: string,
) {
  const where: Prisma.TransactionWhereInput = { userId };
  if (status) where.status = status as any;

  const transactions = await prisma.transaction.findMany({
    where,
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: 'desc' },
    include: {
      statusHistory: { orderBy: { createdAt: 'desc' }, take: 3 },
    },
  });

  return transactions;
}

export async function updateTransactionStatus(
  transactionId: string,
  newStatus: string,
  reason?: string,
  extra?: Partial<{ providerTransactionId: string; failureReason: string; completedAt: Date }>,
) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) throw new NotFoundError('Transaction', transactionId);

  return prisma.transaction.update({
    where: { id: transactionId },
    data: {
      status: newStatus as any,
      ...(extra as any),
      ...(newStatus === 'SUCCESS' ? { completedAt: new Date() } : {}),
      statusHistory: {
        create: {
          fromStatus: transaction.status,
          toStatus: newStatus as any,
          reason,
        },
      },
    },
    include: {
      statusHistory: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  });
}

export async function checkIdempotency(key: string) {
  return prisma.transaction.findUnique({ where: { idempotencyKey: key } });
}
