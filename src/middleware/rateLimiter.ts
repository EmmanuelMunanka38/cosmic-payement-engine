import { Request, Response, NextFunction } from 'express';
import { redis } from '../lib/redis.js';
import { AppError } from '../utils/errors.js';

export function rateLimiter(windowMs: number, maxRequests: number) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const user = (req as any).user;
    const key = user ? `ratelimit:user:${user.userId}` : `ratelimit:ip:${req.ip}`;

    const current = await redis.incr(key);
    if (current === 1) {
      await redis.pexpire(key, windowMs);
    }

    if (current > maxRequests) {
      throw new AppError(429, 'RATE_LIMIT_EXCEEDED', 'Too many requests, please try again later');
    }

    next();
  };
}
