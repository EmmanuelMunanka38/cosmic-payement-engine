import { PrismaClient } from '@prisma/client';
import { getConfig } from '../config/index.js';

export const prisma = new PrismaClient();

let _sandboxPrisma: PrismaClient | null = null;

export function getSandboxPrisma(): PrismaClient {
  if (!_sandboxPrisma) {
    const config = getConfig();
    if (!config.SANDBOX_DATABASE_URL) {
      throw new Error(
        'SANDBOX_DATABASE_URL is not configured. Set it in .env to use sandbox features.',
      );
    }
    _sandboxPrisma = new PrismaClient({
      datasources: { db: { url: config.SANDBOX_DATABASE_URL } },
    });
  }
  return _sandboxPrisma;
}

export function getPrisma(environment?: string): PrismaClient {
  return environment === 'SANDBOX' ? getSandboxPrisma() : prisma;
}
