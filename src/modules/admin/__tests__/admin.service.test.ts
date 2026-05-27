import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionStatus } from '@prisma/client';
import * as adminService from '../admin.service.js';
import * as adminRepo from '../admin.repository.js';
import * as userRepo from '../../users/users.repository.js';
import { NotFoundError } from '../../../utils/errors.js';

vi.mock('../admin.repository.js');
vi.mock('../../users/users.repository.js');

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  phone: '+254700000000',
  firstName: 'John',
  lastName: 'Doe',
  country: 'KE',
  role: 'USER',
  kycStatus: 'UNVERIFIED',
  isActive: true,
  createdAt: new Date(),
};

const mockTransaction = {
  id: 'txn-1',
  reference: 'TXN-123',
  userId: 'user-1',
  status: TransactionStatus.PENDING,
  sourceAmount: 1000,
  destinationAmount: 1000,
  sourceCurrency: 'KES',
  destinationCurrency: 'KES',
  type: 'SEND',
  fee: 0,
  createdAt: new Date(),
  user: { firstName: 'John', lastName: 'Doe', email: 'test@example.com' },
};

const mockStats = {
  total: 100,
  pending: 20,
  success: 70,
  failed: 10,
  totalVolume: 500000,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AdminService — getUsers', () => {
  it('returns paginated users', async () => {
    vi.mocked(adminRepo.findUsersPaginated).mockResolvedValue([mockUser]);

    const result = await adminService.getUsers();

    expect(adminRepo.findUsersPaginated).toHaveBeenCalledWith(undefined, 20);
    expect(result).toHaveLength(1);
  });

  it('passes cursor and limit', async () => {
    vi.mocked(adminRepo.findUsersPaginated).mockResolvedValue([]);

    await adminService.getUsers('cursor-1', 50);

    expect(adminRepo.findUsersPaginated).toHaveBeenCalledWith('cursor-1', 50);
  });
});

describe('AdminService — getTransactions', () => {
  it('returns paginated transactions', async () => {
    vi.mocked(adminRepo.findTransactionsPaginated).mockResolvedValue([mockTransaction]);

    const result = await adminService.getTransactions();

    expect(adminRepo.findTransactionsPaginated).toHaveBeenCalledWith(undefined, 20, undefined);
    expect(result).toHaveLength(1);
  });

  it('filters by status', async () => {
    vi.mocked(adminRepo.findTransactionsPaginated).mockResolvedValue([]);

    await adminService.getTransactions(undefined, 20, TransactionStatus.FAILED);

    expect(adminRepo.findTransactionsPaginated).toHaveBeenCalledWith(
      undefined,
      20,
      TransactionStatus.FAILED,
    );
  });
});

describe('AdminService — getTransactionStats', () => {
  it('returns transaction statistics', async () => {
    vi.mocked(adminRepo.getTransactionStats).mockResolvedValue(mockStats);

    const result = await adminService.getTransactionStats();

    expect(result).toEqual(mockStats);
  });
});

describe('AdminService — updateTransactionStatus', () => {
  it('updates transaction status', async () => {
    vi.mocked(adminRepo.updateTransactionStatus).mockResolvedValue({
      ...mockTransaction,
      status: TransactionStatus.SUCCESS,
    });

    const result = await adminService.updateTransactionStatus('txn-1', TransactionStatus.SUCCESS);

    expect(adminRepo.updateTransactionStatus).toHaveBeenCalledWith(
      'txn-1',
      TransactionStatus.SUCCESS,
    );
    expect(result.status).toBe(TransactionStatus.SUCCESS);
  });
});

describe('AdminService — updateUserKycStatus', () => {
  it('updates user KYC status', async () => {
    vi.mocked(userRepo.getUserById).mockResolvedValue(mockUser);
    vi.mocked(userRepo.updateProfile).mockResolvedValue({ ...mockUser, kycStatus: 'VERIFIED' });

    await adminService.updateUserKycStatus('user-1', 'VERIFIED');

    expect(userRepo.getUserById).toHaveBeenCalledWith('user-1');
    expect(userRepo.updateProfile).toHaveBeenCalledWith('user-1', { kycStatus: 'VERIFIED' });
  });

  it('throws NotFoundError when user does not exist', async () => {
    vi.mocked(userRepo.getUserById).mockRejectedValue(new NotFoundError('User', 'user-999'));

    await expect(adminService.updateUserKycStatus('user-999', 'VERIFIED')).rejects.toThrow(
      'not found',
    );
  });
});
