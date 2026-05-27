import { getConfig } from '../../../config/index.js';
import { CurrencyCode, PaymentProvider } from '../../../types/enums.js';
import {
  InitPaymentParams,
  PaymentResult,
  DisburseParams,
} from '../interfaces/payment-provider.interface.js';
import { BaseMobileMoneyProvider } from '../interfaces/mobile-money.interface.js';
import { ProviderError } from '../../../utils/errors.js';

interface MtnCredentials {
  apiKey: string;
  apiSecret: string;
  subscriptionKey: string;
  environment: string;
}

export class MtnMomoProvider extends BaseMobileMoneyProvider {
  private creds: MtnCredentials;
  private baseUrl: string;
  private token: string | null = null;
  private tokenExpiry: number = 0;
  private apiUser: string | null = null;

  constructor() {
    super();
    const config = getConfig();
    this.creds = {
      apiKey: config.MTN_MOMO_API_KEY || 'mock_key',
      apiSecret: config.MTN_MOMO_API_SECRET || 'mock_secret',
      subscriptionKey: config.MTN_MOMO_SUBSCRIPTION_KEY || 'mock_sub_key',
      environment: config.MTN_MOMO_ENVIRONMENT,
    };
    this.baseUrl =
      this.creds.environment === 'production'
        ? 'https://momoe.api.mtn.com'
        : 'https://sandbox.momodeveloper.mtn.com';
  }

  getProviderName(): PaymentProvider {
    return PaymentProvider.MTN_MOMO;
  }

  private async ensureApiUser(): Promise<string> {
    if (this.apiUser) return this.apiUser;

    const referenceId = crypto.randomUUID();
    if (this.creds.apiKey === 'mock_key') {
      this.apiUser = `mock_user_${referenceId}`;
      return this.apiUser;
    }

    const res = await fetch(`${this.baseUrl}/v1_0/apiuser`, {
      method: 'POST',
      headers: {
        'X-Reference-Id': referenceId,
        'Ocp-Apim-Subscription-Key': this.creds.subscriptionKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ providerCallbackHost: process.env.APP_URL || 'localhost:3000' }),
    });

    if (!res.ok && res.status !== 409) {
      throw new ProviderError('MTN_MOMO', 'Failed to create API user');
    }

    this.apiUser = referenceId;
    return this.apiUser;
  }

  private async getApiKey(): Promise<string> {
    if (!this.apiUser || this.creds.apiKey === 'mock_key') return 'mock_key';

    const res = await fetch(`${this.baseUrl}/v1_0/apiuser/${this.apiUser}/apikey`, {
      method: 'POST',
      headers: { 'Ocp-Apim-Subscription-Key': this.creds.subscriptionKey },
    });

    if (!res.ok) throw new ProviderError('MTN_MOMO', 'Failed to get API key');
    const data = (await res.json()) as { apiKey: string };
    return data.apiKey;
  }

  private async getAccessToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiry) return this.token;

    if (this.creds.apiKey === 'mock_key') {
      this.token = 'mock_access_token';
      this.tokenExpiry = Date.now() + 3600000;
      return this.token;
    }

    const user = await this.ensureApiUser();
    const apiKey = await this.getApiKey();
    const auth = Buffer.from(`${user}:${apiKey}`).toString('base64');

    const res = await fetch(`${this.baseUrl}/collection/token/`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Ocp-Apim-Subscription-Key': this.creds.subscriptionKey,
      },
    });

    if (!res.ok) throw new ProviderError('MTN_MOMO', 'Failed to get access token');
    const data = (await res.json()) as { access_token: string; expires_in: number };
    this.token = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return this.token;
  }

  async initPayment(params: InitPaymentParams): Promise<PaymentResult> {
    const token = await this.getAccessToken();
    const referenceId = crypto.randomUUID();
    const callbackUrl = params.callbackUrl || this.getCallbackUrl('mtn-momo');

    const body = {
      amount: String(Math.round(params.amount * 100)),
      currency: params.currency,
      externalId: params.reference,
      payer: { partyIdType: 'MSISDN', partyId: params.phone.replace('+', '') },
      payerMessage: params.description || 'Payment',
      payeeNote: params.description || 'Payment',
    };

    if (this.creds.apiKey === 'mock_key') {
      return {
        providerTransactionId: `MTN_MOCK_${Date.now()}`,
        status: 'pending',
        additionalData: { referenceId },
      };
    }

    const res = await fetch(`${this.baseUrl}/collection/v1_0/requesttopay`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Reference-Id': referenceId,
        'X-Target-Environment': this.creds.environment === 'production' ? 'production' : 'sandbox',
        'Ocp-Apim-Subscription-Key': this.creds.subscriptionKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new ProviderError('MTN_MOMO', `RequestToPay failed: ${errBody}`);
    }

    return {
      providerTransactionId: referenceId,
      status: 'pending',
      additionalData: { callbackUrl },
    };
  }

  async checkPaymentStatus(
    providerTransactionId: string,
  ): Promise<{ status: string; providerData?: unknown }> {
    if (providerTransactionId.startsWith('MTN_MOCK')) {
      return {
        status: 'success',
        providerData: { financialTransactionId: `FT_MOCK_${Date.now()}` },
      };
    }

    const token = await this.getAccessToken();
    const res = await fetch(
      `${this.baseUrl}/collection/v1_0/requesttopay/${providerTransactionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Target-Environment':
            this.creds.environment === 'production' ? 'production' : 'sandbox',
          'Ocp-Apim-Subscription-Key': this.creds.subscriptionKey,
        },
      },
    );

    if (!res.ok) return { status: 'unknown', providerData: null };
    const data = (await res.json()) as any;
    return { status: data.status === 'SUCCESSFUL' ? 'success' : 'failed', providerData: data };
  }

  async disburse(params: DisburseParams): Promise<PaymentResult> {
    const token = await this.getAccessToken();
    const referenceId = crypto.randomUUID();

    const body = {
      amount: String(Math.round(params.amount * 100)),
      currency: params.currency,
      externalId: params.reference,
      payee: { partyIdType: 'MSISDN', partyId: params.phone.replace('+', '') },
      payerMessage: params.description || 'Payout',
      payeeNote: params.description || 'Payout',
    };

    if (this.creds.apiKey === 'mock_key') {
      return { providerTransactionId: `MTN_DISBURSE_MOCK_${Date.now()}`, status: 'pending' };
    }

    const res = await fetch(`${this.baseUrl}/disbursement/v1_0/transfer`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Reference-Id': referenceId,
        'X-Target-Environment': this.creds.environment === 'production' ? 'production' : 'sandbox',
        'Ocp-Apim-Subscription-Key': this.creds.subscriptionKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new ProviderError('MTN_MOMO', `Disbursement failed: ${errBody}`);
    }

    return { providerTransactionId: referenceId, status: 'pending' };
  }

  async checkBalance(): Promise<{ available: number; currency: CurrencyCode }> {
    return { available: 500000, currency: CurrencyCode.UGX };
  }

  async handleWebhook(
    rawBody: unknown,
    headers: unknown,
  ): Promise<{ event: string; data: unknown }> {
    return { event: 'mtn_momo.callback', data: rawBody };
  }
}
