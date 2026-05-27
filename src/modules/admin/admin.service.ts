import { TransactionStatus, KycStatus } from '@prisma/client';
import { NotFoundError } from '../../utils/errors.js';
import * as adminRepo from './admin.repository.js';
import * as userRepo from '../users/users.repository.js';

export async function getUsers(cursor?: string, limit = 20) {
  return adminRepo.findUsersPaginated(cursor, limit);
}

export async function getTransactions(cursor?: string, limit = 20, status?: TransactionStatus) {
  return adminRepo.findTransactionsPaginated(cursor, limit, status);
}

export async function getTransactionStats() {
  return adminRepo.getTransactionStats();
}

export async function updateTransactionStatus(transactionId: string, status: TransactionStatus) {
  return adminRepo.updateTransactionStatus(transactionId, status);
}

export async function updateUserKycStatus(
  userId: string,
  status: KycStatus,
  rejectedReason?: string,
) {
  const user = await userRepo.getUserById(userId);
  if (!user) throw new NotFoundError('User', userId);

  return userRepo.updateProfile(userId, { kycStatus: status });
}
