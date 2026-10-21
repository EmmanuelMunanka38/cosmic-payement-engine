# Cosmic Payment

**Cross-border payment gateway for Africa** — the power of Nala, Stripe, and Mobile Money in a single, open-source platform.

Cosmic Payment lets the African diaspora send money home with a card, handles the FX conversion automatically, and delivers funds directly to a recipient's mobile money wallet (M-Pesa, MTN MoMo, Airtel Money, Orange Money, Wave). It is a modular monolith built in TypeScript, designed to be self-hosted, extended, and contributed to by developers around the world.

> **Open source, open collaboration.** This project is built in the open. Whether you want to add a new mobile money provider, fix a bug, improve the FX engine, or write documentation — your contribution is welcome.

---

## Why Cosmic Payment?

Sending money across borders in Africa is fragmented. Every country has its own mobile money rails, every provider has its own API, and FX conversion is often opaque. Cosmic Payment unifies all of that behind one clean API:

- **One integration, many rails** — card payments via Stripe, payouts via 5+ mobile money providers.
- **Transparent FX** — real-time rates with bid/ask spreads, locked quotes, and full auditability.
- **Built for scale** — optimistic-locking wallets, idempotent money movement, and BullMQ-backed async processing.
- **Sandbox-first** — a fully isolated sandbox environment so you can test end-to-end without touching real money.

---

## Features

- **Multi-currency wallets** — USD, EUR, GBP, KES, NGN, UGX, GHS, TZS, XAF, XOF, RWF, ZMW, MAD, ZAR.
- **Cross-border send** — card (Stripe) → FX conversion → mobile money payout, fully automated.
- **Wallet-to-wallet transfers** — atomic, optimistic-locked, same-currency transfers.
- **Mobile money top-up** — fund a wallet via STK Push / collection requests.
- **Provider auto-detection** — the correct mobile money provider is chosen from the recipient's phone number prefix.
- **Idempotent money movement** — every `POST` that moves money requires an `Idempotency-Key`.
- **KYC** — document upload and verification workflow.
- **B2B API keys** — scoped, hashed, environment-aware keys for programmatic access.
- **Webhooks** — signed provider callbacks with async delivery and retries.
- **Admin dashboard API** — user, transaction, and provider management.
- **Sandbox isolation** — a separate database where payouts auto-succeed without calling real providers.
- **2FA** — TOTP-based two-factor authentication.

---

## Tech Stack

| Layer         | Technology                                      |
| ------------- | ----------------------------------------------- |
| Runtime       | Node.js 20+, TypeScript 5 (strict mode)         |
| Framework     | Express.js                                      |
| ORM / DB      | Prisma + PostgreSQL                             |
| Cache / Queue | Redis + BullMQ                                  |
| Validation    | Zod                                             |
| Auth          | JWT + bcrypt + OTP (TOTP)                       |
| Payments      | Stripe SDK (abstracted behind a `CardProvider`) |
| Mobile Money  | Custom adapters per provider                    |
| Logging       | Pino                                            |
| Testing       | Vitest + Supertest                              |
| Docs          | Swagger / OpenAPI                               |

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm

### 1. Clone & install

```bash
git clone https://github.com/your-org/cosmic-payment.git
cd cosmic-payment
cp .env.example .env
```

### 2. Start infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL and Redis.

### 3. Install dependencies, migrate, and seed

```bash
npm run setup
```

### 4. Start the dev server

```bash
npm run dev
```

The API is now running at `http://localhost:3000`. Swagger docs are available at `/api-docs`.

---

## Test Credentials

The seed script creates these accounts for local development:

| Role  | Email                      | Password   |
| ----- | -------------------------- | ---------- |
| Admin | `admin@cosmic-payment.dev` | `admin123` |
| User  | `user@cosmic-payment.dev`  | `user123`  |

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values. The most important ones:

| Variable                | Purpose                                         |
| ----------------------- | ----------------------------------------------- |
| `DATABASE_URL`          | PostgreSQL connection string                    |
| `REDIS_URL`             | Redis connection string                         |
| `JWT_SECRET`            | Access token signing secret (32+ chars)         |
| `JWT_REFRESH_SECRET`    | Refresh token signing secret                    |
| `STRIPE_SECRET_KEY`     | Stripe secret key (card payments)               |
| `MPESA_*`               | M-Pesa Daraja API credentials                   |
| `MTN_MOMO_*`            | MTN MoMo API credentials                        |
| `AIRTEL_*`              | Airtel Money credentials                        |
| `ORANGE_*`              | Orange Money credentials                        |
| `WAVE_API_KEY`          | Wave API key                                    |
| `EXCHANGE_RATE_API_KEY` | FX rate provider key                            |
| `ENCRYPTION_KEY`        | AES-256 key for encrypting provider credentials |

All provider credentials are optional — the app runs without them, and the sandbox environment lets you test flows without real provider accounts.

---

## API Endpoints

| Prefix                 | Module                         | Auth      |
| ---------------------- | ------------------------------ | --------- |
| `/api/v1/auth`         | Register, Login, Refresh, 2FA  | No        |
| `/api/v1/users`        | Profile                        | JWT       |
| `/api/v1/wallets`      | Multi-currency wallets         | JWT       |
| `/api/v1/transactions` | Send, Cross-border, Pay-in/out | JWT       |
| `/api/v1/rates`        | FX rates, quotes               | Mixed     |
| `/api/v1/payouts`      | Mobile money payouts           | JWT       |
| `/api/v1/kyc`          | KYC documents                  | JWT       |
| `/api/v1/admin`        | Admin dashboard                | Admin     |
| `/api/v1/api-keys`     | B2B API keys                   | JWT       |
| `/webhooks/*`          | Provider callbacks             | Signature |

---

## Supported Providers

| Provider     | Type         | Coverage                                                |
| ------------ | ------------ | ------------------------------------------------------- |
| Stripe       | Card         | Global card payments (abstracted behind `CardProvider`) |
| M-Pesa       | Mobile Money | Kenya, Tanzania                                         |
| MTN MoMo     | Mobile Money | Uganda, Ghana, Rwanda, 12+ countries                    |
| Airtel Money | Mobile Money | Kenya, Uganda, Tanzania, Nigeria                        |
| Orange Money | Mobile Money | 17 Francophone countries                                |
| Wave         | Mobile Money | Senegal, Ivory Coast, Mali                              |

Adding a new provider is a first-class contribution — see [Contributing](#contributing).

---

## Testing

```bash
# Run the full test suite
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Lint & format
npm run lint
npm run format
```

The service layer targets 80%+ coverage. Provider adapter tests use sandbox credentials.

---

## Contributing

Cosmic Payment is open source and we'd love your help. Here's how to get involved:

1. **Find or open an issue** — bugs, feature requests, and provider integrations are all welcome.
2. **Fork the repo** and create a feature branch.
3. **Make your change** — follow the conventions in `AGENTS.md`.
4. **Add tests** for any new behavior.
5. **Open a pull request** with a clear description of _why_ the change matters.

### Good first contributions

- Add a new mobile money provider adapter (implement the `MobileMoneyProvider` interface).
- Improve FX rate sourcing or add a new rate provider.
- Expand test coverage in any module.
- Improve documentation and API examples.

### Code conventions

- TypeScript strict mode — no `any`, no unsafe casts.
- Named exports only, no default exports.
- Errors are thrown as `AppError` subclasses.
- Validation uses Zod schemas, never inline.
- No comments unless explaining a non-obvious business rule.

### Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/) to keep history readable and to make it easy for open-source contributors to understand what each change does. Please format your commit messages as:

```
<type>(<scope>): <description>
```

Where `<type>` is one of:

| Type       | Purpose                                                 |
| ---------- | ------------------------------------------------------- |
| `feat`     | A new feature                                           |
| `fix`      | A bug fix                                               |
| `docs`     | Documentation only                                      |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test`     | Adding or updating tests                                |
| `chore`    | Build, tooling, or maintenance                          |
| `perf`     | Performance improvement                                 |
| `ci`       | CI/CD changes                                           |

Examples:

```
feat(providers): add Wave mobile money adapter
fix(wallets): prevent negative balance on concurrent transfers
docs(readme): clarify sandbox setup for contributors
```

A clear, conventional commit message helps reviewers — including first-time open-source contributors — understand the intent of your change at a glance.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## Security

Found a security issue? Please do **not** open a public issue. Report it privately to the maintainers so it can be addressed responsibly before disclosure.

---

## Support

If Cosmic Payment has saved you time, money, or a headache — consider dropping me a tip. It keeps the coffee flowing and the code shipping. ☕

<a href="https://www.dropmeatip.co.tz/user/emmdev">
  <img src="public/images/Drop%20Me%20a%20Tip%20in%20Blue%20Script.png" alt="Drop Me a Tip" width="180" />
</a>

Every tip goes directly toward keeping this project open source, well-maintained, and free for developers across Africa and beyond. Your support helps cover infrastructure, testing, and the countless hours that go into building a reliable cross-border payment gateway.
