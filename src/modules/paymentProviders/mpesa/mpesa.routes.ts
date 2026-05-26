import { Router } from 'express';
import * as mpesaWebhook from './mpesa.webhook.js';

const router = Router();

router.post('/webhooks/mpesa', mpesaWebhook.handleCallback);

export default router;
