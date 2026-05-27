import { CreatePayoutInput } from './payouts.validation.js';
import { ProviderError } from '../../utils/errors.js';
import * as walletRepo from '../wallets/wallets.repository.js';
import * as payoutRepo from './payouts.repository.js';
import { providerRegistry } from '../paymentProviders/provider-registry.js';

export async function createPayout(
  userId: string,
  input: CreatePayoutInput,
  idempotencyKey: string,
  environment?: string,
) {
  const existing = await payoutRepo.checkIdempotency(idempotencyKey);
  if (existing) return existing;

  const wallet = await walletRepo.getWalletByCurrency(
    userId,
    input.currency,
    environment ?? 'PRODUCTION',
  );
  await walletRepo.debitWallet(wallet.id, input.amount, wallet.version);

  const transaction = await payoutRepo.createTransaction({
    reference: `PO-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    idempotencyKey,
    userId,
    sourceCurrency: input.currency,
    destinationCurrency: input.currency,
    sourceAmount: input.amount,
    destinationAmount: input.amount,
    provider: input.recipientProvider,
    recipientPhone: input.recipientPhone,
    recipientName: input.recipientName,
    recipientProvider: input.recipientProvider,
    description: input.description,
    environment,
  });

  if (environment === 'SANDBOX') {
    return payoutRepo.updateTransactionSuccess(transaction.id, `SIM_PO_${Date.now()}`);
  }

  const provider = providerRegistry.getMobileProvider(input.recipientProvider);

  try {
    const result = await provider.disburse({
      amount: input.amount,
      currency: input.currency,
      phone: input.recipientPhone,
      reference: transaction.reference,
      description: input.description,
    });

    if (result.status === 'success') {
      await payoutRepo.updateTransactionSuccess(transaction.id, result.providerTransactionId);
    } else {
      await payoutRepo.updateTransactionProcessing(transaction.id, result.providerTransactionId);
    }
  } catch (err) {
    await walletRepo.creditWallet(wallet.id, input.amount, wallet.version + 1);
    await payoutRepo.failTransaction(transaction.id, (err as Error).message);
    throw new ProviderError(input.recipientProvider, 'Payout failed', err);
  }

  return payoutRepo.getTransactionById(transaction.id);
}

export async function getPayouts(userId: string, cursor?: string, limit = 20) {
  return payoutRepo.getTransactionsByUserId(userId, cursor, limit);
}
