import { getConfig } from '../../../config/index.js';
import { CurrencyCode, PaymentProvider } from '../../../types/enums.js';
import { InitPaymentParams, PaymentResult, DisburseParams } from '../interfaces/payment-provider.interface.js';
import { BaseMobileMoneyProvider } from '../interfaces/mobile-money.interface.js';
import { ProviderError } from '../../../utils/errors.js';

export class WaveProvider extends BaseMobileMoneyProvider {
  private apiKey: string;
  private baseUrl: string;
  private environment: string;

  constructor() {
    super();
    const config = getConfig();
    this.apiKey = config.WAVE_API_KEY || 'mock_key';
    this.environment = config.WAVE_ENVIRONMENT;
    this.baseUrl = this.environment === 'test' ? 'https://api.wave.com/v1' : 'https://api.wave.com/v1';
  }

  getProviderName(): PaymentProvider {
    return PaymentProvider.WAVE;
  }

  async initPayment(params: InitPaymentParams): Promise<PaymentResult> {
    if (this.apiKey === 'mock_key') {
      return {
        providerTransactionId: `WAVE_MOCK_${Date.now()}`,
        status: 'pending',
        additionalData: { checkoutUrl: `https://mock.wave.com/checkout/${params.reference}` },
      };
    }

    const res = await fetch(`${this.baseUrl}/checkout/sessions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(params.amount * 100),
        currency: params.currency,
        client_reference: params.reference,
        error_url: params.callbackUrl || this.getCallbackUrl('wave/error'),
        success_url: params.callbackUrl || this.getCallbackUrl('wave/success'),
        ...(params.description ? { note: params.description } : {}),
      }),
    });

    if (!res.ok) throw new ProviderError('WAVE', 'Failed to create checkout session');
    const data = await res.json() as any;
    return {
      providerTransactionId: data.id,
      status: 'pending',
      additionalData: { checkoutUrl: data.wave_launch_url },
    };
  }

  async checkPaymentStatus(providerTransactionId: string): Promise<{ status: string; providerData?: unknown }> {
    if (providerTransactionId.startsWith('WAVE_MOCK')) {
      return { status: 'success' };
    }

    const res = await fetch(`${this.baseUrl}/checkout/sessions/${providerTransactionId}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });

    if (!res.ok) return { status: 'unknown' };
    const data = await res.json() as any;
    return { status: data.payment_status === 'complete' ? 'success' : 'pending', providerData: data };
  }

  async disburse(params: DisburseParams): Promise<PaymentResult> {
    if (this.apiKey === 'mock_key') {
      return { providerTransactionId: `WAVE_DISBURSE_MOCK_${Date.now()}`, status: 'pending' };
    }

    const res = await fetch(`${this.baseUrl}/payouts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(params.amount * 100),
        currency: params.currency,
        mobile: params.phone,
        client_reference: params.reference,
      }),
    });

    if (!res.ok) throw new ProviderError('WAVE', 'Payout failed');
    const data = await res.json() as any;
    return { providerTransactionId: data.id, status: 'pending' };
  }

  async checkBalance(): Promise<{ available: number; currency: CurrencyCode }> {
    return { available: 100000, currency: CurrencyCode.XOF };
  }

  async handleWebhook(rawBody: unknown, headers: unknown): Promise<{ event: string; data: unknown }> {
    return { event: 'wave.webhook', data: rawBody };
  }
}
