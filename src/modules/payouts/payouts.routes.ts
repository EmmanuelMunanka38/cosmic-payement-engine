import { Router } from 'express';
import * as payoutController from './payouts.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { idempotency } from '../../middleware/idempotency.js';

const router = Router();

/**
 * @openapi
 * /api/v1/payouts:
 *   post:
 *     tags: [Payouts]
 *     summary: Create a payout to a mobile money recipient
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, currency, recipientPhone, recipientProvider]
 *             properties:
 *               amount: { type: number, example: 100 }
 *               currency: { type: string, example: KES }
 *               recipientPhone: { type: string, example: "+254712345678" }
 *               recipientProvider: { type: string, example: MPESA }
 *               recipientName: { type: string }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Payout created
 */
router.post('/', authenticate, idempotency, payoutController.createPayout);

/**
 * @openapi
 * /api/v1/payouts:
 *   get:
 *     tags: [Payouts]
 *     summary: List user payouts
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
 *         description: Paginated list of payouts
 */
router.get('/', authenticate, payoutController.getPayouts);

export default router;
