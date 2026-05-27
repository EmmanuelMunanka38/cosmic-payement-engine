import { prisma, getPrisma } from '../../lib/prisma.js';
import bcrypt from 'bcryptjs';

function generateApiKeyValue(environment: string = 'PRODUCTION'): {
  fullKey: string;
  prefix: string;
  hash: string;
  lastChars: string;
} {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const random = Array.from(
    { length: 40 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join('');
  const prefixStr = environment === 'SANDBOX' ? 'sand_' : 'afp_';
  const fullKey = `${prefixStr}${random}`;
  return {
    fullKey,
    prefix: fullKey.slice(0, 8),
    hash: bcrypt.hashSync(fullKey, 10),
    lastChars: fullKey.slice(-4),
  };
}

export async function createApiKey(
  userId: string,
  name: string,
  scopes: string[],
  expiresAt?: Date,
  environment: string = 'PRODUCTION',
  _prisma?: any,
) {
  const db = _prisma || prisma;
  const { fullKey, prefix, hash, lastChars } = generateApiKeyValue(environment);

  await db.apiKey.create({
    data: {
      userId,
      name,
      keyPrefix: prefix,
      keyHash: hash,
      lastCharacters: lastChars,
      scopes,
      environment: environment as any,
      ...(expiresAt ? { expiresAt } : {}),
    },
  });

  return {
    apiKey: fullKey,
    name,
    scopes,
    prefix,
    lastCharacters: lastChars,
    environment,
    warning: 'Save this API key — it will not be shown again',
  };
}

export async function findApiKeysByUserId(userId: string) {
  return prisma.apiKey.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      lastCharacters: true,
      scopes: true,
      isActive: true,
      expiresAt: true,
      lastUsedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findApiKeyById(id: string, userId: string) {
  return prisma.apiKey.findFirst({ where: { id, userId } });
}

export async function deactivateApiKey(id: string) {
  await prisma.apiKey.update({
    where: { id },
    data: { isActive: false },
  });
}
