import { TransactionStatus } from '@prisma/client';
import { JwtPayload, CreateTransactionInput } from '../../types/index.js';
import { TransactionType, CurrencyCode } from '../../types/enums.js';
import { ValidationError } from '../../utils/errors.js';
import * as transactionRepo from './transactions.repository.js';
import * as walletRepo from '../wallets/wallets.repository.js';
import * as userRepo from '../users/users.repository.js';
import * as rateService from '../exchangeRates/rates.service.js';
import { detectNetwork } from '../../utils/phone.js';
import { CrossBorderInput, PayInInput, PayOutInput } from './transactions.validation.js';

export async function sendInternal(
  user: JwtPayload,
  input: {
    recipientEmail?: string;
    recipientPhone?: string;
    amount: number;
    currency: CurrencyCode;
    description?: string;
  },
  idempotencyKey: string,
  environment?: string,
) {
  const existing = await transactionRepo.checkIdempotency(idempotencyKey);
  if (existing) return existing;

  let recipient;
  if (input.recipientEmail) {
    recipient = await userRepo.findUserByEmail(input.recipientEmail);
  } else if (input.recipientPhone) {
    recipient = await userRepo.findUserByPhone(input.recipientPhone);
  }

  if (!recipient) throw new ValidationError('Recipient not found');
  if (recipient.id === user.userId) throw new ValidationError('Cannot send money to yourself');

  const senderWallet = await walletRepo.getWalletByCurrency(user.userId, input.currency);
  const recipientWallet = await walletRepo.getWalletByCurrency(recipient.id, input.currency);

  await walletRepo.debitWallet(senderWallet.id, input.amount, senderWallet.version);
  await walletRepo.creditWallet(recipientWallet.id, input.amount, recipientWallet.version);

  const transaction = await transactionRepo.createTransaction({
    userId: user.userId,
    type: TransactionType.SEND,
    sourceCurrency: input.currency,
    destinationCurrency: input.currency,
    sourceAmount: input.amount,
    destinationAmount: input.amount,
    description: input.description,
    idempotencyKey,
    environment,
  });

  await transactionRepo.updateTransactionStatus(transaction.id, TransactionStatus.SUCCESS);

  return transactionRepo.getTransactionById(transaction.id);
}

export async function crossBorderSend(
  user: JwtPayload,
  input: CrossBorderInput,
  idempotencyKey: string,
  environment?: string,
) {
  const existing = await transactionRepo.checkIdempotency(idempotencyKey);
  if (existing) return existing;

  let provider = input.recipientProvider;
  if (!provider) {
    const detected = detectNetwork(input.recipientPhone);
    provider = (detected.network || undefined) as any;
  }

  const quote = await rateService.getQuote(
    input.sourceCurrency,
    input.destinationCurrency,
    input.sourceAmount,
  );

  if (!quote) throw new ValidationError('Unable to get exchange rate quote');

  const destinationAmount = quote.destinationAmount;
  const sourceWallet = await walletRepo.getWalletByCurrency(user.userId, input.sourceCurrency);

  await walletRepo.debitWallet(sourceWallet.id, input.sourceAmount, sourceWallet.version);

  const transaction = await transactionRepo.createTransaction({
    userId: user.userId,
    type: TransactionType.CROSS_BORDER_SEND,
    sourceCurrency: input.sourceCurrency,
    destinationCurrency: input.destinationCurrency,
    sourceAmount: input.sourceAmount,
    destinationAmount,
    fee: quote.fee,
    fxRate: quote.rate,
    provider,
    recipientPhone: input.recipientPhone,
    recipientName: input.recipientName,
    recipientProvider: provider,
    description: input.description,
    idempotencyKey,
    environment,
  });

  await transactionRepo.updateTransactionStatus(transaction.id, TransactionStatus.PROCESSING);

  return transactionRepo.getTransactionById(transaction.id);
}

export async function payIn(
  user: JwtPayload,
  input: PayInInput,
  idempotencyKey: string,
  environment?: string,
) {
  const existing = await transactionRepo.checkIdempotency(idempotencyKey);
  if (existing) return existing;

  const transaction = await transactionRepo.createTransaction({
    userId: user.userId,
    type: TransactionType.RECEIVE,
    sourceCurrency: input.currency,
    destinationCurrency: input.currency,
    sourceAmount: input.amount,
    destinationAmount: input.amount,
    provider: 'STRIPE' as any,
    idempotencyKey,
    environment,
  });

  return transaction;
}

export async function payOut(
  user: JwtPayload,
  input: PayOutInput,
  idempotencyKey: string,
  environment?: string,
) {
  const existing = await transactionRepo.checkIdempotency(idempotencyKey);
  if (existing) return existing;

  const wallet = await walletRepo.getWalletByCurrency(user.userId, input.currency);
  await walletRepo.debitWallet(wallet.id, input.amount, wallet.version);

  const transaction = await transactionRepo.createTransaction({
    userId: user.userId,
    type: TransactionType.PAYOUT,
    sourceCurrency: input.currency,
    destinationCurrency: input.currency,
    sourceAmount: input.amount,
    destinationAmount: input.amount,
    provider: input.recipientProvider,
    recipientPhone: input.recipientPhone,
    recipientProvider: input.recipientProvider,
    description: input.description,
    idempotencyKey,
    environment,
  });

  await transactionRepo.updateTransactionStatus(transaction.id, TransactionStatus.PROCESSING);

  return transactionRepo.getTransactionById(transaction.id);
}

export async function getUserTransactions(user: JwtPayload, cursor?: string, limit = 20) {
  return transactionRepo.getUserTransactions(user.userId, cursor, limit);
}

export async function getTransaction(user: JwtPayload, transactionId: string) {
  return transactionRepo.getTransactionById(transactionId, user.userId);
}

export async function getTransactionByRef(user: JwtPayload, reference: string) {
  return transactionRepo.getTransactionByReference(reference, user.userId);
}
