import { z } from 'zod';
import { CurrencyCode } from '../../types/enums.js';

export const ledgerEntrySchema = z.object({
  transactionId: z.string().uuid(),
  debits: z.array(z.object({
    accountCode: z.string(),
    amount: z.number().positive(),
    currency: z.nativeEnum(CurrencyCode),
  })),
  credits: z.array(z.object({
    accountCode: z.string(),
    amount: z.number().positive(),
    currency: z.nativeEnum(CurrencyCode),
  })),
});
