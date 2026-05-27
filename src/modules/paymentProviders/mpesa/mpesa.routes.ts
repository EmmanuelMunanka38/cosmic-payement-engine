import { Router } from 'express';
import * as mpesaWebhook from './mpesa.webhook.js';

const router = Router();

/**
 * @openapi
 * /webhooks/mpesa:
 *   post:
 *     tags: [Webhooks]
 *     summary: Receive M-Pesa callback
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook received
 */
router.post('/webhooks/mpesa', mpesaWebhook.handleCallback);

export default router;
