import { z } from 'zod';
import { CurrencyCode, PaymentProvider } from '../../types/enums.js';

export const createPayoutSchema = z.object({
  amount: z.number().positive(),
  currency: z.nativeEnum(CurrencyCode),
  recipientPhone: z.string().min(8),
  recipientName: z.string().min(1).max(200),
  recipientProvider: z.nativeEnum(PaymentProvider),
  description: z.string().max(255).optional(),
});

export type CreatePayoutInput = z.infer<typeof createPayoutSchema>;
