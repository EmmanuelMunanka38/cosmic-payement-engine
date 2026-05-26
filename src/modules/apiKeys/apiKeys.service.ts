import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { CreateApiKeyInput } from './apiKeys.validation.js';
import { NotFoundError } from '../../utils/errors.js';

const prisma = new PrismaClient();

function generateApiKey(): { fullKey: string; prefix: string; hash: string; lastChars: string } {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const random = Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const fullKey = `afp_${random}`;
  return {
    fullKey,
    prefix: fullKey.slice(0, 8),
    hash: bcrypt.hashSync(fullKey, 10),
    lastChars: fullKey.slice(-4),
  };
}

export async function createApiKey(userId: string, input: CreateApiKeyInput) {
  const { fullKey, prefix, hash, lastChars } = generateApiKey();

  await prisma.apiKey.create({
    data: {
      userId,
      name: input.name,
      keyPrefix: prefix,
      keyHash: hash,
      lastCharacters: lastChars,
      scopes: input.scopes,
      ...(input.expiresAt ? { expiresAt: new Date(input.expiresAt) } : {}),
    },
  });

  return {
    apiKey: fullKey,
    name: input.name,
    scopes: input.scopes,
    prefix,
    lastCharacters: lastChars,
    warning: 'Save this API key — it will not be shown again',
  };
}

export async function getApiKeys(userId: string) {
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

export async function revokeApiKey(id: string, userId: string) {
  const key = await prisma.apiKey.findFirst({ where: { id, userId } });
  if (!key) throw new NotFoundError('API Key', id);

  await prisma.apiKey.update({
    where: { id },
    data: { isActive: false },
  });
}
