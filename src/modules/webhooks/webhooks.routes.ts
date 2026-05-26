import { Router } from 'express';
import { PaymentProvider } from '../../types/enums.js';
import { receiveWebhook } from './webhooks.controller.js';

const router = Router();

router.post('/stripe', receiveWebhook(PaymentProvider.STRIPE));
router.post('/mpesa', receiveWebhook(PaymentProvider.MPESA));
router.post('/mtn-momo', receiveWebhook(PaymentProvider.MTN_MOMO));
router.post('/airtel', receiveWebhook(PaymentProvider.AIRTEL_MONEY));
router.post('/orange-money', receiveWebhook(PaymentProvider.ORANGE_MONEY));
router.post('/wave', receiveWebhook(PaymentProvider.WAVE));

export default router;
