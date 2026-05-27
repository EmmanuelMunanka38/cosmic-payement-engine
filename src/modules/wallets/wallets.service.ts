import { CurrencyCode } from '../../types/enums.js';
import * as walletRepo from './wallets.repository.js';

export async function createWallet(userId: string, currency: CurrencyCode) {
  return walletRepo.createWallet(userId, currency);
}

export async function getWallets(userId: string) {
  return walletRepo.getWallets(userId);
}

export async function getWalletById(walletId: string, userId: string) {
  return walletRepo.getWalletById(walletId, userId);
}

export async function getWalletBalance(userId: string, currency: CurrencyCode) {
  return walletRepo.getWalletBalance(userId, currency);
}
