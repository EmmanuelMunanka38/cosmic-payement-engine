import { Request, Response, NextFunction } from 'express';
import * as apiKeyService from './apiKeys.service.js';
import { createApiKeySchema } from './apiKeys.validation.js';
import { sendSuccess } from '../../utils/response.js';

export async function createApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as any).user;
    const data = createApiKeySchema.parse(req.body);
    const key = await apiKeyService.createApiKey(user.userId, data);
    sendSuccess(res, key, 201);
  } catch (err) {
    next(err);
  }
}

export async function getApiKeys(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as any).user;
    const keys = await apiKeyService.getApiKeys(user.userId);
    sendSuccess(res, keys);
  } catch (err) {
    next(err);
  }
}

export async function revokeApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as any).user;
    await apiKeyService.revokeApiKey(req.params.id as string, user.userId);
    sendSuccess(res, { message: 'API key revoked' });
  } catch (err) {
    next(err);
  }
}
