import { Router } from 'express';
import * as apiKeyController from './apiKeys.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

/**
 * @openapi
 * /api/v1/api-keys:
 *   post:
 *     tags: [API Keys]
 *     summary: Create a new API key
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: My App }
 *               scopes: { type: array, items: { type: string }, example: ["transactions:read"] }
 *               expiresAt: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: API key created (returned once)
 */
router.post('/', authenticate, apiKeyController.createApiKey);

/**
 * @openapi
 * /api/v1/api-keys:
 *   get:
 *     tags: [API Keys]
 *     summary: List API keys
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of API keys
 */
router.get('/', authenticate, apiKeyController.getApiKeys);

/**
 * @openapi
 * /api/v1/api-keys/{id}:
 *   delete:
 *     tags: [API Keys]
 *     summary: Revoke an API key
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: API key revoked
 */
router.delete('/:id', authenticate, apiKeyController.revokeApiKey);

export default router;
