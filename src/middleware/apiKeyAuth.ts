import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { ForbiddenError, AuthError } from '../utils/errors.js';
import { JwtPayload } from '../types/index.js';
import { Environment } from '../types/enums.js';

export async function apiKeyAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const apiKey = req.headers['x-api-key'] as string;
  if (!apiKey) {
    throw new AuthError('API_KEY_MISSING', 'X-API-Key header is required');
  }

  const keyPrefix = apiKey.slice(0, 8);
  const apiKeyRecord = await prisma.apiKey.findFirst({
    where: { keyPrefix, isActive: true },
    include: { user: true },
  });

  if (!apiKeyRecord) {
    throw new AuthError('API_KEY_INVALID', 'Invalid API key');
  }

  if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt < new Date()) {
    throw new AuthError('API_KEY_EXPIRED', 'API key has expired');
  }

  const isValid = await bcrypt.compare(apiKey, apiKeyRecord.keyHash);
  if (!isValid) {
    throw new AuthError('API_KEY_INVALID', 'Invalid API key');
  }

  await prisma.apiKey.update({
    where: { id: apiKeyRecord.id },
    data: { lastUsedAt: new Date() },
  });

  (req as unknown as { user: JwtPayload }).user = {
    userId: apiKeyRecord.userId,
    email: apiKeyRecord.user.email,
    role: apiKeyRecord.user.role,
  };

  req.environment = apiKeyRecord.environment as Environment;

  next();
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  const user = (req as unknown as { user: JwtPayload }).user;
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    throw new ForbiddenError('Admin access required');
  }
  next();
}
