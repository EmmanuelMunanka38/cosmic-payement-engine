# Cosmic Payment — Postman Testing Guide

## Prerequisites

1. Start the server: `npm run dev`
2. Create the sandbox database: `createdb cosmic_payment_sandbox && npx prisma db push --accept-data-loss`

---

## Auth Endpoints

### Register

```
POST http://localhost:3000/api/v1/auth/register
Content-Type: application/json

{
  "email": "dev@example.com",
  "phone": "+254712345678",
  "password": "SecurePass123!",
  "firstName": "Dev",
  "lastName": "User",
  "country": "KE"
}
```

### Login

```
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "dev@example.com",
  "password": "SecurePass123!"
}
```

Save the returned `accessToken` — used as `Authorization: Bearer <token>` for all JWT-protected endpoints.

---

## Sandbox Endpoints

All sandbox endpoints require JWT auth (`Authorization: Bearer <token>`).

### 1. Create Sandbox API Key

```
POST http://localhost:3000/api/v1/sandbox/api-keys
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Sandbox App",
  "scopes": ["transactions:read", "transactions:write"]
}
```

**Response:** Returns `sand_`-prefixed key + auto-funds KES 100k, UGX 100k, NGN 100k, GHS 100k, USD 1k wallets.

### 2. List Sandbox API Keys

```
GET http://localhost:3000/api/v1/sandbox/api-keys
Authorization: Bearer <token>
```

### 3. List Sandbox Transactions

```
GET http://localhost:3000/api/v1/sandbox/transactions?cursor=<cursor>&limit=20
Authorization: Bearer <token>
```

### 4. Simulate Stripe Webhook

```
POST http://localhost:3000/api/v1/sandbox/simulate/stripe
Authorization: Bearer <token>
Content-Type: application/json

{
  "event": "payment_intent.succeeded",
  "transactionId": "<existing-sandbox-transaction-id>"
}
```

**Events:** `payment_intent.succeeded`, `payment_intent.failed`, `charge.refunded`

### 5. Simulate M-Pesa Callback

```
POST http://localhost:3000/api/v1/sandbox/simulate/mpesa
Authorization: Bearer <token>
Content-Type: application/json

{
  "resultCode": "0",
  "transactionId": "<existing-sandbox-transaction-id>"
}
```

**Result Codes:** `0` (success), `1`, `2`, `1032` (failure)

### 6. Simulate Payout Resolution

```
POST http://localhost:3000/api/v1/sandbox/simulate/payout
Authorization: Bearer <token>
Content-Type: application/json

{
  "transactionId": "<existing-sandbox-transaction-id>",
  "outcome": "success"
}
```

**Outcomes:** `success`, `failed`

### 7. Reset Sandbox Data

```
POST http://localhost:3000/api/v1/sandbox/reset
Authorization: Bearer <token>
```

Wipes all sandbox API keys, transactions, wallets, and webhook events for the authenticated user.

---

## Sandbox Flow (End-to-End)

```
1. Register/Login           → POST /api/v1/auth/register
2. Create sandbox API key   → POST /api/v1/sandbox/api-keys       ← auto-funds wallets
3. List sandbox keys        → GET  /api/v1/sandbox/api-keys
4. Use sandbox API key      → Call payment endpoints with X-API-Key: <sand_key>
   to create transactions     (transactions land in sandbox DB)
5. Simulate provider cb     → POST /api/v1/sandbox/simulate/stripe|mpesa
6. Verify transaction       → GET  /api/v1/sandbox/transactions
7. Reset sandbox            → POST /api/v1/sandbox/reset           ← clean slate
```

---

## Production Endpoints

### Create API Key

```
POST http://localhost:3000/api/v1/api-keys
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Production App",
  "scopes": ["transactions:read"]
}
```

### Send Money (Internal)

```
POST http://localhost:3000/api/v1/transactions/send
Authorization: Bearer <token>
Idempotency-Key: <uuid>
Content-Type: application/json

{
  "recipientEmail": "other@example.com",
  "amount": 1000,
  "currency": "KES",
  "description": "Lunch money"
}
```

### Cross-Border Send

```
POST http://localhost:3000/api/v1/transactions/cross-border
Authorization: Bearer <token>
Idempotency-Key: <uuid>
Content-Type: application/json

{
  "sourceCurrency": "KES",
  "destinationCurrency": "UGX",
  "sourceAmount": 5000,
  "recipientPhone": "+256712345678",
  "recipientName": "John Doe",
  "recipientProvider": "MTN_MOMO",
  "description": "School fees"
}
```

### Pay In (Card Top-Up)

```
POST http://localhost:3000/api/v1/transactions/pay-in
Authorization: Bearer <token>
Idempotency-Key: <uuid>
Content-Type: application/json

{
  "currency": "KES",
  "amount": 5000
}
```

### Pay Out (Mobile Money)

```
POST http://localhost:3000/api/v1/transactions/pay-out
Authorization: Bearer <token>
Idempotency-Key: <uuid>
Content-Type: application/json

{
  "currency": "KES",
  "amount": 1000,
  "recipientPhone": "+254712345678",
  "recipientProvider": "MPESA",
  "description": "Withdrawal"
}
```

### List Transactions

```
GET http://localhost:3000/api/v1/transactions?cursor=<cursor>&limit=20
Authorization: Bearer <token>
```

### Get Transaction

```
GET http://localhost:3000/api/v1/transactions/<id>
Authorization: Bearer <token>
```

### Get Transaction by Reference

```
GET http://localhost:3000/api/v1/transactions/reference/<ref>
Authorization: Bearer <token>
```

### Create Payout

```
POST http://localhost:3000/api/v1/payouts
Authorization: Bearer <token>
Idempotency-Key: <uuid>
Content-Type: application/json

{
  "amount": 1000,
  "currency": "KES",
  "recipientPhone": "+254712345678",
  "recipientName": "Jane Doe",
  "recipientProvider": "MPESA",
  "description": "Salary"
}
```

### List Payouts

```
GET http://localhost:3000/api/v1/payouts?cursor=<cursor>&limit=20
Authorization: Bearer <token>
```

### Get Exchange Rates

```
GET http://localhost:3000/api/v1/rates
```

### Get Quote

```
POST http://localhost:3000/api/v1/rates/quote
Content-Type: application/json

{
  "sourceCurrency": "KES",
  "destinationCurrency": "UGX",
  "sourceAmount": 10000
}
```

### Wallets

```
GET  http://localhost:3000/api/v1/wallets
POST http://localhost:3000/api/v1/wallets/{currency}   (e.g. /wallets/KES)
```

---

## Postman Variables

| Variable         | Initial Value                      |
| ---------------- | ---------------------------------- |
| `baseUrl`        | `http://localhost:3000`            |
| `token`          | (set from login response)          |
| `sandboxApiKey`  | (set from sandbox create response) |
| `idempotencyKey` | `{{$guid}}`                        |

---

## Idempotency

Every `POST` endpoint that moves money **requires** an `Idempotency-Key` header (UUID).  
Replay the same key → get the cached response. No double-spends.
