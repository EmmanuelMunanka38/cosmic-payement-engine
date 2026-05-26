import Stripe from 'stripe';
import { getConfig } from '../../../config/index.js';
import { CurrencyCode, PaymentProvider } from '../../../types/enums.js';
import { CardProvider, CardPaymentIntent, CardPaymentConfirmation } from '../interfaces/card-provider.interface.js';
import { ProviderError } from '../../../utils/errors.js';
import { logger } from '../../../config/logger.js';

export class StripeCardProvider implements CardProvider {
  private stripe: Stripe;

  constructor() {
    const config = getConfig();
    if (!config.STRIPE_SECRET_KEY) {
      logger.warn('Stripe secret key not configured — using mock mode');
      this.stripe = null as any;
    } else {
      this.stripe = new Stripe(config.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' });
    }
  }

  getProviderName(): string {
    return 'stripe';
  }

  async createPaymentIntent(params: {
    amount: number;
    currency: CurrencyCode;
    userId: string;
    metadata?: Record<string, unknown>;
    returnUrl?: string;
  }): Promise<CardPaymentIntent> {
    if (!this.stripe) {
      return {
        id: `pi_mock_${Date.now()}`,
        clientSecret: `pi_mock_secret_${Date.now()}`,
        amount: params.amount,
        currency: params.currency,
        status: 'requires_payment_method',
        metadata: { userId: params.userId, ...params.metadata },
      };
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(params.amount * 100),
        currency: params.currency.toLowerCase(),
        metadata: {
          userId: params.userId,
          ...Object.fromEntries(Object.entries(params.metadata || {}).map(([k, v]) => [k, String(v)])),
        },
        ...(params.returnUrl ? { return_url: params.returnUrl } : {}),
      });

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret || '',
        amount: params.amount,
        currency: params.currency,
        status: paymentIntent.status,
        metadata: paymentIntent.metadata as Record<string, unknown>,
      };
    } catch (err) {
      throw new ProviderError('STRIPE', 'Failed to create payment intent', err);
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<CardPaymentConfirmation> {
    if (!this.stripe) {
      return {
        id: paymentIntentId,
        status: 'succeeded',
        amount: 0,
        currency: CurrencyCode.USD,
        fee: 0,
        netAmount: 0,
      };
    }

    try {
      const pi = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      const fee = pi.amount_received ? Math.round(pi.amount_received * 0.029 + 30) / 100 : 0;

      return {
        id: pi.id,
        status: pi.status,
        amount: (pi.amount_received || 0) / 100,
        currency: pi.currency.toUpperCase() as CurrencyCode,
        fee,
        netAmount: ((pi.amount_received || 0) / 100) - fee,
      };
    } catch (err) {
      throw new ProviderError('STRIPE', 'Failed to confirm payment', err);
    }
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!this.stripe) return true;

    try {
      const config = getConfig();
      if (!config.STRIPE_WEBHOOK_SECRET) return true;
      this.stripe.webhooks.constructEvent(rawBody, signature, config.STRIPE_WEBHOOK_SECRET);
      return true;
    } catch {
      return false;
    }
  }

  async handleWebhook(event: unknown): Promise<{ type: string; data: unknown }> {
    const stripeEvent = event as Stripe.Event;
    return {
      type: stripeEvent.type,
      data: stripeEvent.data.object,
    };
  }
}
