import { CurrencyCode } from '../types/enums.js';

const FIAT_DECIMALS: Record<CurrencyCode, number> = {
  [CurrencyCode.USD]: 2,
  [CurrencyCode.EUR]: 2,
  [CurrencyCode.GBP]: 2,
  [CurrencyCode.KES]: 2,
  [CurrencyCode.NGN]: 2,
  [CurrencyCode.UGX]: 0,
  [CurrencyCode.GHS]: 2,
  [CurrencyCode.TZS]: 2,
  [CurrencyCode.XAF]: 0,
  [CurrencyCode.XOF]: 0,
  [CurrencyCode.RWF]: 0,
  [CurrencyCode.ZMW]: 2,
  [CurrencyCode.MAD]: 2,
  [CurrencyCode.ZAR]: 2,
};

export function getDecimals(currency: CurrencyCode): number {
  return FIAT_DECIMALS[currency] ?? 2;
}

export function formatAmount(amount: number, currency: CurrencyCode): string {
  return amount.toFixed(getDecimals(currency));
}

export function toMinorUnits(amount: number, currency: CurrencyCode): number {
  return Math.round(amount * Math.pow(10, getDecimals(currency)));
}

export function fromMinorUnits(amount: number, currency: CurrencyCode): number {
  return amount / Math.pow(10, getDecimals(currency));
}

export const AFRICAN_CURRENCIES: CurrencyCode[] = [
  CurrencyCode.KES,
  CurrencyCode.NGN,
  CurrencyCode.UGX,
  CurrencyCode.GHS,
  CurrencyCode.TZS,
  CurrencyCode.XAF,
  CurrencyCode.XOF,
  CurrencyCode.RWF,
  CurrencyCode.ZMW,
  CurrencyCode.MAD,
  CurrencyCode.ZAR,
];
