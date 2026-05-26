import { z } from 'zod';
import { CurrencyCode } from '../../types/enums.js';

export const createWalletSchema = z.object({
  currency: z.nativeEnum(CurrencyCode),
});

export type CreateWalletInput = z.infer<typeof createWalletSchema>;
