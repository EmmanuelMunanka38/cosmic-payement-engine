import { Request, Response } from 'express';
import { PaymentProvider } from '../../types/enums.js';
import * as webhookService from './webhooks.service.js';
import { logger } from '../../config/logger.js';

export function receiveWebhook(provider: PaymentProvider) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const eventType = req.body?.type || req.body?.event || 'unknown';
      const event = await webhookService.processWebhook(provider, eventType, req.body, req.headers);

      logger.info({ provider, eventType, webhookId: event.id }, 'Webhook received');

      res.status(200).json({ received: true, id: event.id });
    } catch (err) {
      logger.error({ err, provider }, 'Webhook processing failed');
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  };
}
