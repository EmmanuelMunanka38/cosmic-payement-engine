import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserRole, KycStatus } from '@prisma/client';
import * as userService from '../users.service.js';
import * as userRepo from '../users.repository.js';
import { NotFoundError } from '../../../utils/errors.js';

vi.mock('../users.repository.js');

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
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('UserService — getProfile', () => {
  it('returns the user profile', async () => {
    vi.mocked(userRepo.getUserById).mockResolvedValue(mockUser);

    const result = await userService.getProfile('user-1');

    expect(userRepo.getUserById).toHaveBeenCalledWith('user-1');
    expect(result).toEqual(mockUser);
  });

  it('throws NotFoundError when user does not exist', async () => {
    vi.mocked(userRepo.getUserById).mockRejectedValue(new NotFoundError('User', 'user-1'));

    await expect(userService.getProfile('user-1')).rejects.toThrow('not found');
  });
});

describe('UserService — updateProfile', () => {
  const updateInput = {
    firstName: 'Jane',
    phone: '+254711111111',
  };

  it('updates and returns the profile', async () => {
    const updatedUser = { ...mockUser, firstName: 'Jane', phone: '+254711111111' };
    vi.mocked(userRepo.updateProfile).mockResolvedValue(updatedUser);

    const result = await userService.updateProfile('user-1', updateInput);

    expect(userRepo.updateProfile).toHaveBeenCalledWith('user-1', updateInput);
    expect(result.firstName).toBe('Jane');
  });

  it('throws when user is not found', async () => {
    vi.mocked(userRepo.updateProfile).mockRejectedValue(new NotFoundError('User', 'user-1'));

    await expect(userService.updateProfile('user-1', updateInput)).rejects.toThrow('not found');
  });
});
