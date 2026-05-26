import { Request, Response, NextFunction } from 'express';
import { getConfig } from '../../../config/index.js';
import { StripeCardProvider } from './stripe.provider.js';
import { sendSuccess } from '../../../utils/response.js';
import { logger } from '../../../config/logger.js';

const stripeProvider = new StripeCardProvider();

export async function handleWebhook(req: Request, res: Response): Promise<void> {
  const config = getConfig();
  const sig = req.headers['stripe-signature'] as string;

  if (!stripeProvider.verifyWebhookSignature(JSON.stringify(req.body), sig)) {
    res.status(400).json({ error: 'Invalid signature' });
    return;
  }

  try {
    const { type, data } = await stripeProvider.handleWebhook(req.body);
    logger.info({ eventType: type }, 'Stripe webhook received');

    if (type === 'payment_intent.succeeded') {
      const paymentIntent = data as any;
      logger.info({ paymentIntentId: paymentIntent.id, amount: paymentIntent.amount }, 'Payment succeeded');
    }

    if (type === 'payment_intent.payment_failed') {
      const paymentIntent = data as any;
      logger.warn({ paymentIntentId: paymentIntent.id, error: paymentIntent.last_payment_error }, 'Payment failed');
    }

    res.json({ received: true });
  } catch (err) {
    logger.error({ err }, 'Error processing Stripe webhook');
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

export async function getPublishableKey(_req: Request, res: Response): Promise<void> {
  const config = getConfig();
  sendSuccess(res, { publishableKey: config.STRIPE_PUBLISHABLE_KEY || '' });
}
