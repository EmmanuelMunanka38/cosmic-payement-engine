import { TransactionStatus, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../utils/errors.js';

export async function findUsersPaginated(cursor?: string, limit = 20) {
  return prisma.user.findMany({
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      country: true,
      role: true,
      kycStatus: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function findTransactionsPaginated(
  cursor?: string,
  limit = 20,
  status?: TransactionStatus,
) {
  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  return prisma.transaction.findMany({
    where,
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
  });
}

export async function getTransactionStats() {
  const [total, pending, success, failed, totalVolume] = await Promise.all([
    prisma.transaction.count(),
    prisma.transaction.count({ where: { status: 'PENDING' as any } }),
    prisma.transaction.count({ where: { status: 'SUCCESS' as any } }),
    prisma.transaction.count({ where: { status: 'FAILED' as any } }),
    prisma.transaction.aggregate({
      _sum: { sourceAmount: true },
      where: { status: 'SUCCESS' as any },
    }),
  ]);

  return {
    total,
    pending,
    success,
    failed,
    totalVolume: totalVolume._sum.sourceAmount?.toNumber() || 0,
  };
}

export async function updateTransactionStatus(transactionId: string, status: TransactionStatus) {
  const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
  if (!transaction) throw new NotFoundError('Transaction', transactionId);

  return prisma.transaction.update({
    where: { id: transactionId },
    data: {
      status,
      ...(status === 'SUCCESS' ? { completedAt: new Date() } : {}),
    },
  });
}
