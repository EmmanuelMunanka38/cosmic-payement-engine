import { Router } from 'express';
import * as stripeWebhook from './stripe.webhook.js';

const router = Router();

router.post('/webhooks/stripe', stripeWebhook.handleWebhook);
router.get('/api/v1/stripe/publishable-key', stripeWebhook.getPublishableKey);

export default router;
