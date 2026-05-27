import { CreateApiKeyInput } from './apiKeys.validation.js';
import { NotFoundError } from '../../utils/errors.js';
import * as apiKeyRepo from './apiKeys.repository.js';

export async function createApiKey(userId: string, input: CreateApiKeyInput) {
  return apiKeyRepo.createApiKey(
    userId,
    input.name,
    input.scopes,
    input.expiresAt ? new Date(input.expiresAt) : undefined,
  );
}

export async function getApiKeys(userId: string) {
  return apiKeyRepo.findApiKeysByUserId(userId);
}

export async function revokeApiKey(id: string, userId: string) {
  const key = await apiKeyRepo.findApiKeyById(id, userId);
  if (!key) throw new NotFoundError('API Key', id);

  await apiKeyRepo.deactivateApiKey(id);
}
