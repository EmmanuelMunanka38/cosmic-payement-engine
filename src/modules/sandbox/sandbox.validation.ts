import { z } from 'zod';

export const createSandboxApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.string()).min(1).default(['transactions:read']),
  expiresAt: z.string().datetime().optional(),
});

export const simulateStripeSchema = z.object({
  event: z.enum(['payment_intent.succeeded', 'payment_intent.failed', 'charge.refunded']),
  transactionId: z.string().uuid(),
});

export const simulateMpesaSchema = z.object({
  resultCode: z.enum(['0', '1', '2', '1032']),
  transactionId: z.string().uuid(),
});

export const simulatePayoutSchema = z.object({
  transactionId: z.string().uuid(),
  outcome: z.enum(['success', 'failed']),
});

export type CreateSandboxApiKeyInput = z.infer<typeof createSandboxApiKeySchema>;
export type SimulateStripeInput = z.infer<typeof simulateStripeSchema>;
export type SimulateMpesaInput = z.infer<typeof simulateMpesaSchema>;
export type SimulatePayoutInput = z.infer<typeof simulatePayoutSchema>;
