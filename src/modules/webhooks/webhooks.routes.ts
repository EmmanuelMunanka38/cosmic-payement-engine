import { Router } from 'express';
import { PaymentProvider } from '../../types/enums.js';
import { receiveWebhook } from './webhooks.controller.js';

const router = Router();

/**
 * @openapi
 * /webhooks/{provider}:
 *   post:
 *     tags: [Webhooks]
 *     summary: Receive provider webhook callback
 *     parameters:
 *       - in: path
 *         name: provider
 *         required: true
 *         schema: { type: string, enum: [stripe, mpesa, mtn-momo, airtel, orange-money, wave] }
 *     responses:
 *       200:
 *         description: Webhook received
 */
router.post('/stripe', receiveWebhook(PaymentProvider.STRIPE));
router.post('/mpesa', receiveWebhook(PaymentProvider.MPESA));
router.post('/mtn-momo', receiveWebhook(PaymentProvider.MTN_MOMO));
router.post('/airtel', receiveWebhook(PaymentProvider.AIRTEL_MONEY));
router.post('/orange-money', receiveWebhook(PaymentProvider.ORANGE_MONEY));
router.post('/wave', receiveWebhook(PaymentProvider.WAVE));

export default router;
