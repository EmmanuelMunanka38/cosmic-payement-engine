import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { getConfig } from '../../config/index.js';
import { AuthError, ValidationError } from '../../utils/errors.js';
import { RegisterInput, LoginInput } from './auth.validation.js';

const prisma = new PrismaClient();

function generateTokens(payload: { userId: string; email: string; role: string }): { accessToken: string; refreshToken: string } {
  const config = getConfig();

  const accessToken = jwt.sign(
    { userId: payload.userId, email: payload.email, role: payload.role },
    config.JWT_SECRET,
    { expiresIn: config.JWT_ACCESS_EXPIRY as any },
  );

  const refreshToken = jwt.sign(
    { userId: payload.userId, email: payload.email, role: payload.role },
    config.JWT_REFRESH_SECRET,
    { expiresIn: config.JWT_REFRESH_EXPIRY as any },
  );

  return { accessToken, refreshToken };
}

export async function register(input: RegisterInput) {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: input.email }, { phone: input.phone }],
    },
  });

  if (existingUser) {
    throw new ValidationError('User with this email or phone already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      phone: input.phone,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      country: input.country.toUpperCase(),
    },
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

  const tokens = generateTokens({ userId: user.id, email: user.email, role: user.role });

  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { user, ...tokens };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user || !user.isActive) {
    throw new AuthError('AUTH_INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const isValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValid) {
    throw new AuthError('AUTH_INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const tokens = generateTokens({ userId: user.id, email: user.email, role: user.role });

  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      country: user.country,
      role: user.role,
      kycStatus: user.kycStatus,
    },
    ...tokens,
  };
}

export async function refreshAccessToken(refreshToken: string) {
  const config = getConfig();

  let payload: { userId: string; email: string; role: string };
  try {
    payload = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as any;
  } catch {
    throw new AuthError('AUTH_TOKEN_INVALID', 'Invalid or expired refresh token');
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
    throw new AuthError('AUTH_TOKEN_INVALID', 'Refresh token has been revoked or expired');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user || !user.isActive) {
    throw new AuthError('AUTH_USER_INACTIVE', 'User account is inactive');
  }

  const tokens = generateTokens({ userId: user.id, email: user.email, role: user.role });

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date() },
  });

  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return tokens;
}

export async function logout(refreshToken: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
