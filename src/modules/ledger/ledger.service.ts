import { PrismaClient } from '@prisma/client';
import { ValidationError } from '../../utils/errors.js';
import { LedgerEntry, LedgerEntryType, LedgerAccountType } from './ledger.types.js';

const prisma = new PrismaClient();

const SYSTEM_ACCOUNTS: Record<string, { name: string; type: LedgerAccountType; currency: string }> = {
  '1000': { name: 'Cash - USD', type: LedgerAccountType.ASSET, currency: 'USD' },
  '1001': { name: 'Cash - KES', type: LedgerAccountType.ASSET, currency: 'KES' },
  '1002': { name: 'Cash - NGN', type: LedgerAccountType.ASSET, currency: 'NGN' },
  '2000': { name: 'Customer Wallets', type: LedgerAccountType.LIABILITY, currency: 'USD' },
  '3000': { name: 'Revenue - Fees', type: LedgerAccountType.REVENUE, currency: 'USD' },
  '4000': { name: 'Revenue - FX Spread', type: LedgerAccountType.REVENUE, currency: 'USD' },
  '5000': { name: 'Operating Expense', type: LedgerAccountType.EXPENSE, currency: 'USD' },
};

export async function postEntry(
  transactionId: string,
  debits: LedgerEntry[],
  credits: LedgerEntry[],
): Promise<void> {
  const totalDebits = debits.reduce((sum, e) => sum + e.amount, 0);
  const totalCredits = credits.reduce((sum, e) => sum + e.amount, 0);

  if (Math.abs(totalDebits - totalCredits) > 0.01) {
    throw new ValidationError('Ledger entries must balance (debits = credits)');
  }

  for (const entry of [...debits, ...credits]) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "LedgerEntry" ("id", "transactionId", "accountCode", "accountName", "accountType", "entryType", "amount", "currency", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      crypto.randomUUID(),
      transactionId,
      entry.accountId,
      SYSTEM_ACCOUNTS[entry.accountId]?.name || 'Unknown',
      SYSTEM_ACCOUNTS[entry.accountId]?.type || LedgerAccountType.ASSET,
      entry.entryType,
      entry.amount,
      entry.currency,
    );
  }
}

export async function getAccountBalance(accountCode: string): Promise<number> {
  const result = await prisma.$queryRawUnsafe<Array<{ balance: number }>>(
    `SELECT COALESCE(SUM(CASE WHEN "entryType" = 'DEBIT' THEN amount ELSE -amount END), 0) as balance
     FROM "LedgerEntry" WHERE "accountCode" = $1`,
    accountCode,
  );
  return result[0]?.balance || 0;
}
