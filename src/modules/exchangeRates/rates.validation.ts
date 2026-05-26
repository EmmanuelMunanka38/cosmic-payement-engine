import { z } from 'zod';
import { CurrencyCode } from '../../types/enums.js';

export const getQuoteSchema = z.object({
  from: z.nativeEnum(CurrencyCode),
  to: z.nativeEnum(CurrencyCode),
  amount: z.number().positive(),
});
