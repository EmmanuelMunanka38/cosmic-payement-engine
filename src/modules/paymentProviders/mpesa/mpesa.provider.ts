import { getConfig } from '../../../config/index.js';
import { CurrencyCode, PaymentProvider } from '../../../types/enums.js';
import { InitPaymentParams, PaymentResult, DisburseParams } from '../interfaces/payment-provider.interface.js';
import { BaseMobileMoneyProvider } from '../interfaces/mobile-money.interface.js';
import { ProviderError } from '../../../utils/errors.js';
import { logger } from '../../../config/logger.js';

export class MpesaProvider extends BaseMobileMoneyProvider {
  private baseUrl: string;
  private consumerKey: string;
  private consumerSecret: string;
  private passkey: string;
  private shortcode: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    super();
    const config = getConfig();
    this.consumerKey = config.MPESA_CONSUMER_KEY || 'mock_key';
    this.consumerSecret = config.MPESA_CONSUMER_SECRET || 'mock_secret';
    this.passkey = config.MPESA_PASSKEY || 'mock_passkey';
    this.shortcode = config.MPESA_SHORTCODE || '174379';
    this.baseUrl = config.MPESA_ENVIRONMENT === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
  }

  getProviderName(): PaymentProvider {
    return PaymentProvider.MPESA;
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) return this.accessToken;

    if (!this.consumerKey || this.consumerKey === 'mock_key') {
      this.accessToken = 'mock_access_token';
      this.tokenExpiry = Date.now() + 3600000;
      return this.accessToken;
    }

    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
    const res = await fetch(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!res.ok) throw new ProviderError('MPESA', 'Failed to get access token');

    const data = await res.json() as { access_token: string; expires_in: number };
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return this.accessToken;
  }

  async initPayment(params: InitPaymentParams): Promise<PaymentResult> {
    const token = await this.getAccessToken();
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const password = Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');

    const body = {
      BusinessShortCode: this.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(params.amount),
      PartyA: params.phone.replace('+', ''),
      PartyB: this.shortcode,
      PhoneNumber: params.phone.replace('+', ''),
      CallBackURL: params.callbackUrl || this.getCallbackUrl('mpesa'),
      AccountReference: params.reference.slice(0, 12),
      TransactionDesc: params.description || 'Payment',
    };

    if (this.consumerKey === 'mock_key') {
      return {
        providerTransactionId: `MPESA_MOCK_${Date.now()}`,
        status: 'pending',
        additionalData: { merchantRequestId: `MR_MOCK_${Date.now()}`, checkoutRequestId: `CR_MOCK_${Date.now()}` },
      };
    }

    const res = await fetch(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json() as any;
    if (data.ResponseCode !== '0') throw new ProviderError('MPESA', data.ResponseDescription || 'STK Push failed');

    return {
      providerTransactionId: data.CheckoutRequestID,
      status: 'pending',
      additionalData: { merchantRequestId: data.MerchantRequestID },
    };
  }

  async checkPaymentStatus(providerTransactionId: string): Promise<{ status: string; providerData?: unknown }> {
    if (providerTransactionId.startsWith('MPESA_MOCK')) {
      return { status: 'success', providerData: { resultCode: 0, resultDesc: 'Success' } };
    }

    const token = await this.getAccessToken();
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const password = Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');

    const res = await fetch(`${this.baseUrl}/mpesa/stkpushquery/v1/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: providerTransactionId,
      }),
    });

    const data = await res.json() as any;
    return { status: data.ResultCode === 0 ? 'success' : 'failed', providerData: data };
  }

  async disburse(params: DisburseParams): Promise<PaymentResult> {
    const token = await this.getAccessToken();

    const body = {
      InitiatorName: 'testapi',
      SecurityCredential: token,
      CommandID: 'BusinessPayment',
      Amount: Math.round(params.amount),
      PartyA: this.shortcode,
      PartyB: params.phone.replace('+', ''),
      Remarks: params.description || 'Payout',
      QueueTimeOutURL: this.getCallbackUrl('mpesa/timeout'),
      ResultURL: this.getCallbackUrl('mpesa/result'),
      Occasion: '',
    };

    if (this.consumerKey === 'mock_key') {
      return {
        providerTransactionId: `MPESA_B2C_MOCK_${Date.now()}`,
        status: 'pending',
      };
    }

    const res = await fetch(`${this.baseUrl}/mpesa/b2c/v1/paymentrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json() as any;
    return { providerTransactionId: data.ConversationID || data.OriginatorConversationID, status: 'pending' };
  }

  async checkBalance(): Promise<{ available: number; currency: CurrencyCode }> {
    return { available: 1000000, currency: CurrencyCode.KES };
  }

  async handleWebhook(rawBody: unknown, headers: unknown): Promise<{ event: string; data: unknown }> {
    const body = rawBody as any;
    if (body.Body?.stkCallback) {
      return { event: 'mpesa.stk_callback', data: body.Body.stkCallback };
    }
    return { event: 'mpesa.unknown', data: body };
  }
}
