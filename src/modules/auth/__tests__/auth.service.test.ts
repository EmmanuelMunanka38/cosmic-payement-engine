import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole, KycStatus } from '@prisma/client';
import * as authService from '../auth.service.js';
import * as authRepo from '../auth.repository.js';
import { AuthError, ValidationError } from '../../../utils/errors.js';

vi.mock('../auth.repository.js');
vi.mock('bcryptjs');
vi.mock('jsonwebtoken');

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  phone: '+254700000000',
  firstName: 'John',
  lastName: 'Doe',
  country: 'KE',
  role: UserRole.USER,
  kycStatus: KycStatus.UNVERIFIED,
  isActive: true,
  twoFactorEnabled: false,
  passwordHash: '$2a$12$hashedpassword',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockTokens = {
  accessToken: 'access-token-123',
  refreshToken: 'refresh-token-123',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AuthService — register', () => {
  const registerInput = {
    email: 'test@example.com',
    phone: '+254700000000',
    password: 'Password123!',
    firstName: 'John',
    lastName: 'Doe',
    country: 'KE',
  };

  it('creates a new user and returns tokens', async () => {
    vi.mocked(authRepo.findExistingUser).mockResolvedValue(null);
    vi.mocked(bcrypt.hash).mockResolvedValue('$2a$12$hashedpassword' as never);
    vi.mocked(authRepo.createUser).mockResolvedValue(mockUser);
    vi.mocked(jwt.sign).mockReturnValue('token-123' as never);
    vi.mocked(authRepo.createRefreshToken).mockResolvedValue({} as any);

    const result = await authService.register(registerInput);

    expect(authRepo.findExistingUser).toHaveBeenCalledWith(
      registerInput.email,
      registerInput.phone,
    );
    expect(bcrypt.hash).toHaveBeenCalledWith(registerInput.password, 12);
    expect(authRepo.createUser).toHaveBeenCalledWith({
      email: registerInput.email,
      phone: registerInput.phone,
      passwordHash: '$2a$12$hashedpassword',
      firstName: registerInput.firstName,
      lastName: registerInput.lastName,
      country: registerInput.country,
    });
    expect(authRepo.createRefreshToken).toHaveBeenCalled();
    expect(result.user).toEqual(mockUser);
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  it('throws ValidationError if user already exists', async () => {
    vi.mocked(authRepo.findExistingUser).mockResolvedValue(mockUser);

    await expect(authService.register(registerInput)).rejects.toThrow('already exists');

    expect(authRepo.createUser).not.toHaveBeenCalled();
  });
});

describe('AuthService — login', () => {
  const loginInput = {
    email: 'test@example.com',
    password: 'Password123!',
  };

  it('returns user and tokens on valid credentials', async () => {
    vi.mocked(authRepo.findUserByEmail).mockResolvedValue(mockUser);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(jwt.sign).mockReturnValue('token-123' as never);
    vi.mocked(authRepo.createRefreshToken).mockResolvedValue({} as any);

    const result = await authService.login(loginInput);

    expect(authRepo.findUserByEmail).toHaveBeenCalledWith(loginInput.email);
    expect(bcrypt.compare).toHaveBeenCalledWith(loginInput.password, mockUser.passwordHash);
    expect(result.user.email).toBe(mockUser.email);
  });

  it('throws AuthError when user not found', async () => {
    vi.mocked(authRepo.findUserByEmail).mockResolvedValue(null);

    await expect(authService.login(loginInput)).rejects.toThrow('Invalid email or password');
  });

  it('throws AuthError when user is inactive', async () => {
    vi.mocked(authRepo.findUserByEmail).mockResolvedValue({ ...mockUser, isActive: false });

    await expect(authService.login(loginInput)).rejects.toThrow('Invalid email or password');
  });

  it('throws AuthError on wrong password', async () => {
    vi.mocked(authRepo.findUserByEmail).mockResolvedValue(mockUser);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    await expect(authService.login(loginInput)).rejects.toThrow('Invalid email or password');
  });
});

describe('AuthService — refreshAccessToken', () => {
  const refreshToken = 'valid-refresh-token';
  const jwtPayload = { userId: 'user-1', email: 'test@example.com', role: 'USER' };

  it('rotates tokens on valid refresh token', async () => {
    vi.mocked(jwt.verify).mockReturnValue(jwtPayload as any);
    vi.mocked(authRepo.findRefreshToken).mockResolvedValue({
      id: 'rt-1',
      token: refreshToken,
      userId: 'user-1',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 86400000),
    } as any);
    vi.mocked(authRepo.findUserById).mockResolvedValue(mockUser);
    vi.mocked(jwt.sign).mockReturnValue('new-token' as never);
    vi.mocked(authRepo.revokeRefreshToken).mockResolvedValue({} as any);
    vi.mocked(authRepo.createRefreshToken).mockResolvedValue({} as any);

    const result = await authService.refreshAccessToken(refreshToken);

    expect(authRepo.revokeRefreshToken).toHaveBeenCalledWith('rt-1');
    expect(authRepo.createRefreshToken).toHaveBeenCalled();
    expect(result.accessToken).toBe('new-token');
    expect(result.refreshToken).toBe('new-token');
  });

  it('throws AuthError when jwt verification fails', async () => {
    vi.mocked(jwt.verify).mockImplementation(() => {
      throw new Error('invalid');
    });

    await expect(authService.refreshAccessToken(refreshToken)).rejects.toThrow(
      'Invalid or expired refresh token',
    );
  });

  it('throws AuthError when refresh token is revoked', async () => {
    vi.mocked(jwt.verify).mockReturnValue(jwtPayload as any);
    vi.mocked(authRepo.findRefreshToken).mockResolvedValue({
      id: 'rt-1',
      token: refreshToken,
      revokedAt: new Date(),
      expiresAt: new Date(Date.now() + 86400000),
    } as any);

    await expect(authService.refreshAccessToken(refreshToken)).rejects.toThrow(
      'revoked or expired',
    );
  });

  it('throws AuthError when user is inactive', async () => {
    vi.mocked(jwt.verify).mockReturnValue(jwtPayload as any);
    vi.mocked(authRepo.findRefreshToken).mockResolvedValue({
      id: 'rt-1',
      token: refreshToken,
      revokedAt: null,
      expiresAt: new Date(Date.now() + 86400000),
    } as any);
    vi.mocked(authRepo.findUserById).mockResolvedValue({ ...mockUser, isActive: false });

    await expect(authService.refreshAccessToken(refreshToken)).rejects.toThrow(
      'account is inactive',
    );
  });
});

describe('AuthService — logout', () => {
  it('revokes the refresh token', async () => {
    vi.mocked(authRepo.revokeRefreshTokenByValue).mockResolvedValue({ count: 1 } as any);

    await authService.logout('refresh-token-123');

    expect(authRepo.revokeRefreshTokenByValue).toHaveBeenCalledWith('refresh-token-123');
  });
});
