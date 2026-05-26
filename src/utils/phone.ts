import { CurrencyCode } from '../types/enums.js';

const FIAT_DECIMALS: Record<string, number> = {
  USD: 2, EUR: 2, GBP: 2, KES: 2, NGN: 2, UGX: 0, GHS: 2, TZS: 2, XAF: 0, XOF: 0, RWF: 0, ZMW: 2, MAD: 2, ZAR: 2,
};

export function getDecimals(currency: string): number {
  return FIAT_DECIMALS[currency] ?? 2;
}

export function formatAmount(amount: number, currency: string): string {
  return amount.toFixed(getDecimals(currency));
}

export function toMinorUnits(amount: number, currency: string): number {
  return Math.round(amount * Math.pow(10, getDecimals(currency)));
}

export function fromMinorUnits(amount: number, currency: string): number {
  return amount / Math.pow(10, getDecimals(currency));
}

export const AFRICAN_CURRENCIES = ['KES', 'NGN', 'UGX', 'GHS', 'TZS', 'XAF', 'XOF', 'RWF', 'ZMW', 'MAD', 'ZAR'];

interface NetworkRule {
  prefix: string;
  network: string;
  country: string;
  currency: string;
}

const NETWORK_RULES: NetworkRule[] = [
  { prefix: '+25470', network: 'MPESA', country: 'KE', currency: 'KES' },
  { prefix: '+25471', network: 'MPESA', country: 'KE', currency: 'KES' },
  { prefix: '+25472', network: 'MPESA', country: 'KE', currency: 'KES' },
  { prefix: '+25479', network: 'MPESA', country: 'KE', currency: 'KES' },
  { prefix: '+25473', network: 'AIRTEL_MONEY', country: 'KE', currency: 'KES' },
  { prefix: '+25474', network: 'AIRTEL_MONEY', country: 'KE', currency: 'KES' },
  { prefix: '+25574', network: 'MPESA', country: 'TZ', currency: 'TZS' },
  { prefix: '+25575', network: 'MPESA', country: 'TZ', currency: 'TZS' },
  { prefix: '+25576', network: 'MPESA', country: 'TZ', currency: 'TZS' },
  { prefix: '+25571', network: 'AIRTEL_MONEY', country: 'TZ', currency: 'TZS' },
  { prefix: '+25677', network: 'MTN_MOMO', country: 'UG', currency: 'UGX' },
  { prefix: '+25678', network: 'MTN_MOMO', country: 'UG', currency: 'UGX' },
  { prefix: '+25676', network: 'MTN_MOMO', country: 'UG', currency: 'UGX' },
  { prefix: '+25670', network: 'AIRTEL_MONEY', country: 'UG', currency: 'UGX' },
  { prefix: '+25675', network: 'AIRTEL_MONEY', country: 'UG', currency: 'UGX' },
  { prefix: '+23324', network: 'MTN_MOMO', country: 'GH', currency: 'GHS' },
  { prefix: '+23325', network: 'MTN_MOMO', country: 'GH', currency: 'GHS' },
  { prefix: '+23326', network: 'MTN_MOMO', country: 'GH', currency: 'GHS' },
  { prefix: '+23350', network: 'AIRTEL_MONEY', country: 'GH', currency: 'GHS' },
  { prefix: '+23354', network: 'AIRTEL_MONEY', country: 'GH', currency: 'GHS' },
  { prefix: '+23355', network: 'AIRTEL_MONEY', country: 'GH', currency: 'GHS' },
  { prefix: '+25078', network: 'MTN_MOMO', country: 'RW', currency: 'RWF' },
  { prefix: '+25079', network: 'MTN_MOMO', country: 'RW', currency: 'RWF' },
  { prefix: '+26097', network: 'MTN_MOMO', country: 'ZM', currency: 'ZMW' },
];

export function detectNetwork(phone: string): { network: string | null; country: string | null; currency: string | null; confidence: number } {
  const normalized = phone.replace(/[^+\d]/g, '');
  const matched = NETWORK_RULES.find((rule) => normalized.startsWith(rule.prefix));

  if (matched) {
    return { network: matched.network, country: matched.country, currency: matched.currency, confidence: 1.0 };
  }

  const twoDigit = normalized.slice(0, 5);
  const partial = NETWORK_RULES.find((rule) => twoDigit.startsWith(rule.prefix.slice(0, 5)));
  if (partial) {
    return { network: partial.network, country: partial.country, currency: partial.currency, confidence: 0.6 };
  }

  return { network: null, country: null, currency: null, confidence: 0 };
}

export function normalizePhone(phone: string): string {
  let normalized = phone.replace(/[^+\d]/g, '');
  if (!normalized.startsWith('+')) {
    if (normalized.startsWith('00')) {
      normalized = `+${normalized.slice(2)}`;
    }
  }
  return normalized;
}

export function formatE164(phone: string): string {
  return normalizePhone(phone);
}
