import { PaymentProvider } from '../../types/enums.js';
import { PaymentProvider as IProvider } from './interfaces/payment-provider.interface.js';
import { CardProvider } from './interfaces/card-provider.interface.js';
import { StripeCardProvider } from './stripe/stripe.provider.js';
import { MpesaProvider } from './mpesa/mpesa.provider.js';
import { MtnMomoProvider } from './mtn/mtn-momo.provider.js';
import { AirtelMoneyProvider } from './airtel/airtel.provider.js';
import { OrangeMoneyProvider } from './orange/orange-money.provider.js';
import { WaveProvider } from './wave/wave.provider.js';

class ProviderRegistry {
  private mobileProviders: Map<PaymentProvider, IProvider> = new Map();
  private cardProvider: CardProvider;

  constructor() {
    this.cardProvider = new StripeCardProvider();
    this.mobileProviders.set(PaymentProvider.MPESA, new MpesaProvider());
    this.mobileProviders.set(PaymentProvider.MTN_MOMO, new MtnMomoProvider());
    this.mobileProviders.set(PaymentProvider.AIRTEL_MONEY, new AirtelMoneyProvider());
    this.mobileProviders.set(PaymentProvider.ORANGE_MONEY, new OrangeMoneyProvider());
    this.mobileProviders.set(PaymentProvider.WAVE, new WaveProvider());
  }

  getMobileProvider(provider: PaymentProvider): IProvider {
    const instance = this.mobileProviders.get(provider);
    if (!instance) throw new Error(`Mobile money provider '${provider}' not registered`);
    return instance;
  }

  getCardProvider(): CardProvider {
    return this.cardProvider;
  }

  getSupportedProviders(): PaymentProvider[] {
    return Array.from(this.mobileProviders.keys());
  }

  isMobileMoneyProvider(provider: PaymentProvider): boolean {
    return this.mobileProviders.has(provider);
  }
}

export const providerRegistry = new ProviderRegistry();
