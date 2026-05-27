import { Router } from 'express';
import * as walletController from './wallets.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { createWalletSchema } from './wallets.validation.js';

const router = Router();

/**
 * @openapi
 * /api/v1/wallets:
 *   get:
 *     tags: [Wallets]
 *     summary: List user wallets
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of wallets
 */
router.get('/', authenticate, walletController.getWallets);

/**
 * @openapi
 * /api/v1/wallets:
 *   post:
 *     tags: [Wallets]
 *     summary: Create a new wallet
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currency]
 *             properties:
 *               currency: { type: string, example: KES }
 *     responses:
 *       201:
 *         description: Wallet created
 */
router.post('/', authenticate, validate(createWalletSchema), walletController.createWallet);

/**
 * @openapi
 * /api/v1/wallets/{id}:
 *   get:
 *     tags: [Wallets]
 *     summary: Get wallet by ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Wallet details
 */
router.get('/:id', authenticate, walletController.getWalletById);

export default router;
