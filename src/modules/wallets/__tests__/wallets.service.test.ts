import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CurrencyCode } from '@prisma/client';
import * as walletService from '../wallets.service.js';
import * as walletRepo from '../wallets.repository.js';
import { NotFoundError } from '../../../utils/errors.js';

vi.mock('../wallets.repository.js');

const mockWallet = {
  id: 'wallet-1',
  userId: 'user-1',
  currency: CurrencyCode.KES,
  balance: { toNumber: () => 50000 },
  availableBalance: { toNumber: () => 48000 },
  ledgerBalance: { toNumber: () => 50000 },
  version: 1,
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('WalletService — createWallet', () => {
  it('creates a wallet for the user', async () => {
    vi.mocked(walletRepo.createWallet).mockResolvedValue(mockWallet);

    const result = await walletService.createWallet('user-1', CurrencyCode.KES);

    expect(walletRepo.createWallet).toHaveBeenCalledWith('user-1', CurrencyCode.KES);
    expect(result).toEqual(mockWallet);
  });

  it('throws when wallet for currency already exists', async () => {
    vi.mocked(walletRepo.createWallet).mockRejectedValue(
      new Error('Wallet for KES already exists'),
    );

    await expect(walletService.createWallet('user-1', CurrencyCode.KES)).rejects.toThrow(
      'already exists',
    );
  });
});

describe('WalletService — getWallets', () => {
  it('returns all wallets for the user', async () => {
    vi.mocked(walletRepo.getWallets).mockResolvedValue([mockWallet]);

    const result = await walletService.getWallets('user-1');

    expect(walletRepo.getWallets).toHaveBeenCalledWith('user-1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('wallet-1');
  });

  it('returns empty array when user has no wallets', async () => {
    vi.mocked(walletRepo.getWallets).mockResolvedValue([]);

    const result = await walletService.getWallets('user-1');

    expect(result).toEqual([]);
  });
});

describe('WalletService — getWalletById', () => {
  it('returns the wallet when found', async () => {
    vi.mocked(walletRepo.getWalletById).mockResolvedValue(mockWallet);

    const result = await walletService.getWalletById('wallet-1', 'user-1');

    expect(walletRepo.getWalletById).toHaveBeenCalledWith('wallet-1', 'user-1');
    expect(result.id).toBe('wallet-1');
  });

  it('throws when wallet not found', async () => {
    vi.mocked(walletRepo.getWalletById).mockRejectedValue(new NotFoundError('Wallet', 'bad-id'));

    await expect(walletService.getWalletById('bad-id', 'user-1')).rejects.toThrow('not found');
  });
});

describe('WalletService — getWalletBalance', () => {
  it('returns parsed balance for the wallet', async () => {
    vi.mocked(walletRepo.getWalletBalance).mockResolvedValue({
      currency: CurrencyCode.KES,
      balance: 50000,
      availableBalance: 48000,
      ledgerBalance: 50000,
    });

    const result = await walletService.getWalletBalance('user-1', CurrencyCode.KES);

    expect(walletRepo.getWalletBalance).toHaveBeenCalledWith('user-1', CurrencyCode.KES);
    expect(result.balance).toBe(50000);
    expect(result.availableBalance).toBe(48000);
  });
});
