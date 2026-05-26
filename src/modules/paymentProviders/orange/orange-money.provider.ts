import { getConfig } from '../../../config/index.js';
import { CurrencyCode, PaymentProvider } from '../../../types/enums.js';
import { InitPaymentParams, PaymentResult, DisburseParams } from '../interfaces/payment-provider.interface.js';
import { BaseMobileMoneyProvider } from '../interfaces/mobile-money.interface.js';
import { ProviderError } from '../../../utils/errors.js';

export class OrangeMoneyProvider extends BaseMobileMoneyProvider {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;

  constructor() {
    super();
    const config = getConfig();
    this.clientId = config.ORANGE_CLIENT_ID || 'mock_client_id';
    this.clientSecret = config.ORANGE_CLIENT_SECRET || 'mock_secret';
    this.baseUrl = 'https://api.orange.com';
  }

  getProviderName(): PaymentProvider {
    return PaymentProvider.ORANGE_MONEY;
  }

  async initPayment(params: InitPaymentParams): Promise<PaymentResult> {
    if (this.clientId === 'mock_client_id') {
      return { providerTransactionId: `ORANGE_MOCK_${Date.now()}`, status: 'pending' };
    }

    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const tokenRes = await fetch(`${this.baseUrl}/oauth/v2/token`, {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials',
    });

    if (!tokenRes.ok) throw new ProviderError('ORANGE', 'Failed to get token');
    const tokenData = await tokenRes.json() as { access_token: string };
    const token = tokenData.access_token;

    const res = await fetch(`${this.baseUrl}/orange-money-webpay/api/v1/webpayment`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchant_key: this.clientId,
        currency: params.currency,
        amount: Math.round(params.amount),
        reference: params.reference,
        description: params.description || 'Payment',
        return_url: params.callbackUrl || this.getCallbackUrl('orange-money'),
        cancel_url: params.callbackUrl || this.getCallbackUrl('orange-money'),
        notify_url: params.callbackUrl || this.getCallbackUrl('orange-money'),
        lang: 'en',
      }),
    });

    if (!res.ok) throw new ProviderError('ORANGE', 'Payment initiation failed');
    const data = await res.json() as any;
    return { providerTransactionId: data.pay_token || data.reference, status: 'pending', additionalData: { redirectUrl: data.payment_url } };
  }

  async checkPaymentStatus(providerTransactionId: string): Promise<{ status: string; providerData?: unknown }> {
    return { status: 'success' };
  }

  async disburse(params: DisburseParams): Promise<PaymentResult> {
    if (this.clientId === 'mock_client_id') {
      return { providerTransactionId: `ORANGE_DISBURSE_MOCK_${Date.now()}`, status: 'pending' };
    }
    return { providerTransactionId: `ORANGE_DISBURSE_${Date.now()}`, status: 'success' };
  }

  async checkBalance(): Promise<{ available: number; currency: CurrencyCode }> {
    return { available: 200000, currency: CurrencyCode.XOF };
  }

  async handleWebhook(rawBody: unknown, headers: unknown): Promise<{ event: string; data: unknown }> {
    return { event: 'orange_money.callback', data: rawBody };
  }
}
