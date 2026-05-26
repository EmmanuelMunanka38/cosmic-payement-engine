import { CurrencyCode, PaymentProvider as ProviderEnum } from '../../../types/enums.js';

export interface InitPaymentParams {
  amount: number;
  currency: CurrencyCode;
  phone: string;
  reference: string;
  description?: string;
  callbackUrl?: string;
}

export interface PaymentResult {
  providerTransactionId: string;
  status: string;
  additionalData?: Record<string, unknown>;
}

export interface DisburseParams {
  amount: number;
  currency: CurrencyCode;
  phone: string;
  reference: string;
  description?: string;
}

export interface PaymentProvider {
  getProviderName(): ProviderEnum;
  initPayment(params: InitPaymentParams): Promise<PaymentResult>;
  checkPaymentStatus(providerTransactionId: string): Promise<{ status: string; providerData?: unknown }>;
  disburse(params: DisburseParams): Promise<PaymentResult>;
  checkBalance(): Promise<{ available: number; currency: CurrencyCode }>;
  handleWebhook(rawBody: unknown, headers: unknown): Promise<{ event: string; data: unknown }>;
  verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean;
}
