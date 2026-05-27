import { Request, Response, NextFunction } from 'express';
import { redis } from '../lib/redis.js';
import { AppError, IdempotencyError } from '../utils/errors.js';

const IDEMPOTENCY_TTL = 86400;

export async function idempotency(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (req.method !== 'POST') {
    next();
    return;
  }

  const key = req.headers['idempotency-key'] as string;
  if (!key) {
    throw new AppError(
      400,
      'MISSING_IDEMPOTENCY_KEY',
      'Idempotency-Key header is required for POST requests that move money',
    );
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

    res.status(200).json(existingData.response);
    return;
  }

  (req as unknown as { idempotencyKey: string }).idempotencyKey = key;
  next();
}

export async function cacheIdempotencyResponse(req: Request, responseData: unknown): Promise<void> {
  const key = (req as unknown as { idempotencyKey: string }).idempotencyKey;
  if (!key) return;

  const cacheKey = `idempotency:${key}`;

  await redis.set(
    cacheKey,
    JSON.stringify({ body: req.body, response: responseData }),
    'EX',
    IDEMPOTENCY_TTL,
  );
}
