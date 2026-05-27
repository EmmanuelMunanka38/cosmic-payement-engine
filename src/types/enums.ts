export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum KycStatus {
  UNVERIFIED = 'UNVERIFIED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  KES = 'KES',
  NGN = 'NGN',
  UGX = 'UGX',
  GHS = 'GHS',
  TZS = 'TZS',
  XAF = 'XAF',
  XOF = 'XOF',
  RWF = 'RWF',
  ZMW = 'ZMW',
  MAD = 'MAD',
  ZAR = 'ZAR',
}

export enum TransactionType {
  SEND = 'SEND',
  RECEIVE = 'RECEIVE',
  CROSS_BORDER_SEND = 'CROSS_BORDER_SEND',
  CROSS_BORDER_RECEIVE = 'CROSS_BORDER_RECEIVE',
  PAYOUT = 'PAYOUT',
  REFUND = 'REFUND',
  FEE = 'FEE',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum PaymentProvider {
  STRIPE = 'STRIPE',
  MPESA = 'MPESA',
  MTN_MOMO = 'MTN_MOMO',
  AIRTEL_MONEY = 'AIRTEL_MONEY',
  ORANGE_MONEY = 'ORANGE_MONEY',
  WAVE = 'WAVE',
  PAYSTACK = 'PAYSTACK',
  FLUTTERWAVE = 'FLUTTERWAVE',
}

export enum Environment {
  SANDBOX = 'SANDBOX',
  PRODUCTION = 'PRODUCTION',
}

export enum WebhookEventStatus {
  RECEIVED = 'RECEIVED',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
}
