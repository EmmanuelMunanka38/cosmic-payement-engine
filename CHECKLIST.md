# Cosmic Payment — Build Checklist

## Phase 1: Foundation ✅

- [x] Project directory structure
- [x] AGENTS.md — AI rules
- [x] BUILD.md — architecture & module map
- [x] CHECKLIST.md — this file
- [x] package.json — dependencies & scripts
- [x] tsconfig.json — strict TypeScript
- [x] .env.example — all environment variables
- [x] docker-compose.yml — PostgreSQL + Redis
- [x] Dockerfile — multi-stage production build
- [x] Prisma schema — all models & enums

## Phase 2: Core Infrastructure

- [ ] `src/config/index.ts` — validated config singleton
- [ ] `src/config/logger.ts` — Pino logger
- [ ] `src/types/enums.ts` — all enums
- [ ] `src/types/index.ts` — shared types
- [ ] `src/utils/errors.ts` — AppError classes
- [ ] `src/utils/response.ts` — standardized response helpers
- [ ] `src/utils/currency.ts` — currency formatting
- [ ] `src/utils/phone.ts` — phone parsing + network detection
- [ ] `src/utils/pagination.ts` — cursor-based pagination

## Phase 3: Middleware

- [ ] `src/middleware/auth.ts` — JWT verification
- [ ] `src/middleware/apiKeyAuth.ts` — API key auth for B2B
- [ ] `src/middleware/rateLimiter.ts` — Redis sliding window
- [ ] `src/middleware/idempotency.ts` — idempotency key check
- [ ] `src/middleware/validate.ts` — Zod validation
- [ ] `src/middleware/errorHandler.ts` — global error handler
- [ ] `src/middleware/requestLogger.ts` — Pino request logging
- [ ] `src/middleware/requireKyc.ts` — KYC gate

## Phase 4: Auth Module

- [ ] `src/modules/auth/auth.validation.ts`
- [ ] `src/modules/auth/auth.service.ts`
- [ ] `src/modules/auth/auth.controller.ts`
- [ ] `src/modules/auth/auth.routes.ts`
- [ ] Auth tests

## Phase 5: User Module

- [ ] `src/modules/users/users.validation.ts`
- [ ] `src/modules/users/users.repository.ts`
- [ ] `src/modules/users/users.service.ts`
- [ ] `src/modules/users/users.controller.ts`
- [ ] `src/modules/users/users.routes.ts`
- [ ] User tests

## Phase 6: Wallet Module

- [ ] `src/modules/wallets/wallets.validation.ts`
- [ ] `src/modules/wallets/wallets.repository.ts`
- [ ] `src/modules/wallets/wallets.service.ts`
- [ ] `src/modules/wallets/wallets.controller.ts`
- [ ] `src/modules/wallets/wallets.routes.ts`
- [ ] Wallet tests

## Phase 7: Exchange Rates Module

- [ ] `src/modules/exchangeRates/rates.validation.ts`
- [ ] `src/modules/exchangeRates/rates.repository.ts`
- [ ] `src/modules/exchangeRates/rates.service.ts`
- [ ] `src/modules/exchangeRates/rates.controller.ts`
- [ ] `src/modules/exchangeRates/rates.routes.ts`
- [ ] `src/modules/exchangeRates/rates.cron.ts`
- [ ] Rates tests

## Phase 8: Transaction Module

- [ ] `src/modules/transactions/transaction.state.ts`
- [ ] `src/modules/transactions/transactions.validation.ts`
- [ ] `src/modules/transactions/transactions.repository.ts`
- [ ] `src/modules/transactions/transactions.service.ts`
- [ ] `src/modules/transactions/transactions.controller.ts`
- [ ] `src/modules/transactions/transactions.routes.ts`
- [ ] Transaction tests

## Phase 9: Payment Provider Adapters

- [ ] `src/modules/paymentProviders/interfaces/payment-provider.interface.ts`
- [ ] `src/modules/paymentProviders/interfaces/card-provider.interface.ts`
- [ ] `src/modules/paymentProviders/interfaces/mobile-money.interface.ts`
- [ ] `src/modules/paymentProviders/provider-registry.ts`
- [ ] `src/modules/paymentProviders/phone-network-detector.ts`
- [ ] **Stripe** adapter (behind CardProvider interface)
- [ ] **M-Pesa** adapter (Daraja API)
- [ ] **MTN MoMo** adapter
- [ ] **Airtel Money** adapter
- [ ] **Orange Money** adapter
- [ ] **Wave** adapter

## Phase 10: Payout Module

- [ ] `src/modules/payouts/payouts.validation.ts`
- [ ] `src/modules/payouts/payouts.repository.ts`
- [ ] `src/modules/payouts/payouts.service.ts`
- [ ] `src/modules/payouts/payouts.controller.ts`
- [ ] `src/modules/payouts/payouts.routes.ts`
- [ ] Payout tests

## Phase 11: Webhooks Module

- [ ] `src/modules/webhooks/webhooks.controller.ts`
- [ ] `src/modules/webhooks/webhooks.service.ts`
- [ ] `src/modules/webhooks/webhooks.routes.ts`

## Phase 12: KYC Module

- [ ] `src/modules/kyc/kyc.validation.ts`
- [ ] `src/modules/kyc/kyc.service.ts`
- [ ] `src/modules/kyc/kyc.controller.ts`
- [ ] `src/modules/kyc/kyc.routes.ts`

## Phase 13: Admin Module

- [ ] `src/modules/admin/admin.service.ts`
- [ ] `src/modules/admin/admin.controller.ts`
- [ ] `src/modules/admin/admin.routes.ts`
- [ ] `src/modules/admin/admin.middleware.ts`

## Phase 14: Ledger Module

- [ ] `src/modules/ledger/ledger.types.ts`
- [ ] `src/modules/ledger/ledger.validation.ts`
- [ ] `src/modules/ledger/ledger.service.ts`

## Phase 15: API Keys Module

- [ ] `src/modules/apiKeys/apiKeys.validation.ts`
- [ ] `src/modules/apiKeys/apiKeys.service.ts`
- [ ] `src/modules/apiKeys/apiKeys.controller.ts`
- [ ] `src/modules/apiKeys/apiKeys.routes.ts`

## Phase 16: Jobs & Queues

- [ ] `src/jobs/queues.ts` — BullMQ queue definitions
- [ ] `src/jobs/workers/webhook-delivery.worker.ts`
- [ ] `src/jobs/workers/payout-settlement.worker.ts`
- [ ] `src/jobs/workers/transaction-timeout.worker.ts`
- [ ] `src/jobs/workers/rate-refresh.worker.ts`

## Phase 17: App Entry & Server

- [ ] `src/app.ts` — Express app with all middleware + routes
- [ ] `src/index.ts` — Server entry point

## Phase 18: Tests

- [ ] Vitest config
- [ ] Auth module tests
- [ ] User module tests
- [ ] Wallet module tests
- [ ] Transaction module tests
- [ ] Provider adapter tests (sandbox)
- [ ] E2E flow tests

## Phase 19: Polish

- [ ] Swagger/OpenAPI docs
- [ ] Prisma seed script
- [ ] GitHub Actions CI
- [ ] Production readiness review
