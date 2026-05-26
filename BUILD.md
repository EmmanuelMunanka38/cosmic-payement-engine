# Cosmic Payment — Build Plan

## What We're Building

A cross-border payment gateway for Africa — like **Nala + Stripe + Mobile Money** combined.  
Diaspora sends money via card (Stripe), platform handles FX conversion, recipient receives via mobile money (M-Pesa, MTN MoMo, Airtel Money, Orange Money, Wave).

## Architecture: Modular Monolith

## Core Flows

### Cross-Border Send (Card → Mobile Money)

1. User (diaspora) specifies amount + destination currency
2. System fetches FX rate, locks for 30s
3. User confirms → Stripe PaymentIntent created
4. User pays via card → Stripe webhook confirms
5. System credits wallet, debits FX amount
6. System initiates mobile money payout via correct provider (auto-detected from phone prefix)
7. Webhook from mobile provider updates status
8. Transaction complete, both parties notified

### Wallet-to-Wallet (Same Currency)

1. Sender initiates transfer to recipient email/phone
2. System validates balances
3. Atomic debit/credit with optimistic locking
4. Both users notified

### Mobile Money Top-Up (Wallet Funding)

1. User selects amount
2. Mobile money STK Push initiated
3. User approves on phone
4. Webhook confirms → wallet credited

## Module Map

| Module            | Files                                                                           | Status |
| ----------------- | ------------------------------------------------------------------------------- | ------ |
| Config            | `src/config/index.ts`                                                           | ✅     |
| Types/Enums       | `src/types/enums.ts`, `src/types/index.ts`                                      | ✅     |
| Utils             | `src/utils/errors.ts`, `src/utils/response.ts`, etc.                            | ✅     |
| Middleware        | `auth.ts`, `rateLimiter.ts`, `idempotency.ts`, etc.                             | ✅     |
| Auth              | `auth.controller.ts`, `auth.service.ts`, `auth.routes.ts`                       | ✅     |
| Users             | `users.controller.ts`, `users.service.ts`, etc.                                 | ✅     |
| Wallets           | `wallets.controller.ts`, `wallets.service.ts`, etc.                             | ✅     |
| Transactions      | `transactions.controller.ts`, `transactions.service.ts`, `transaction.state.ts` | ✅     |
| Exchange Rates    | `rates.controller.ts`, `rates.service.ts`, `rates.cron.ts`                      | ✅     |
| Payment Providers | Interfaces + Stripe + M-Pesa + MTN + Airtel + Orange + Wave                     | ✅     |
| Payouts           | `payouts.controller.ts`, `payouts.service.ts`                                   | ✅     |
| Webhooks          | `webhooks.controller.ts`, `webhooks.service.ts`                                 | ✅     |
| KYC               | `kyc.controller.ts`, `kyc.service.ts`                                           | ✅     |
| Admin             | `admin.controller.ts`, `admin.service.ts`                                       | ✅     |
| Ledger            | `ledger.service.ts`, `ledger.types.ts`                                          | ✅     |
| API Keys          | `apiKeys.controller.ts`, `apiKeys.service.ts`                                   | ✅     |
| Jobs/Queues       | BullMQ queues + workers                                                         | ✅     |
| Database          | Prisma schema + migrations                                                      | ✅     |
| Docker            | `docker-compose.yml`, `Dockerfile`                                              | ✅     |
| Tests             | Vitest + Supertest config                                                       | ✅     |

## Tech Stack

- **Runtime**: Node.js 20+, TypeScript 5
- **Framework**: Express.js
- **ORM**: Prisma + PostgreSQL
- **Cache/Queue**: Redis + BullMQ
- **Validation**: Zod
- **Auth**: JWT + bcrypt
- **Payments**: Stripe SDK (abstracted behind custom adapter)
- **Mobile Money**: Custom adapters for each provider
- **Logging**: Pino
- **Testing**: Vitest + Supertest
- **Docs**: Swagger/OpenAPI
