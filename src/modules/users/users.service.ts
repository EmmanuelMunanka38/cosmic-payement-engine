import * as userRepo from './users.repository.js';
import { UpdateProfileInput } from './users.validation.js';

export async function getProfile(userId: string) {
  return userRepo.getUserById(userId);
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  return userRepo.updateProfile(userId, input);
}
