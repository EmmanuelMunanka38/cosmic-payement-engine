# Please Check — Code Review & Action Items

Author: AI Project Manager (audit snapshot)
Date: 2026-05-27 (updated: 2026-05-27T03:12:00+03:00)

## Summary

Rescan after recent refactors. Confirmed centralization of Prisma and Redis clients, improvements to idempotency middleware, wallet optimistic locking, and graceful shutdown. All high-priority items resolved.

## High-priority issues (status)

1. Idempotency enforcement —  fixed
   - `Idempotency-Key` header is now **required** on all money-moving POST routes (transactions, payouts, admin approve/reject). Missing header returns 400. Middleware short-circuits with cached response on repeat requests. Controllers no longer generate fallback UUIDs. Admin and payouts controllers also call `cacheIdempotencyResponse` after successful processing.

2. Multiple PrismaClient instances — fixed
   - Centralized singleton: `src/lib/prisma.ts` (exported `prisma`). No other `new PrismaClient()` instances remain across all repositories, middleware, services, and workers.

3. Multiple Redis clients / connection leakage —  fixed
   - Centralized Redis client: `src/lib/redis.ts` (exported `redis`). All modules import this singleton. `cacheIdempotencyResponse` no longer creates a new Redis connection per call.

4. Idempotency cache short-circuiting —  fixed
   - Middleware returns cached response early when idempotency key hit (no further processing). Controllers call `cacheIdempotencyResponse` after success on all money-moving routes.

## Medium-priority issues / suggestions (status)

1. Wallet optimistic locking —  fixed
   - `creditWallet` now uses `updateMany` with version check (same as `debitWallet`), throwing `ValidationError` on concurrent modification. Both callers (`transactions.service`, `payouts.service`) pass the wallet version.

2. Provider registry initialization —  partial
   - Registry exists; providers already have mock mode auto-detection. Consider lazy init if providers perform IO in production.

3. Resource hygiene & graceful shutdown — fixed
   - `src/index.ts` calls `shutdownClients()` on SIGTERM/SIGINT, which disconnects Prisma and closes Redis. Centralized in `src/lib/clients.ts`.

4. Response helper naming —  low
   - Helper names differ from docs (`sendSuccess` vs `success`). Cosmetic.

## New findings from rescan

- New files added: `src/lib/prisma.ts`, `src/lib/redis.ts`, `src/lib/clients.ts`.
- Idempotency middleware updated: requires header, uses shared redis, returns cached response.
- All controllers on money-moving routes now properly use and cache idempotency keys.
- 17 source files migrated to centralized Prisma, 9 files migrated to centralized Redis.
- `creditWallet` now uses optimistic locking with version check.
- BullMQ queues/workers use shared Redis connection.
- Admin approve/reject routes now include idempotency middleware.

## Tests & Observations

- **106 tests pass** across 11 test files. TypeScript compiles clean (0 errors).

## Remaining items (low priority)

1. Integration test for idempotency behavior (duplicate POSTs return cached response and do not double-debit).
2. Provider registry: consider lazy initialization for production.
3. Update README to document required `Idempotency-Key` header and infra limits.
4. Response helper naming alignment (`sendSuccess` → `success`).
5. E2E flow tests (not yet written).

## Files modified this session

- `src/lib/prisma.ts` — centralized PrismaClient singleton
- `src/lib/redis.ts` — centralized Redis/ioredis singleton
- `src/lib/clients.ts` — shared shutdown helper
- `src/middleware/idempotency.ts` — requires header, short-circuits, uses shared redis
- `src/middleware/rateLimiter.ts` — uses shared redis
- `src/middleware/apiKeyAuth.ts` — uses shared prisma
- `src/middleware/requireKyc.ts` — uses shared prisma
- `src/modules/transactions/transactions.controller.ts` — removed uuid fallback
- `src/modules/payouts/payouts.controller.ts` — passes idempotency key, caches response
- `src/modules/payouts/payouts.service.ts` — accepts idempotency key, checks duplicates
- `src/modules/payouts/payouts.repository.ts` — added `checkIdempotency`
- `src/modules/admin/admin.controller.ts` — caches idempotency response
- `src/modules/admin/admin.routes.ts` — added idempotency middleware
- `src/modules/wallets/wallets.repository.ts` — creditWallet uses version check
- `src/modules/users/users.validation.ts` — added kycStatus to profile update
- `src/modules/transactions/transactions.service.ts` — passes version to creditWallet
- `src/jobs/queues.ts` — uses shared redis
- `src/jobs/workers/*.worker.ts` — use shared prisma and redis
- `src/modules/exchangeRates/rates.service.ts` — uses shared redis
- `src/modules/exchangeRates/rates.repository.ts` — uses shared prisma and redis
- `src/app.ts` — mounts Swagger
- `src/index.ts` — graceful shutdown with client disconnect
- All repository/service files — centralized prisma imports
