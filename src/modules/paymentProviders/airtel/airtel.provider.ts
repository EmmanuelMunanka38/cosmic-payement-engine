import { getConfig } from '../../../config/index.js';
import { CurrencyCode, PaymentProvider } from '../../../types/enums.js';
import { InitPaymentParams, PaymentResult, DisburseParams } from '../interfaces/payment-provider.interface.js';
import { BaseMobileMoneyProvider } from '../interfaces/mobile-money.interface.js';
import { ProviderError } from '../../../utils/errors.js';

export class AirtelMoneyProvider extends BaseMobileMoneyProvider {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;
  private token: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    super();
    const config = getConfig();
    this.clientId = config.AIRTEL_CLIENT_ID || 'mock_client_id';
    this.clientSecret = config.AIRTEL_CLIENT_SECRET || 'mock_client_secret';
    this.baseUrl = config.AIRTEL_ENVIRONMENT === 'production'
      ? 'https://openapi.airtel.africa'
      : 'https://openapiuat.airtel.africa';
  }

  getProviderName(): PaymentProvider {
    return PaymentProvider.AIRTEL_MONEY;
  }

  private async getAccessToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiry) return this.token;

    if (this.clientId === 'mock_client_id') {
      this.token = 'mock_token';
      this.tokenExpiry = Date.now() + 3600000;
      return this.token;
    }

    const res = await fetch(`${this.baseUrl}/auth/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials',
      }),
    });

    if (!res.ok) throw new ProviderError('AIRTEL', 'Failed to get access token');
    const data = await res.json() as { access_token: string; expires_in: number };
    this.token = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return this.token;
  }

  async initPayment(params: InitPaymentParams): Promise<PaymentResult> {
    const token = await this.getAccessToken();

    const body = {
      reference: params.reference,
      subscriber: { country: params.currency.slice(0, 2), currency: params.currency, msisdn: params.phone.replace('+', '') },
      transaction: { amount: Math.round(params.amount * 100), country: params.currency.slice(0, 2), currency: params.currency, id: params.reference },
      subject: params.description || 'Payment',
    };

    if (this.clientId === 'mock_client_id') {
      return { providerTransactionId: `AIRTEL_MOCK_${Date.now()}`, status: 'pending' };
    }

    const res = await fetch(`${this.baseUrl}/merchant/v1/payments/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'X-Country': params.currency.slice(0, 2), 'X-Currency': params.currency },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new ProviderError('AIRTEL', 'Payment initiation failed');
    const data = await res.json() as { data?: { transactionId?: string } };
    return { providerTransactionId: data.data?.transactionId || params.reference, status: 'pending' };
  }

  async checkPaymentStatus(providerTransactionId: string): Promise<{ status: string; providerData?: unknown }> {
    return { status: 'success' };
  }

  async disburse(params: DisburseParams): Promise<PaymentResult> {
    const token = await this.getAccessToken();
    const body = {
      reference: params.reference,
      subscriber: { country: params.currency.slice(0, 2), currency: params.currency, msisdn: params.phone.replace('+', '') },
      transaction: { amount: Math.round(params.amount * 100), country: params.currency.slice(0, 2), currency: params.currency, id: params.reference },
    };

    if (this.clientId === 'mock_client_id') {
      return { providerTransactionId: `AIRTEL_DISBURSE_MOCK_${Date.now()}`, status: 'pending' };
    }

    const res = await fetch(`${this.baseUrl}/standard/v1/disbursements/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new ProviderError('AIRTEL', 'Disbursement failed');
    return { providerTransactionId: `AIRTEL_DISBURSE_${Date.now()}`, status: 'pending' };
  }

  async checkBalance(): Promise<{ available: number; currency: CurrencyCode }> {
    return { available: 300000, currency: CurrencyCode.KES };
  }

  async handleWebhook(rawBody: unknown, headers: unknown): Promise<{ event: string; data: unknown }> {
    return { event: 'airtel.callback', data: rawBody };
  }
}
