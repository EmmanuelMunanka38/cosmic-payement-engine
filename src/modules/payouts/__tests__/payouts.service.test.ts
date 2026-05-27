import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CurrencyCode, PaymentProvider } from '../../../types/enums.js';
import * as payoutService from '../payouts.service.js';
import * as payoutRepo from '../payouts.repository.js';
import * as walletRepo from '../../wallets/wallets.repository.js';
import { ProviderError } from '../../../utils/errors.js';

vi.mock('../payouts.repository.js');
vi.mock('../../wallets/wallets.repository.js');

const mockProvider = {
  disburse: vi.fn(),
};

vi.mock('../../paymentProviders/provider-registry.js', () => ({
  providerRegistry: {
    getMobileProvider: vi.fn(() => mockProvider),
  },
}));

const mockWallet = {
  id: 'wallet-1',
  userId: 'user-1',
  currency: CurrencyCode.KES,
  balance: 50000,
  availableBalance: 50000,
  ledgerBalance: 50000,
  version: 1,
  isActive: true,
};

const mockTransaction = {
  id: 'txn-1',
  reference: 'PO-123',
  userId: 'user-1',
  type: 'PAYOUT',
  status: 'PROCESSING',
  sourceCurrency: CurrencyCode.KES,
  destinationCurrency: CurrencyCode.KES,
  sourceAmount: 2000,
  destinationAmount: 2000,
  provider: PaymentProvider.MPESA,
  recipientPhone: '+254700000000',
  recipientName: 'John Doe',
  recipientProvider: PaymentProvider.MPESA,
  providerTransactionId: null,
  failureReason: null,
  description: 'Test payout',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const payoutInput = {
  amount: 2000,
  currency: CurrencyCode.KES,
  recipientPhone: '+254700000000',
  recipientName: 'John Doe',
  recipientProvider: PaymentProvider.MPESA,
  description: 'Test payout',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PayoutService — createPayout', () => {
  it('creates a payout and processes it successfully', async () => {
    vi.mocked(walletRepo.getWalletByCurrency).mockResolvedValue(mockWallet);
    vi.mocked(walletRepo.debitWallet).mockResolvedValue(undefined as never);
    vi.mocked(payoutRepo.createTransaction).mockResolvedValue(mockTransaction);
    vi.mocked(payoutRepo.getTransactionById).mockResolvedValue({
      ...mockTransaction,
      status: 'SUCCESS',
    });
    mockProvider.disburse.mockResolvedValue({
      providerTransactionId: 'MPESA_TXN_123',
      status: 'success',
    });

    const result = await payoutService.createPayout('user-1', payoutInput, 'idem-payout-1');

    expect(walletRepo.getWalletByCurrency).toHaveBeenCalledWith('user-1', payoutInput.currency);
    expect(walletRepo.debitWallet).toHaveBeenCalledWith(mockWallet.id, 2000, mockWallet.version);
    expect(mockProvider.disburse).toHaveBeenCalledWith({
      amount: 2000,
      currency: CurrencyCode.KES,
      phone: '+254700000000',
      reference: expect.any(String),
      description: 'Test payout',
    });
    expect(payoutRepo.updateTransactionSuccess).toHaveBeenCalledWith(
      mockTransaction.id,
      'MPESA_TXN_123',
    );
    expect(result?.status).toBe('SUCCESS');
  });

  it('marks transaction as processing when provider returns non-success', async () => {
    vi.mocked(walletRepo.getWalletByCurrency).mockResolvedValue(mockWallet);
    vi.mocked(walletRepo.debitWallet).mockResolvedValue(undefined as never);
    vi.mocked(payoutRepo.createTransaction).mockResolvedValue(mockTransaction);
    vi.mocked(payoutRepo.getTransactionById).mockResolvedValue({
      ...mockTransaction,
      status: 'PROCESSING',
    });
    mockProvider.disburse.mockResolvedValue({
      providerTransactionId: 'MPESA_TXN_456',
      status: 'pending',
    });

    const result = await payoutService.createPayout('user-1', payoutInput, 'idem-payout-2');

    expect(payoutRepo.updateTransactionProcessing).toHaveBeenCalledWith(
      mockTransaction.id,
      'MPESA_TXN_456',
    );
    expect(result?.status).toBe('PROCESSING');
  });

  it('refunds wallet and throws ProviderError when provider fails', async () => {
    vi.mocked(walletRepo.getWalletByCurrency).mockResolvedValue(mockWallet);
    vi.mocked(walletRepo.debitWallet).mockResolvedValue(undefined as never);
    vi.mocked(payoutRepo.createTransaction).mockResolvedValue(mockTransaction);
    mockProvider.disburse.mockRejectedValue(new Error('Network error'));

    await expect(
      payoutService.createPayout('user-1', payoutInput, 'idem-payout-3'),
    ).rejects.toThrow('Payout failed');

    expect(walletRepo.creditWallet).toHaveBeenCalledWith(
      mockWallet.id,
      2000,
      mockWallet.version + 1,
    );
    expect(payoutRepo.failTransaction).toHaveBeenCalledWith(mockTransaction.id, 'Network error');
  });
});

describe('PayoutService — getPayouts', () => {
  it('returns paginated payouts', async () => {
    vi.mocked(payoutRepo.getTransactionsByUserId).mockResolvedValue([mockTransaction]);

    const result = await payoutService.getPayouts('user-1');

    expect(payoutRepo.getTransactionsByUserId).toHaveBeenCalledWith('user-1', undefined, 20);
    expect(result).toHaveLength(1);
  });

  it('passes cursor and limit', async () => {
    vi.mocked(payoutRepo.getTransactionsByUserId).mockResolvedValue([]);

    await payoutService.getPayouts('user-1', 'cursor-1', 10);

    expect(payoutRepo.getTransactionsByUserId).toHaveBeenCalledWith('user-1', 'cursor-1', 10);
  });
});
