import { Router } from 'express';
import * as stripeWebhook from './stripe.webhook.js';

const router = Router();

/**
 * @openapi
 * /webhooks/stripe:
 *   post:
 *     tags: [Webhooks]
 *     summary: Receive Stripe webhook callback
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
router.post('/webhooks/stripe', stripeWebhook.handleWebhook);

/**
 * @openapi
 * /api/v1/stripe/publishable-key:
 *   get:
 *     tags: [Stripe]
 *     summary: Get Stripe publishable key
 *     responses:
 *       200:
 *         description: Publishable key
 */
router.get('/api/v1/stripe/publishable-key', stripeWebhook.getPublishableKey);

export default router;
