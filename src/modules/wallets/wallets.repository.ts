import { CurrencyCode } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';

export async function createWallet(userId: string, currency: CurrencyCode) {
  const existing = await prisma.wallet.findUnique({
    where: { userId_currency: { userId, currency } },
  });

  if (existing) throw new ValidationError(`Wallet for ${currency} already exists`);

  const wallet = await prisma.wallet.create({
    data: {
      userId,
      currency,
      balance: 0,
      ledgerBalance: 0,
      availableBalance: 0,
    },
  });

  return wallet;
}

export async function getWallets(userId: string) {
  return prisma.wallet.findMany({
    where: { userId, isActive: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getWalletById(walletId: string, userId: string) {
  const wallet = await prisma.wallet.findFirst({
    where: { id: walletId, userId, isActive: true },
  });

  if (!wallet) throw new NotFoundError('Wallet', walletId);
  return wallet;
}

export async function getWalletByCurrency(userId: string, currency: CurrencyCode) {
  let wallet = await prisma.wallet.findUnique({
    where: { userId_currency: { userId, currency } },
  });

  if (!wallet) {
    wallet = await createWallet(userId, currency);
  }

  return wallet;
}

export async function debitWallet(
  walletId: string,
  amount: number,
  version: number,
): Promise<void> {
  const result = await prisma.wallet.updateMany({
    where: {
      id: walletId,
      version,
      availableBalance: { gte: amount },
    },
    data: {
      balance: { decrement: amount },
      availableBalance: { decrement: amount },
      version: { increment: 1 },
    },
  });

  if (result.count === 0) {
    throw new ValidationError('Insufficient balance or concurrent modification');
  }
}

export async function creditWallet(
  walletId: string,
  amount: number,
  version: number,
): Promise<void> {
  const result = await prisma.wallet.updateMany({
    where: { id: walletId, version },
    data: {
      balance: { increment: amount },
      availableBalance: { increment: amount },
      version: { increment: 1 },
    },
  });

  if (result.count === 0) {
    throw new ValidationError('Concurrent modification detected during credit');
  }
}

export async function getWalletBalance(userId: string, currency: CurrencyCode) {
  const wallet = await getWalletByCurrency(userId, currency);
  return {
    currency: wallet.currency,
    balance: wallet.balance.toNumber(),
    availableBalance: wallet.availableBalance.toNumber(),
    ledgerBalance: wallet.ledgerBalance.toNumber(),
  };
}
