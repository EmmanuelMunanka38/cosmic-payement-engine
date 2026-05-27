# Cosmic Payment — Build Checklist

## Phase 1: Foundation

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

- [x] `src/config/index.ts` — validated config singleton
- [x] `src/config/logger.ts` — Pino logger
- [x] `src/types/enums.ts` — all enums
- [x] `src/types/index.ts` — shared types
- [x] `src/utils/errors.ts` — AppError classes
- [x] `src/utils/response.ts` — standardized response helpers
- [x] `src/utils/currency.ts` — currency formatting
- [x] `src/utils/phone.ts` — phone parsing + network detection
- [x] `src/utils/pagination.ts` — cursor-based pagination

## Phase 3: Middleware

- [x] `src/middleware/auth.ts` — JWT verification
- [x] `src/middleware/apiKeyAuth.ts` — API key auth for B2B
- [x] `src/middleware/rateLimiter.ts` — Redis sliding window
- [x] `src/middleware/idempotency.ts` — idempotency key check
- [x] `src/middleware/validate.ts` — Zod validation
- [x] `src/middleware/errorHandler.ts` — global error handler
- [x] `src/middleware/requestLogger.ts` — Pino request logging
- [x] `src/middleware/requireKyc.ts` — KYC gate

## Phase 4: Auth Module

- [x] `src/modules/auth/auth.validation.ts`
- [x] `src/modules/auth/auth.repository.ts`
- [x] `src/modules/auth/auth.service.ts`
- [x] `src/modules/auth/auth.controller.ts`
- [x] `src/modules/auth/auth.routes.ts`
- [x] Auth tests (11 tests, all passing)

## Phase 5: User Module

- [x] `src/modules/users/users.validation.ts`
- [x] `src/modules/users/users.repository.ts`
- [x] `src/modules/users/users.service.ts`
- [x] `src/modules/users/users.controller.ts`
- [x] `src/modules/users/users.routes.ts`
- [x] User tests (4 tests, all passing)

## Phase 6: Wallet Module

- [x] `src/modules/wallets/wallets.validation.ts`
- [x] `src/modules/wallets/wallets.repository.ts`
- [x] `src/modules/wallets/wallets.service.ts`
- [x] `src/modules/wallets/wallets.controller.ts`
- [x] `src/modules/wallets/wallets.routes.ts`
- [x] Wallet tests (7 tests, all passing)

## Phase 7: Exchange Rates Module

- [x] `src/modules/exchangeRates/rates.validation.ts`
- [x] `src/modules/exchangeRates/rates.repository.ts`
- [x] `src/modules/exchangeRates/rates.service.ts`
- [x] `src/modules/exchangeRates/rates.controller.ts`
- [x] `src/modules/exchangeRates/rates.routes.ts`
- [x] `src/modules/exchangeRates/rates.cron.ts`
- [x] Rates tests (8 tests, all passing)

## Phase 8: Transaction Module

- [x] `src/modules/transactions/transaction.state.ts`
- [x] `src/modules/transactions/transactions.validation.ts`
- [x] `src/modules/transactions/transactions.repository.ts`
- [x] `src/modules/transactions/transactions.service.ts`
- [x] `src/modules/transactions/transactions.controller.ts`
- [x] `src/modules/transactions/transactions.routes.ts`
- [x] Transaction tests (13 tests, all passing)

## Phase 9: Payment Provider Adapters

- [x] `src/modules/paymentProviders/interfaces/payment-provider.interface.ts`
- [x] `src/modules/paymentProviders/interfaces/card-provider.interface.ts`
- [x] `src/modules/paymentProviders/interfaces/mobile-money.interface.ts`
- [x] `src/modules/paymentProviders/provider-registry.ts`
- [x] `src/modules/paymentProviders/phone-network-detector.ts`
- [x] **Stripe** adapter (behind CardProvider interface)
- [x] **M-Pesa** adapter (Daraja API)
- [x] **MTN MoMo** adapter
- [x] **Airtel Money** adapter
- [x] **Orange Money** adapter
- [x] **Wave** adapter

## Phase 10: Payout Module

- [x] `src/modules/payouts/payouts.validation.ts`
- [x] `src/modules/payouts/payouts.repository.ts`
- [x] `src/modules/payouts/payouts.service.ts`
- [x] `src/modules/payouts/payouts.controller.ts`
- [x] `src/modules/payouts/payouts.routes.ts`
- [x] Payout tests (5 tests, all passing)

## Phase 11: Webhooks Module

- [x] `src/modules/webhooks/webhooks.controller.ts`
- [x] `src/modules/webhooks/webhooks.service.ts`
- [x] `src/modules/webhooks/webhooks.repository.ts`
- [x] `src/modules/webhooks/webhooks.routes.ts`
- [x] Webhooks tests (3 tests, all passing)

## Phase 12: KYC Module

- [x] `src/modules/kyc/kyc.validation.ts`
- [x] `src/modules/kyc/kyc.service.ts`
- [x] `src/modules/kyc/kyc.repository.ts`
- [x] `src/modules/kyc/kyc.controller.ts`
- [x] `src/modules/kyc/kyc.routes.ts`
- [x] KYC tests (6 tests, all passing)

## Phase 13: Admin Module

- [x] `src/modules/admin/admin.service.ts`
- [x] `src/modules/admin/admin.repository.ts`
- [x] `src/modules/admin/admin.controller.ts`
- [x] `src/modules/admin/admin.routes.ts`
- [x] `src/modules/admin/admin.middleware.ts`
- [x] Admin tests (6 tests, all passing)

## Phase 14: Ledger Module

- [x] `src/modules/ledger/ledger.types.ts`
- [x] `src/modules/ledger/ledger.validation.ts`
- [x] `src/modules/ledger/ledger.service.ts`
- [ ] Ledger tests (not yet written)

## Phase 15: API Keys Module

- [x] `src/modules/apiKeys/apiKeys.validation.ts`
- [x] `src/modules/apiKeys/apiKeys.service.ts`
- [x] `src/modules/apiKeys/apiKeys.repository.ts`
- [x] `src/modules/apiKeys/apiKeys.controller.ts`
- [x] `src/modules/apiKeys/apiKeys.routes.ts`
- [x] API Keys tests (4 tests, all passing)

## Phase 16: Jobs & Queues

- [x] `src/jobs/queues.ts` — BullMQ queue definitions
- [x] `src/jobs/workers/webhook-delivery.worker.ts`
- [x] `src/jobs/workers/payout-settlement.worker.ts`
- [x] `src/jobs/workers/transaction-timeout.worker.ts`
- [x] `src/jobs/workers/rate-refresh.worker.ts`

## Phase 17: App Entry & Server

- [x] `src/app.ts` — Express app with all middleware + routes
- [x] `src/index.ts` — Server entry point

## Phase 18: Tests

- [x] Vitest setup (`vitest.setup.ts`)
- [x] Auth module tests (11 tests)
- [x] User module tests (4 tests)
- [x] Wallet module tests (7 tests)
- [x] Transaction module tests (13 tests)
- [x] Exchange rates module tests (8 tests)
- [x] Payout module tests (5 tests)
- [x] Webhooks module tests (3 tests)
- [x] KYC module tests (6 tests)
- [x] Admin module tests (6 tests)
- [x] API Keys module tests (4 tests)
- [x] Provider adapter tests (35 tests)
- [ ] E2E flow tests (not yet written)

## Phase 19: Sandbox Testing Environment

- [x] `src/modules/sandbox/sandbox.validation.ts` — Zod schemas
- [x] `src/modules/sandbox/sandbox.service.ts` — sandbox business logic (separate sandbox DB)
- [x] `src/modules/sandbox/sandbox.controller.ts` — 7 route handlers
- [x] `src/modules/sandbox/sandbox.routes.ts` — routes at `/api/v1/sandbox/*`
- [x] `src/lib/prisma.ts` — dual PrismaClient (production + sandbox with `SANDBOX_DATABASE_URL`)
- [x] Repo DI pattern — repos accept optional prisma client for sandbox isolation
- [x] `POSTMAN.md` — full Postman testing guide with sandbox flow

**Sandbox Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/sandbox/api-keys` | Create sand\_ API key + fund wallets |
| GET | `/api/v1/sandbox/api-keys` | List sandbox keys |
| GET | `/api/v1/sandbox/transactions` | List sandbox txns |
| POST | `/api/v1/sandbox/simulate/stripe` | Simulate Stripe webhook |
| POST | `/api/v1/sandbox/simulate/mpesa` | Simulate M-Pesa callback |
| POST | `/api/v1/sandbox/simulate/payout` | Resolve pending payout |
| POST | `/api/v1/sandbox/reset` | Wipe all sandbox data |

**Architecture:**

- Separate `cosmic_payment_sandbox` database
- `getSandboxPrisma()` returns a dedicated PrismaClient for sandbox ops
- Production repos accept optional `_prisma` param (injected by sandbox service)
- Sandbox payouts auto-succeed without calling real money providers

## Phase 20: Polish

- [x] Swagger/OpenAPI docs (`src/config/swagger.ts`)
- [x] Prisma seed script (`prisma/seed.ts`)
- [x] GitHub Actions CI (`.github/workflows/ci.yml`)
- [ ] Production readiness review (not yet done)
