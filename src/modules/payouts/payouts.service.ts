import { PrismaClient } from '@prisma/client';
import { CreatePayoutInput } from './payouts.validation.js';
import { NotFoundError, ProviderError } from '../../utils/errors.js';
import * as walletRepo from '../wallets/wallets.repository.js';
import { providerRegistry } from '../paymentProviders/provider-registry.js';

const prisma = new PrismaClient();

export async function createPayout(userId: string, input: CreatePayoutInput) {
  const wallet = await walletRepo.getWalletByCurrency(userId, input.currency);
  await walletRepo.debitWallet(wallet.id, input.amount, wallet.version);

  const provider = providerRegistry.getMobileProvider(input.recipientProvider);

  const transaction = await prisma.transaction.create({
    data: {
      reference: `PO-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      idempotencyKey: `po-${userId}-${Date.now()}`,
      userId,
      type: 'PAYOUT' as any,
      status: 'PROCESSING' as any,
      sourceCurrency: input.currency,
      destinationCurrency: input.currency,
      sourceAmount: input.amount,
      destinationAmount: input.amount,
      provider: input.recipientProvider,
      recipientPhone: input.recipientPhone,
      recipientName: input.recipientName,
      recipientProvider: input.recipientProvider,
      description: input.description,
    },
  });

  try {
    const result = await provider.disburse({
      amount: input.amount,
      currency: input.currency,
      phone: input.recipientPhone,
      reference: transaction.reference,
      description: input.description,
    });

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        providerTransactionId: result.providerTransactionId,
        status: result.status === 'success' ? 'SUCCESS' as any : 'PROCESSING' as any,
        ...(result.status === 'success' ? { completedAt: new Date() } : {}),
      },
    });
  } catch (err) {
    await walletRepo.creditWallet(wallet.id, input.amount);
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'FAILED' as any, failureReason: (err as Error).message },
    });
    throw new ProviderError(input.recipientProvider, 'Payout failed', err);
  }

  return prisma.transaction.findUnique({ where: { id: transaction.id } });
}

export async function getPayouts(userId: string, cursor?: string, limit = 20) {
  return prisma.transaction.findMany({
    where: { userId, type: 'PAYOUT' as any },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: 'desc' },
  });
}
