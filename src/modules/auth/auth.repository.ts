import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../utils/errors.js';

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function findExistingUser(email: string, phone: string) {
  return prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] },
  });
}

export async function createUser(data: {
  email: string;
  phone: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  country: string;
}) {
  return prisma.user.create({
    data,
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      country: true,
      role: true,
      kycStatus: true,
      createdAt: true,
    },
  });
}

export async function createRefreshToken(userId: string, token: string, expiresAt: Date) {
  return prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  });
}

export async function findRefreshToken(token: string) {
  return prisma.refreshToken.findUnique({ where: { token } });
}

export async function revokeRefreshToken(id: string) {
  return prisma.refreshToken.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
}

export async function revokeRefreshTokenByValue(token: string) {
  return prisma.refreshToken.updateMany({
    where: { token, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function findUserById(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}
