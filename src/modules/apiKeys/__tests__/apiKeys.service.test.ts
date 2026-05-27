import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as apiKeyService from '../apiKeys.service.js';
import * as apiKeyRepo from '../apiKeys.repository.js';
import { NotFoundError } from '../../../utils/errors.js';

vi.mock('../apiKeys.repository.js');

const mockApiKey = {
  id: 'key-1',
  userId: 'user-1',
  name: 'Test Key',
  keyPrefix: 'afp_abc',
  lastCharacters: 'xyz9',
  scopes: ['transactions:read', 'transactions:write'],
  isActive: true,
  expiresAt: null,
  lastUsedAt: null,
  createdAt: new Date(),
};

const mockCreatedKey = {
  apiKey: 'afp_abc123def456ghi789jkl012mno345pqr678stu',
  name: 'Test Key',
  scopes: ['transactions:read'],
  prefix: 'afp_abc',
  lastCharacters: 'stu9',
  warning: 'Save this API key — it will not be shown again',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ApiKeysService — createApiKey', () => {
  const createInput = {
    name: 'Test Key',
    scopes: ['transactions:read'],
  };

  it('creates and returns an API key', async () => {
    vi.mocked(apiKeyRepo.createApiKey).mockResolvedValue(mockCreatedKey);

    const result = await apiKeyService.createApiKey('user-1', createInput);

    expect(apiKeyRepo.createApiKey).toHaveBeenCalledWith(
      'user-1',
      createInput.name,
      createInput.scopes,
      undefined,
    );
    expect(result.apiKey).toContain('afp_');
    expect(result.warning).toBeDefined();
  });

  it('passes expiry date when provided', async () => {
    const inputWithExpiry = {
      ...createInput,
      expiresAt: '2025-12-31T23:59:59Z',
    };
    const expectedDate = new Date('2025-12-31T23:59:59Z');
    vi.mocked(apiKeyRepo.createApiKey).mockResolvedValue(mockCreatedKey);

    await apiKeyService.createApiKey('user-1', inputWithExpiry);

    expect(apiKeyRepo.createApiKey).toHaveBeenCalledWith(
      'user-1',
      inputWithExpiry.name,
      inputWithExpiry.scopes,
      expectedDate,
    );
  });
});

describe('ApiKeysService — getApiKeys', () => {
  it('returns API keys for user', async () => {
    vi.mocked(apiKeyRepo.findApiKeysByUserId).mockResolvedValue([mockApiKey]);

    const result = await apiKeyService.getApiKeys('user-1');

    expect(apiKeyRepo.findApiKeysByUserId).toHaveBeenCalledWith('user-1');
    expect(result).toHaveLength(1);
  });
});

describe('ApiKeysService — revokeApiKey', () => {
  it('revokes an existing API key', async () => {
    vi.mocked(apiKeyRepo.findApiKeyById).mockResolvedValue(mockApiKey);

    await apiKeyService.revokeApiKey('key-1', 'user-1');

    expect(apiKeyRepo.findApiKeyById).toHaveBeenCalledWith('key-1', 'user-1');
    expect(apiKeyRepo.deactivateApiKey).toHaveBeenCalledWith('key-1');
  });

  it('throws NotFoundError when key does not exist', async () => {
    vi.mocked(apiKeyRepo.findApiKeyById).mockResolvedValue(null);

    await expect(apiKeyService.revokeApiKey('key-999', 'user-1')).rejects.toThrow('not found');

    expect(apiKeyRepo.deactivateApiKey).not.toHaveBeenCalled();
  });
});
