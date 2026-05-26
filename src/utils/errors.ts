export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

export class AuthError extends AppError {
  constructor(code: string, message: string) {
    super(401, code, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(403, 'FORBIDDEN', message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(404, 'NOT_FOUND', id ? `${resource} with id '${id}' not found` : `${resource} not found`);
  }
}

export class InsufficientBalanceError extends AppError {
  constructor() {
    super(400, 'INSUFFICIENT_BALANCE', 'Insufficient wallet balance');
  }
}

export class ProviderError extends AppError {
  constructor(provider: string, message: string, details?: unknown) {
    super(502, 'PROVIDER_ERROR', `[${provider}] ${message}`, details);
  }
}

export class IdempotencyError extends AppError {
  constructor() {
    super(422, 'IDEMPOTENCY_KEY_REUSE', 'Idempotency key already used with different parameters');
  }
}

export class RateExpiredError extends AppError {
  constructor() {
    super(400, 'RATE_EXPIRED', 'Exchange rate quote has expired. Please request a new quote.');
  }
}

export class KycRequiredError extends AppError {
  constructor() {
    super(403, 'KYC_REQUIRED', 'KYC verification is required to perform this action');
  }
}
