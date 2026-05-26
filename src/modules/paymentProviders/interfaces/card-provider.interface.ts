import { CurrencyCode } from '../../../types/enums.js';

export interface CardPaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: CurrencyCode;
  status: string;
  metadata?: Record<string, unknown>;
}

export interface CardPaymentConfirmation {
  id: string;
  status: string;
  amount: number;
  currency: CurrencyCode;
  fee: number;
  netAmount: number;
}

export interface CardProvider {
  getProviderName(): string;
  createPaymentIntent(params: {
    amount: number;
    currency: CurrencyCode;
    userId: string;
    metadata?: Record<string, unknown>;
    returnUrl?: string;
  }): Promise<CardPaymentIntent>;
  confirmPayment(paymentIntentId: string): Promise<CardPaymentConfirmation>;
  verifyWebhookSignature(rawBody: string, signature: string): boolean;
  handleWebhook(event: unknown): Promise<{ type: string; data: unknown }>;
}
