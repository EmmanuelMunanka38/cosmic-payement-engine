import Redis from 'ioredis';
import { CurrencyCode } from '../../types/enums.js';
import { getConfig } from '../../config/index.js';
import { ValidationError } from '../../utils/errors.js';
import * as rateRepo from './rates.repository.js';

const redis = new Redis(getConfig().REDIS_URL);

const QUOTE_TTL = 30;
const PLATFORM_FEE_PERCENT = 0.01;

export async function getQuote(from: CurrencyCode, to: CurrencyCode, amount: number) {
  const rate = await rateRepo.getRate(from, to);
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
  return rateRepo.getAllRates();
}

export async function getPairRate(from: CurrencyCode, to: CurrencyCode) {
  return rateRepo.getRate(from, to);
}
