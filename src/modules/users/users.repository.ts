import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';
import { UpdateProfileInput } from './users.validation.js';

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      country: true,
      role: true,
      kycStatus: true,
      isActive: true,
      twoFactorEnabled: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) throw new NotFoundError('User', userId);
  return user;
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  if (input.phone) {
    const existing = await prisma.user.findFirst({
      where: { phone: input.phone, id: { not: userId } },
    });
    if (existing) throw new ValidationError('Phone number already in use');
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: input,
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      country: true,
      role: true,
      kycStatus: true,
      updatedAt: true,
    },
  });

  return user;
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function findUserByPhone(phone: string) {
  return prisma.user.findFirst({ where: { phone } });
}

export async function getUsersPaginated(cursor?: string, limit = 20) {
  const users = await prisma.user.findMany({
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      country: true,
      role: true,
      kycStatus: true,
      isActive: true,
      createdAt: true,
    },
  });

  return users;
}
