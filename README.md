# AfriPay Gateway

Cross-border payment gateway for Africa — like Nala + Stripe + Mobile Money all-in-one.

## Quick Start

```bash
# 1. Start infrastructure
docker compose up -d

# 2. Install deps and setup DB
npm run setup

# 3. Start dev server
npm run dev
```

## Test Credentials
- **Admin**: admin@afripay.dev / admin123
- **User**:  user@afripay.dev  / user123

## API Endpoints

| Prefix | Module | Auth |
|--------|--------|------|
| `/api/v1/auth` | Register, Login, Refresh | No |
| `/api/v1/users` | Profile | JWT |
| `/api/v1/wallets` | Multi-currency wallets | JWT |
| `/api/v1/transactions` | Send, Cross-border, Pay-in/out | JWT |
| `/api/v1/rates` | FX rates, quotes | Mixed |
| `/api/v1/payouts` | Mobile money payouts | JWT |
| `/api/v1/kyc` | KYC documents | JWT |
| `/api/v1/admin` | Admin dashboard | Admin |
| `/api/v1/api-keys` | B2B API keys | JWT |
| `/webhooks/*` | Provider callbacks | Signature |

## Supported Providers
- **Stripe** — Card payments (abstracted behind custom CardProvider interface)
- **M-Pesa** — Kenya, Tanzania
- **MTN MoMo** — Uganda, Ghana, Rwanda, 12+ countries
- **Airtel Money** — Kenya, Uganda, Tanzania, Nigeria
- **Orange Money** — 17 Francophone countries
- **Wave** — Senegal, Ivory Coast, Mali
