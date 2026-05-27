import * as apiKeyRepo from '../apiKeys/apiKeys.repository.js';
import * as transactionRepo from '../transactions/transactions.repository.js';
import { getSandboxPrisma } from '../../lib/prisma.js';
import { CurrencyCode } from '../../types/enums.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';

const SANDBOX_CURRENCIES: CurrencyCode[] = [
  CurrencyCode.KES,
  CurrencyCode.UGX,
  CurrencyCode.NGN,
  CurrencyCode.GHS,
  CurrencyCode.USD,
];
const SANDBOX_BALANCES: Record<string, number> = {
  KES: 100000,
  UGX: 100000,
  NGN: 100000,
  GHS: 100000,
  USD: 1000,
};

const sb = getSandboxPrisma();

export async function createSandboxApiKey(userId: string, name: string, scopes: string[]) {
  const result = await apiKeyRepo.createApiKey(userId, name, scopes, undefined, 'SANDBOX', sb);

  await ensureSandboxWallets(userId);

  return result;
}

export async function listSandboxApiKeys(userId: string) {
  return sb.apiKey.findMany({
    where: { userId, environment: 'SANDBOX' },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      lastCharacters: true,
      scopes: true,
      isActive: true,
      expiresAt: true,
      lastUsedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function listSandboxTransactions(userId: string, cursor?: string, limit = 20) {
  return sb.transaction.findMany({
    where: { userId, environment: 'SANDBOX' },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: 'desc' },
    include: {
      statusHistory: { orderBy: { createdAt: 'desc' }, take: 3 },
    },
  });
}

export async function simulateStripeCallback(userId: string, event: string, transactionId: string) {
  const transaction = await transactionRepo.getTransactionById(transactionId, userId, sb);
  if (!transaction) throw new NotFoundError('Transaction', transactionId);

  await sb.webhookEvent.create({
    data: {
      provider: 'STRIPE',
      eventType: event,
      rawBody: { event, transactionId, simulated: true },
      headers: { 'x-sandbox': 'true' },
      status: 'RECEIVED',
    },
  });

  if (event === 'payment_intent.succeeded') {
    return transactionRepo.updateTransactionStatus(
      transactionId,
      'SUCCESS',
      undefined,
      undefined,
      sb,
    );
  }
  if (event === 'payment_intent.failed' || event === 'charge.refunded') {
    return transactionRepo.updateTransactionStatus(
      transactionId,
      'FAILED',
      `Simulated: ${event}`,
      undefined,
      sb,
    );
  }
  throw new ValidationError(`Unknown event: ${event}`);
}

export async function simulateMpesaCallback(
  userId: string,
  resultCode: string,
  transactionId: string,
) {
  const transaction = await transactionRepo.getTransactionById(transactionId, userId, sb);
  if (!transaction) throw new NotFoundError('Transaction', transactionId);

  await sb.webhookEvent.create({
    data: {
      provider: 'MPESA',
      eventType: `ResultCode_${resultCode}`,
      rawBody: { ResultCode: resultCode, TransactionID: `SIM_${Date.now()}`, simulated: true },
      headers: { 'x-sandbox': 'true' },
      status: 'RECEIVED',
    },
  });

  if (resultCode === '0') {
    return transactionRepo.updateTransactionStatus(
      transactionId,
      'SUCCESS',
      undefined,
      {
        providerTransactionId: `SIM_MPESA_${Date.now()}`,
      },
      sb,
    );
  }
  return transactionRepo.updateTransactionStatus(
    transactionId,
    'FAILED',
    `M-Pesa failed with code ${resultCode}`,
    undefined,
    sb,
  );
}

export async function simulatePayoutResolution(
  userId: string,
  transactionId: string,
  outcome: 'success' | 'failed',
) {
  const transaction = await sb.transaction.findFirst({
    where: { id: transactionId, userId, environment: 'SANDBOX' },
  });
  if (!transaction) throw new NotFoundError('Transaction', transactionId);

  if (outcome === 'success') {
    return transactionRepo.updateTransactionStatus(
      transactionId,
      'SUCCESS',
      undefined,
      {
        providerTransactionId: `SIM_PO_${Date.now()}`,
      },
      sb,
    );
  }
  return transactionRepo.updateTransactionStatus(
    transactionId,
    'FAILED',
    'Simulated payout failure',
    undefined,
    sb,
  );
}

export async function resetSandboxData(userId: string) {
  const sandboxKeys = await sb.apiKey.findMany({
    where: { userId, environment: 'SANDBOX' },
    select: { id: true },
  });
  const keyIds = sandboxKeys.map((k) => k.id);

  await sb.$transaction(async (tx) => {
    await tx.transactionStatusHistory.deleteMany({
      where: { transaction: { userId, environment: 'SANDBOX' } },
    });
    await tx.transaction.deleteMany({ where: { userId, environment: 'SANDBOX' } });
    await tx.wallet.deleteMany({ where: { userId, environment: 'SANDBOX' } });
    if (keyIds.length > 0) {
      await tx.apiKey.deleteMany({ where: { id: { in: keyIds } } });
    }
  });
}

async function ensureSandboxWallets(userId: string) {
  for (const currency of SANDBOX_CURRENCIES) {
    const existing = await sb.wallet.findFirst({
      where: { userId, currency, environment: 'SANDBOX' },
    });
    if (!existing) {
      await sb.wallet.create({
        data: {
          userId,
          currency,
          balance: SANDBOX_BALANCES[currency],
          ledgerBalance: SANDBOX_BALANCES[currency],
          availableBalance: SANDBOX_BALANCES[currency],
          environment: 'SANDBOX',
        },
      });
    }
  }
}
