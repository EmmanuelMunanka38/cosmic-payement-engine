# Cosmic Payment — AI Agent Rules

## Project Overview

Cross-border payment gateway for Africa (like Nala + Stripe + Mobile Money).  
Monolithic TypeScript backend with Express, Prisma, PostgreSQL, Redis, BullMQ.

## Code Conventions
- **No comments in code** unless explaining a non-obvious business rule
- **TypeScript strict mode** — no `any`, no `as` casts unless unavoidable
- **Module pattern**: `controller → service → repository` per module
- **Files**: `<module>.<layer>.ts` (e.g. `users.controller.ts`, `users.service.ts`)
- **Exports**: named exports only, no default exports
- **Error handling**: throw `AppError` subclasses (defined in `utils/errors.ts`)
- **Validation**: Zod schemas in `<module>.validation.ts`, never inline

## Architecture Rules

1. Payment provider adapters implement interfaces from `paymentProviders/interfaces/`
2. All provider-specific logic stays in its own folder under `paymentProviders/`
3. Stripe is abstracted behind `CardProvider` interface — app never imports stripe SDK outside `paymentProviders/stripe/`
4. Every `POST` endpoint that moves money MUST accept `Idempotency-Key` header
5. Wallet balance changes use optimistic locking (version field)
6. BullMQ queues for: async webhook delivery, payout settlement, notifications, rate refresh

## Module Structure

```
src/modules/<module>/
  <module>.controller.ts   — route handlers (thin, calls service)
  <module>.service.ts      — business logic
  <module>.repository.ts   — Prisma queries
  <module>.validation.ts   — Zod schemas
  <module>.routes.ts       — route definitions
  __tests__/
```

## Response Format

Always use `utils/response.ts` helpers:

- `success(res, data, meta?)` — `{ status: "success", data, meta }`
- `paginated(res, data, cursor, hasMore, total)` — `{ status: "success", data, meta: { cursor, hasMore, total } }`
- Errors are thrown as `AppError` subclasses, caught by global error handler

## Testing

- Vitest + Supertest
- Unit tests for services (mock repositories)
- Integration tests for controllers
- Provider adapter tests use sandbox credentials
- Coverage minimum: 80% service layer

## Git

- No commits without explicit user request
- Descriptive commit messages focusing on "why"


## major rule  in fintech 
- a single error on the logic some does not get a meal tonight 
