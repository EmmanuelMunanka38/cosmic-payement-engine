import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CurrencyCode, PaymentProvider } from '../../../types/enums.js';

vi.mock('../../../config/logger.js', () => ({
  logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../config/index.js', () => ({
  getConfig: vi.fn(() => ({
    STRIPE_SECRET_KEY: '',
    STRIPE_WEBHOOK_SECRET: '',
    MPESA_CONSUMER_KEY: 'mock_key',
    MPESA_CONSUMER_SECRET: 'mock_secret',
    MPESA_PASSKEY: 'mock_passkey',
    MPESA_SHORTCODE: '174379',
    MPESA_ENVIRONMENT: 'sandbox',
    MTN_MOMO_API_KEY: 'mock_key',
    MTN_MOMO_API_SECRET: 'mock_secret',
    MTN_MOMO_SUBSCRIPTION_KEY: 'mock_sub_key',
    MTN_MOMO_ENVIRONMENT: 'sandbox',
    AIRTEL_CLIENT_ID: 'mock_client_id',
    AIRTEL_CLIENT_SECRET: 'mock_client_secret',
    AIRTEL_ENVIRONMENT: 'sandbox',
    ORANGE_CLIENT_ID: 'mock_client_id',
    ORANGE_CLIENT_SECRET: 'mock_secret',
    WAVE_API_KEY: 'mock_key',
    WAVE_ENVIRONMENT: 'test',
    APP_URL: 'http://localhost:3000',
  })),
}));

const mockParams = {
  amount: 1000,
  currency: CurrencyCode.KES,
  phone: '+254700000000',
  reference: 'REF-123',
  description: 'Test payment',
};

describe('StripeCardProvider', () => {
  let provider: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { StripeCardProvider } = await import('../stripe/stripe.provider.js');
    provider = new StripeCardProvider();
  });

  it('returns provider name', () => {
    expect(provider.getProviderName()).toBe('stripe');
  });

  it('creates payment intent in mock mode', async () => {
    const result = await provider.createPaymentIntent({
      amount: 5000,
      currency: CurrencyCode.USD,
      userId: 'user-1',
    });

    expect(result.id).toContain('pi_mock_');
    expect(result.clientSecret).toContain('pi_mock_secret_');
    expect(result.amount).toBe(5000);
    expect(result.currency).toBe(CurrencyCode.USD);
    expect(result.status).toBe('requires_payment_method');
  });

  it('confirms payment in mock mode', async () => {
    const result = await provider.confirmPayment('pi_mock_123');

    expect(result.status).toBe('succeeded');
    expect(result.id).toBe('pi_mock_123');
  });

  it('verifies webhook signature in mock mode', () => {
    expect(provider.verifyWebhookSignature('{}', 'sig')).toBe(true);
  });

  it('handles webhook event', async () => {
    const event = { type: 'payment_intent.succeeded', data: { object: { id: 'pi_123' } } };
    const result = await provider.handleWebhook(event);

    expect(result.type).toBe('payment_intent.succeeded');
    expect(result.data).toEqual({ id: 'pi_123' });
  });
});

describe('MpesaProvider', () => {
  let provider: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { MpesaProvider } = await import('../mpesa/mpesa.provider.js');
    provider = new MpesaProvider();
  });

  it('returns provider name', () => {
    expect(provider.getProviderName()).toBe(PaymentProvider.MPESA);
  });

  it('initiates payment in mock mode', async () => {
    const result = await provider.initPayment(mockParams);

    expect(result.providerTransactionId).toContain('MPESA_MOCK_');
    expect(result.status).toBe('pending');
  });

  it('checks payment status for mock transaction', async () => {
    const result = await provider.checkPaymentStatus('MPESA_MOCK_123');

    expect(result.status).toBe('success');
  });

  it('disburses in mock mode', async () => {
    const result = await provider.disburse(mockParams);

    expect(result.providerTransactionId).toContain('MPESA_B2C_MOCK_');
    expect(result.status).toBe('pending');
  });

  it('checks balance', async () => {
    const result = await provider.checkBalance();

    expect(result.available).toBe(1000000);
    expect(result.currency).toBe(CurrencyCode.KES);
  });

  it('handles webhook with STK callback', async () => {
    const body = { Body: { stkCallback: { ResultCode: 0 } } };
    const result = await provider.handleWebhook(body, {});

    expect(result.event).toBe('mpesa.stk_callback');
  });

  it('verifies webhook signature', () => {
    expect(provider.verifyWebhookSignature('{}', 'sig', 'secret')).toBe(true);
  });
});

describe('MtnMomoProvider', () => {
  let provider: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { MtnMomoProvider } = await import('../mtn/mtn-momo.provider.js');
    provider = new MtnMomoProvider();
  });

  it('returns provider name', () => {
    expect(provider.getProviderName()).toBe(PaymentProvider.MTN_MOMO);
  });

  it('initiates payment in mock mode', async () => {
    const result = await provider.initPayment(mockParams);

    expect(result.providerTransactionId).toContain('MTN_MOCK_');
    expect(result.status).toBe('pending');
  });

  it('checks payment status for mock transaction', async () => {
    const result = await provider.checkPaymentStatus('MTN_MOCK_123');

    expect(result.status).toBe('success');
  });

  it('disburses in mock mode', async () => {
    const result = await provider.disburse(mockParams);

    expect(result.providerTransactionId).toContain('MTN_DISBURSE_MOCK_');
    expect(result.status).toBe('pending');
  });

  it('checks balance', async () => {
    const result = await provider.checkBalance();

    expect(result.available).toBe(500000);
    expect(result.currency).toBe(CurrencyCode.UGX);
  });
});

describe('AirtelMoneyProvider', () => {
  let provider: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { AirtelMoneyProvider } = await import('../airtel/airtel.provider.js');
    provider = new AirtelMoneyProvider();
  });

  it('returns provider name', () => {
    expect(provider.getProviderName()).toBe(PaymentProvider.AIRTEL_MONEY);
  });

  it('initiates payment in mock mode', async () => {
    const result = await provider.initPayment(mockParams);

    expect(result.providerTransactionId).toContain('AIRTEL_MOCK_');
    expect(result.status).toBe('pending');
  });

  it('disburses in mock mode', async () => {
    const result = await provider.disburse(mockParams);

    expect(result.providerTransactionId).toContain('AIRTEL_DISBURSE_MOCK_');
    expect(result.status).toBe('pending');
  });

  it('checks balance', async () => {
    const result = await provider.checkBalance();

    expect(result.available).toBe(300000);
    expect(result.currency).toBe(CurrencyCode.KES);
  });
});

describe('OrangeMoneyProvider', () => {
  let provider: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { OrangeMoneyProvider } = await import('../orange/orange-money.provider.js');
    provider = new OrangeMoneyProvider();
  });

  it('returns provider name', () => {
    expect(provider.getProviderName()).toBe(PaymentProvider.ORANGE_MONEY);
  });

  it('initiates payment in mock mode', async () => {
    const result = await provider.initPayment(mockParams);

    expect(result.providerTransactionId).toContain('ORANGE_MOCK_');
    expect(result.status).toBe('pending');
  });

  it('disburses in mock mode', async () => {
    const result = await provider.disburse(mockParams);

    expect(result.providerTransactionId).toContain('ORANGE_DISBURSE_MOCK_');
    expect(result.status).toBe('pending');
  });

  it('checks balance', async () => {
    const result = await provider.checkBalance();

    expect(result.available).toBe(200000);
    expect(result.currency).toBe(CurrencyCode.XOF);
  });
});

describe('WaveProvider', () => {
  let provider: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { WaveProvider } = await import('../wave/wave.provider.js');
    provider = new WaveProvider();
  });

  it('returns provider name', () => {
    expect(provider.getProviderName()).toBe(PaymentProvider.WAVE);
  });

  it('initiates payment in mock mode', async () => {
    const result = await provider.initPayment(mockParams);

    expect(result.providerTransactionId).toContain('WAVE_MOCK_');
    expect(result.status).toBe('pending');
  });

  it('checks payment status for mock transaction', async () => {
    const result = await provider.checkPaymentStatus('WAVE_MOCK_123');

    expect(result.status).toBe('success');
  });

  it('disburses in mock mode', async () => {
    const result = await provider.disburse(mockParams);

    expect(result.providerTransactionId).toContain('WAVE_DISBURSE_MOCK_');
    expect(result.status).toBe('pending');
  });

  it('checks balance', async () => {
    const result = await provider.checkBalance();

    expect(result.available).toBe(100000);
    expect(result.currency).toBe(CurrencyCode.XOF);
  });
});

describe('ProviderRegistry', () => {
  let registry: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { providerRegistry } = await import('../provider-registry.js');
    registry = providerRegistry;
  });

  it('returns registered mobile providers', () => {
    const providers = registry.getSupportedProviders();

    expect(providers).toContain(PaymentProvider.MPESA);
    expect(providers).toContain(PaymentProvider.MTN_MOMO);
    expect(providers).toContain(PaymentProvider.AIRTEL_MONEY);
    expect(providers).toContain(PaymentProvider.ORANGE_MONEY);
    expect(providers).toContain(PaymentProvider.WAVE);
  });

  it('returns a mobile provider instance', () => {
    const provider = registry.getMobileProvider(PaymentProvider.MPESA);

    expect(provider.getProviderName()).toBe(PaymentProvider.MPESA);
  });

  it('throws for unregistered provider', () => {
    expect(() => registry.getMobileProvider('INVALID' as any)).toThrow('not registered');
  });

  it('identifies mobile money providers', () => {
    expect(registry.isMobileMoneyProvider(PaymentProvider.MPESA)).toBe(true);
    expect(registry.isMobileMoneyProvider(PaymentProvider.STRIPE)).toBe(false);
  });

  it('returns card provider', () => {
    const cardProvider = registry.getCardProvider();

    expect(cardProvider.getProviderName()).toBe('stripe');
  });
});
