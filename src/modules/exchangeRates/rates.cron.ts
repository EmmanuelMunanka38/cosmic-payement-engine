import { logger } from '../../config/logger.js';
import * as rateRepo from './rates.repository.js';

const BASE_RATES: Record<string, { KES: number; NGN: number; UGX: number; GHS: number; TZS: number }> = {
  USD: { KES: 130, NGN: 1550, UGX: 3800, GHS: 12.5, TZS: 2500 },
  EUR: { KES: 140, NGN: 1670, UGX: 4100, GHS: 13.5, TZS: 2700 },
  GBP: { KES: 165, NGN: 1960, UGX: 4800, GHS: 16, TZS: 3200 },
};

export async function refreshRates(): Promise<void> {
  try {
    for (const [from, rates] of Object.entries(BASE_RATES)) {
      for (const [to, rate] of Object.entries(rates)) {
        const spread = rate * 0.02;
        await rateRepo.upsertRate(
          from as any,
          to as any,
          rate,
          rate - spread,
          rate + spread,
          'seed',
        );
      }
    }
    logger.info('Exchange rates refreshed successfully');
  } catch (err) {
    logger.error({ err }, 'Failed to refresh exchange rates');
  }
}
