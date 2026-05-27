import { Router } from 'express';
import * as sandboxController from './sandbox.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

/**
 * @openapi
 * /api/v1/sandbox/api-keys:
 *   post:
 *     tags: [Sandbox]
 *     summary: Create a sandbox API key
 *     description: Creates a sandbox-prefixed API key and auto-funds sandbox wallets
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: My Sandbox App }
 *               scopes: { type: array, items: { type: string }, example: ["transactions:read", "transactions:write"] }
 *     responses:
 *       201:
 *         description: Sandbox API key created
 */
router.post('/api-keys', authenticate, sandboxController.createSandboxApiKey);

/**
 * @openapi
 * /api/v1/sandbox/api-keys:
 *   get:
 *     tags: [Sandbox]
 *     summary: List sandbox API keys
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of sandbox API keys
 */
router.get('/api-keys', authenticate, sandboxController.listSandboxApiKeys);

/**
 * @openapi
 * /api/v1/sandbox/transactions:
 *   get:
 *     tags: [Sandbox]
 *     summary: List sandbox transactions
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: List of sandbox transactions
 */
router.get('/transactions', authenticate, sandboxController.listSandboxTransactions);

/**
 * @openapi
 * /api/v1/sandbox/simulate/stripe:
 *   post:
 *     tags: [Sandbox]
 *     summary: Simulate a Stripe webhook event
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event: { type: string, enum: [payment_intent.succeeded, payment_intent.failed, charge.refunded] }
 *               transactionId: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Stripe event simulated
 */
router.post('/simulate/stripe', authenticate, sandboxController.simulateStripe);

/**
 * @openapi
 * /api/v1/sandbox/simulate/mpesa:
 *   post:
 *     tags: [Sandbox]
 *     summary: Simulate an M-Pesa callback
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resultCode: { type: string, enum: [0, 1, 2, 1032] }
 *               transactionId: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: M-Pesa callback simulated
 */
router.post('/simulate/mpesa', authenticate, sandboxController.simulateMpesa);

/**
 * @openapi
 * /api/v1/sandbox/simulate/payout:
 *   post:
 *     tags: [Sandbox]
 *     summary: Simulate a payout resolution
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transactionId: { type: string, format: uuid }
 *               outcome: { type: string, enum: [success, failed] }
 *     responses:
 *       200:
 *         description: Payout resolved
 */
router.post('/simulate/payout', authenticate, sandboxController.simulatePayout);

/**
 * @openapi
 * /api/v1/sandbox/reset:
 *   post:
 *     tags: [Sandbox]
 *     summary: Reset all sandbox data
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Sandbox data reset
 */
router.post('/reset', authenticate, sandboxController.resetSandbox);

export default router;
