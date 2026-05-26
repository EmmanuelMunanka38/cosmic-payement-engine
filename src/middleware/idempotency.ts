import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { getConfig } from '../config/index.js';
import { IdempotencyError } from '../utils/errors.js';

const redis = new Redis(getConfig().REDIS_URL);

const IDEMPOTENCY_TTL = 86400;

export async function idempotency(req: Request, _res: Response, next: NextFunction): Promise<void> {
  if (req.method !== 'POST') {
    next();
    return;
  }

  const key = req.headers['idempotency-key'] as string;
  if (!key) {
    next();
    return;
  }

  const cacheKey = `idempotency:${key}`;
  const existing = await redis.get(cacheKey);

  if (existing) {
    const existingData = JSON.parse(existing);
    const requestBody = JSON.stringify(req.body);
    const existingBody = JSON.stringify(existingData.body);

    if (requestBody !== existingBody) {
      throw new IdempotencyError();
    }

    (req as unknown as { idempotencyCached: unknown }).idempotencyCached = existingData.response;
  }

  (req as unknown as { idempotencyKey: string }).idempotencyKey = key;
  next();
}

export async function cacheIdempotencyResponse(req: Request, responseData: unknown): Promise<void> {
  const key = (req as unknown as { idempotencyKey: string }).idempotencyKey;
  if (!key) return;

  const cacheKey = `idempotency:${key}`;
  const redis = new Redis(getConfig().REDIS_URL);

  await redis.set(
    cacheKey,
    JSON.stringify({ body: req.body, response: responseData }),
    'EX',
    IDEMPOTENCY_TTL,
  );
}
