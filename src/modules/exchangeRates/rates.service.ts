import { redis } from '../../lib/redis.js';
import { CurrencyCode } from '../../types/enums.js';
import { ValidationError } from '../../utils/errors.js';
import * as ratesRepo from './rates.repository.js';

const QUOTE_TTL = 30;
const PLATFORM_FEE_PERCENT = 0.01;

export async function getQuote(from: CurrencyCode, to: CurrencyCode, amount: number) {
  const rate = await ratesRepo.getRate(from, to);
  if (!rate) {
    throw new ValidationError(`Exchange rate not available for ${from}->${to}`);
  }

  const rawRate = Number(rate.rate);
  const fee = Math.round(amount * PLATFORM_FEE_PERCENT * 100) / 100;
  const amountAfterFee = amount - fee;
  const destinationAmount = Math.round(amountAfterFee * rawRate * 100) / 100;

  const quoteId = `Q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  await redis.setex(
    `quote:${quoteId}`,
    QUOTE_TTL,
    JSON.stringify({ from, to, amount, rate: rawRate, fee, destinationAmount }),
  );

  return { quoteId, rate: rawRate, fee, destinationAmount, validForSeconds: QUOTE_TTL };
}

export async function confirmQuote(quoteId: string) {
  const data = await redis.get(`quote:${quoteId}`);
  if (!data) {
    throw new ValidationError('Quote has expired. Please request a new quote.');
  }

  await redis.del(`quote:${quoteId}`);
  return JSON.parse(data);
}

export async function getAllRates() {
  return ratesRepo.getAllRates();
}

export async function getPairRate(from: CurrencyCode, to: CurrencyCode) {
  return ratesRepo.getRate(from, to);
}
