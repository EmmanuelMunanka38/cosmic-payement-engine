import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionStatus } from '@prisma/client';
import { TransactionType, CurrencyCode, PaymentProvider } from '../../../types/enums.js';
import * as transactionService from '../transactions.service.js';
import * as transactionRepo from '../transactions.repository.js';
import * as walletRepo from '../../wallets/wallets.repository.js';
import * as userRepo from '../../users/users.repository.js';
import * as rateService from '../../exchangeRates/rates.service.js';
import { detectNetwork } from '../../../utils/phone.js';
import { ValidationError } from '../../../utils/errors.js';

vi.mock('../transactions.repository.js');
vi.mock('../../wallets/wallets.repository.js');
vi.mock('../../users/users.repository.js');
vi.mock('../../exchangeRates/rates.service.js');
vi.mock('../../../utils/phone.js');

const mockUser = {
  userId: 'user-1',
  email: 'test@example.com',
  role: 'USER',
};

const mockRecipient = {
  id: 'user-2',
  email: 'recipient@example.com',
  phone: '+254711111111',
  firstName: 'Jane',
  lastName: 'Doe',
};

const mockWallet = {
  id: 'wallet-1',
  userId: 'user-1',
  currency: CurrencyCode.KES,
  balance: 10000,
  availableBalance: 10000,
  ledgerBalance: 10000,
  version: 1,
  isActive: true,
};

const mockTransaction = {
  id: 'txn-1',
  reference: 'TXN-123',
  userId: 'user-1',
  type: TransactionType.SEND,
  status: TransactionStatus.SUCCESS,
  sourceCurrency: CurrencyCode.KES,
  destinationCurrency: CurrencyCode.KES,
  sourceAmount: 1000,
  destinationAmount: 1000,
  fee: 0,
  idempotencyKey: 'idem-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('TransactionService — sendInternal', () => {
  const sendInput = {
    recipientEmail: 'recipient@example.com',
    amount: 1000,
    currency: CurrencyCode.KES,
    description: 'Test send',
  };

  it('sends money to a recipient by email', async () => {
    vi.mocked(transactionRepo.checkIdempotency).mockResolvedValue(null);
    vi.mocked(userRepo.findUserByEmail).mockResolvedValue(mockRecipient);
    vi.mocked(walletRepo.getWalletByCurrency).mockResolvedValue(mockWallet);
    vi.mocked(walletRepo.debitWallet).mockResolvedValue(undefined as any);
    vi.mocked(walletRepo.creditWallet).mockResolvedValue(undefined as any);
    vi.mocked(transactionRepo.createTransaction).mockResolvedValue({
      ...mockTransaction,
      status: TransactionStatus.PENDING,
    });
    vi.mocked(transactionRepo.updateTransactionStatus).mockResolvedValue({} as any);
    vi.mocked(transactionRepo.getTransactionById).mockResolvedValue(mockTransaction);

    const result = await transactionService.sendInternal(mockUser, sendInput, 'idem-1');

    expect(userRepo.findUserByEmail).toHaveBeenCalledWith(sendInput.recipientEmail);
    expect(walletRepo.debitWallet).toHaveBeenCalledWith(mockWallet.id, 1000, mockWallet.version);
    expect(walletRepo.creditWallet).toHaveBeenCalledWith(mockWallet.id, 1000, mockWallet.version);
    expect(transactionRepo.createTransaction).toHaveBeenCalled();
    expect(transactionRepo.updateTransactionStatus).toHaveBeenCalledWith(
      expect.any(String),
      TransactionStatus.SUCCESS,
    );
    expect(result).toEqual(mockTransaction);
  });

  it('returns existing transaction on idempotency hit', async () => {
    vi.mocked(transactionRepo.checkIdempotency).mockResolvedValue(mockTransaction);

    const result = await transactionService.sendInternal(mockUser, sendInput, 'idem-1');

    expect(result).toEqual(mockTransaction);
    expect(userRepo.findUserByEmail).not.toHaveBeenCalled();
  });

  it('throws ValidationError when recipient not found', async () => {
    vi.mocked(transactionRepo.checkIdempotency).mockResolvedValue(null);
    vi.mocked(userRepo.findUserByEmail).mockResolvedValue(null);

    await expect(transactionService.sendInternal(mockUser, sendInput, 'idem-1')).rejects.toThrow(
      'Recipient not found',
    );
  });

  it('throws ValidationError when sending to self', async () => {
    vi.mocked(transactionRepo.checkIdempotency).mockResolvedValue(null);
    vi.mocked(userRepo.findUserByEmail).mockResolvedValue({ id: 'user-1' });

    await expect(transactionService.sendInternal(mockUser, sendInput, 'idem-1')).rejects.toThrow(
      'Cannot send money to yourself',
    );
  });
});

describe('TransactionService — crossBorderSend', () => {
  const crossBorderInput = {
    sourceCurrency: CurrencyCode.USD,
    destinationCurrency: CurrencyCode.KES,
    sourceAmount: 100,
    recipientPhone: '+254700000000',
    recipientName: 'John Doe',
    description: 'Cross border send',
  };

  it('completes a cross-border send with auto-detected provider', async () => {
    vi.mocked(transactionRepo.checkIdempotency).mockResolvedValue(null);
    vi.mocked(detectNetwork).mockReturnValue({
      network: PaymentProvider.MPESA,
      country: 'KE',
      currency: CurrencyCode.KES,
      confidence: 1.0,
    } as any);
    vi.mocked(rateService.getQuote).mockResolvedValue({
      quoteId: 'Q-1',
      rate: 150,
      fee: 1,
      destinationAmount: 14850,
      validForSeconds: 30,
    } as any);
    vi.mocked(walletRepo.getWalletByCurrency).mockResolvedValue(mockWallet);
    vi.mocked(walletRepo.debitWallet).mockResolvedValue(undefined as any);
    vi.mocked(transactionRepo.createTransaction).mockResolvedValue({
      ...mockTransaction,
      id: 'txn-2',
      status: TransactionStatus.PENDING,
    });
    vi.mocked(transactionRepo.updateTransactionStatus).mockResolvedValue({} as any);
    vi.mocked(transactionRepo.getTransactionById).mockResolvedValue({
      ...mockTransaction,
      id: 'txn-2',
    });

    const result = await transactionService.crossBorderSend(mockUser, crossBorderInput, 'idem-2');

    expect(detectNetwork).toHaveBeenCalledWith(crossBorderInput.recipientPhone);
    expect(rateService.getQuote).toHaveBeenCalledWith(
      crossBorderInput.sourceCurrency,
      crossBorderInput.destinationCurrency,
      crossBorderInput.sourceAmount,
    );
    expect(walletRepo.debitWallet).toHaveBeenCalled();
    expect(transactionRepo.updateTransactionStatus).toHaveBeenCalledWith(
      expect.any(String),
      TransactionStatus.PROCESSING,
    );
    expect(result).toBeDefined();
  });

  it('uses provided recipient provider instead of auto-detecting', async () => {
    const input = { ...crossBorderInput, recipientProvider: PaymentProvider.MTN_MOMO };
    vi.mocked(transactionRepo.checkIdempotency).mockResolvedValue(null);
    vi.mocked(rateService.getQuote).mockResolvedValue({
      quoteId: 'Q-1',
      rate: 150,
      fee: 1,
      destinationAmount: 14850,
      validForSeconds: 30,
    } as any);
    vi.mocked(walletRepo.getWalletByCurrency).mockResolvedValue(mockWallet);
    vi.mocked(walletRepo.debitWallet).mockResolvedValue(undefined as any);
    vi.mocked(transactionRepo.createTransaction).mockResolvedValue({
      ...mockTransaction,
      id: 'txn-3',
      status: TransactionStatus.PENDING,
    });
    vi.mocked(transactionRepo.updateTransactionStatus).mockResolvedValue({} as any);
    vi.mocked(transactionRepo.getTransactionById).mockResolvedValue({
      ...mockTransaction,
      id: 'txn-3',
    });

    await transactionService.crossBorderSend(mockUser, input, 'idem-3');

    expect(detectNetwork).not.toHaveBeenCalled();
    expect(transactionRepo.createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ recipientProvider: PaymentProvider.MTN_MOMO }),
    );
  });

  it('throws ValidationError when rate quote fails', async () => {
    vi.mocked(transactionRepo.checkIdempotency).mockResolvedValue(null);
    vi.mocked(detectNetwork).mockReturnValue({ network: PaymentProvider.MPESA } as any);
    vi.mocked(rateService.getQuote).mockResolvedValue(null);

    await expect(
      transactionService.crossBorderSend(mockUser, crossBorderInput, 'idem-4'),
    ).rejects.toThrow('Unable to get exchange rate quote');
  });
});

describe('TransactionService — payIn', () => {
  const payInInput = {
    currency: CurrencyCode.USD,
    amount: 500,
  };

  it('creates a pay-in transaction', async () => {
    vi.mocked(transactionRepo.checkIdempotency).mockResolvedValue(null);
    vi.mocked(transactionRepo.createTransaction).mockResolvedValue(mockTransaction);

    const result = await transactionService.payIn(mockUser, payInInput, 'idem-5');

    expect(transactionRepo.createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: mockUser.userId,
        type: TransactionType.RECEIVE,
        sourceCurrency: payInInput.currency,
        sourceAmount: payInInput.amount,
        provider: PaymentProvider.STRIPE,
      }),
    );
    expect(result).toEqual(mockTransaction);
  });
});

describe('TransactionService — payOut', () => {
  const payOutInput = {
    currency: CurrencyCode.KES,
    amount: 2000,
    recipientPhone: '+254700000000',
    recipientProvider: PaymentProvider.MPESA,
    description: 'Test payout',
  };

  it('completes a payout', async () => {
    vi.mocked(transactionRepo.checkIdempotency).mockResolvedValue(null);
    vi.mocked(walletRepo.getWalletByCurrency).mockResolvedValue(mockWallet);
    vi.mocked(walletRepo.debitWallet).mockResolvedValue(undefined as any);
    vi.mocked(transactionRepo.createTransaction).mockResolvedValue({
      ...mockTransaction,
      id: 'txn-6',
      status: TransactionStatus.PENDING,
    });
    vi.mocked(transactionRepo.updateTransactionStatus).mockResolvedValue({} as any);
    vi.mocked(transactionRepo.getTransactionById).mockResolvedValue({
      ...mockTransaction,
      id: 'txn-6',
    });

    const result = await transactionService.payOut(mockUser, payOutInput, 'idem-6');

    expect(walletRepo.debitWallet).toHaveBeenCalled();
    expect(transactionRepo.createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        type: TransactionType.PAYOUT,
        recipientProvider: PaymentProvider.MPESA,
      }),
    );
    expect(transactionRepo.updateTransactionStatus).toHaveBeenCalledWith(
      expect.any(String),
      TransactionStatus.PROCESSING,
    );
    expect(result).toBeDefined();
  });
});

describe('TransactionService — getTransactions', () => {
  it('returns user transactions', async () => {
    vi.mocked(transactionRepo.getUserTransactions).mockResolvedValue([mockTransaction]);

    const result = await transactionService.getUserTransactions(mockUser);

    expect(transactionRepo.getUserTransactions).toHaveBeenCalledWith(
      mockUser.userId,
      undefined,
      20,
    );
    expect(result).toHaveLength(1);
  });

  it('returns user transactions with cursor', async () => {
    vi.mocked(transactionRepo.getUserTransactions).mockResolvedValue([]);

    await transactionService.getUserTransactions(mockUser, 'cursor-1', 10);

    expect(transactionRepo.getUserTransactions).toHaveBeenCalledWith(
      mockUser.userId,
      'cursor-1',
      10,
    );
  });
});

describe('TransactionService — getTransaction', () => {
  it('returns transaction by id', async () => {
    vi.mocked(transactionRepo.getTransactionById).mockResolvedValue(mockTransaction);

    const result = await transactionService.getTransaction(mockUser, 'txn-1');

    expect(transactionRepo.getTransactionById).toHaveBeenCalledWith('txn-1', mockUser.userId);
    expect(result).toEqual(mockTransaction);
  });
});

describe('TransactionService — getTransactionByRef', () => {
  it('returns transaction by reference', async () => {
    vi.mocked(transactionRepo.getTransactionByReference).mockResolvedValue(mockTransaction);

    const result = await transactionService.getTransactionByRef(mockUser, 'TXN-123');

    expect(transactionRepo.getTransactionByReference).toHaveBeenCalledWith(
      'TXN-123',
      mockUser.userId,
    );
    expect(result).toEqual(mockTransaction);
  });
});
