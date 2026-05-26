import { CurrencyCode, PaymentProvider, TransactionType, UserRole } from './enums';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest {
  user: JwtPayload;
}

export interface PaginationParams {
  cursor?: string;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  cursor: string | null;
  hasMore: boolean;
  total?: number;
}

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    cursor?: string;
    hasMore?: boolean;
    total?: number;
  };
}

export interface CreateTransactionInput {
  userId: string;
  type: TransactionType;
  sourceCurrency: CurrencyCode;
  destinationCurrency: CurrencyCode;
  sourceAmount: number;
  destinationAmount?: number;
  fee?: number;
  fxRate?: number;
  provider?: PaymentProvider;
  senderPhone?: string;
  recipientPhone?: string;
  recipientName?: string;
  recipientProvider?: PaymentProvider;
  description?: string;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
}

export interface NetworkDetectionResult {
  network: PaymentProvider | null;
  country: string | null;
  currency: CurrencyCode | null;
  confidence: number;
}
