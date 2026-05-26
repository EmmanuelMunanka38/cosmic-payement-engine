import { PrismaClient, CurrencyCode } from '@prisma/client';
import Redis from 'ioredis';
import { getConfig } from '../../config/index.js';

const prisma = new PrismaClient();
const redis = new Redis(getConfig().REDIS_URL);

const RATE_CACHE_TTL = 300;

export async function getRate(from: CurrencyCode, to: CurrencyCode) {
  const cacheKey = `rate:${from}:${to}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const rate = await prisma.exchangeRate.findUnique({
    where: { fromCurrency_toCurrency: { fromCurrency: from, toCurrency: to } },
  });

  if (rate) {
    await redis.setex(cacheKey, RATE_CACHE_TTL, JSON.stringify(rate));
  }

  return rate;
}

export async function getAllRates() {
  return prisma.exchangeRate.findMany({
    where: { validUntil: { gte: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function upsertRate(
  from: CurrencyCode,
  to: CurrencyCode,
  rate: number,
  bid: number,
  ask: number,
  source: string,
) {
  const validUntil = new Date(Date.now() + 3600000);

  const result = await prisma.exchangeRate.upsert({
    where: { fromCurrency_toCurrency: { fromCurrency: from, toCurrency: to } },
    update: { rate, bid, ask, source, validUntil },
    create: { fromCurrency: from, toCurrency: to, rate, bid, ask, source, validUntil },
  });

  const cacheKey = `rate:${from}:${to}`;
  await redis.setex(cacheKey, RATE_CACHE_TTL, JSON.stringify(result));

  return result;
}
