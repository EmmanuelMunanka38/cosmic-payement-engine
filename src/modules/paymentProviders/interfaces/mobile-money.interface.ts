import { CurrencyCode, PaymentProvider as ProviderEnum } from '../../../types/enums.js';
import { PaymentProvider as IProvider, InitPaymentParams, PaymentResult, DisburseParams } from './payment-provider.interface.js';

export abstract class BaseMobileMoneyProvider implements IProvider {
  abstract getProviderName(): ProviderEnum;
  abstract initPayment(params: InitPaymentParams): Promise<PaymentResult>;
  abstract checkPaymentStatus(providerTransactionId: string): Promise<{ status: string; providerData?: unknown }>;
  abstract disburse(params: DisburseParams): Promise<PaymentResult>;
  abstract checkBalance(): Promise<{ available: number; currency: CurrencyCode }>;
  abstract handleWebhook(rawBody: unknown, headers: unknown): Promise<{ event: string; data: unknown }>;

  verifyWebhookSignature(rawBody: string, _signature: string, _secret: string): boolean {
    return true;
  }

  protected getCallbackUrl(path: string): string {
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    return `${baseUrl}/webhooks/${path}`;
  }
}
