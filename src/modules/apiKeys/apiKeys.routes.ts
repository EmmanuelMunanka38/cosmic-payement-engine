import { Router } from 'express';
import * as apiKeyController from './apiKeys.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.post('/', authenticate, apiKeyController.createApiKey);
router.get('/', authenticate, apiKeyController.getApiKeys);
router.delete('/:id', authenticate, apiKeyController.revokeApiKey);

export default router;
