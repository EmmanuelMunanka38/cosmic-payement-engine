import { z } from 'zod';
import { CurrencyCode, TransactionType, PaymentProvider } from '../../types/enums.js';

export const sendSchema = z.object({
  recipientEmail: z.string().email().optional(),
  recipientPhone: z.string().min(8).optional(),
  amount: z.number().positive(),
  currency: z.nativeEnum(CurrencyCode),
  description: z.string().max(255).optional(),
}).refine(data => data.recipientEmail || data.recipientPhone, {
  message: 'Either recipientEmail or recipientPhone is required',
});

export const crossBorderSchema = z.object({
  sourceCurrency: z.nativeEnum(CurrencyCode),
  destinationCurrency: z.nativeEnum(CurrencyCode),
  sourceAmount: z.number().positive(),
  recipientPhone: z.string().min(8),
  recipientName: z.string().min(1).max(200),
  recipientProvider: z.nativeEnum(PaymentProvider).optional(),
  description: z.string().max(255).optional(),
});

export const payInSchema = z.object({
  currency: z.nativeEnum(CurrencyCode),
  amount: z.number().positive().max(50000, 'Maximum top-up is $50,000'),
  returnUrl: z.string().url().optional(),
});

export const payOutSchema = z.object({
  currency: z.nativeEnum(CurrencyCode),
  amount: z.number().positive(),
  recipientPhone: z.string().min(8),
  recipientProvider: z.nativeEnum(PaymentProvider),
  description: z.string().max(255).optional(),
});

export type CrossBorderInput = z.infer<typeof crossBorderSchema>;
export type PayInInput = z.infer<typeof payInSchema>;
export type PayOutInput = z.infer<typeof payOutSchema>;
