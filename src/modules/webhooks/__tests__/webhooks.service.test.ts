import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentProvider } from '../../../types/enums.js';
import * as webhookService from '../webhooks.service.js';
import * as webhookRepo from '../webhooks.repository.js';

vi.mock('../webhooks.repository.js');

const mockEvent = {
  id: 'wh-1',
  provider: PaymentProvider.STRIPE,
  eventType: 'payment_intent.succeeded',
  status: 'RECEIVED',
  createdAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('WebhookService — processWebhook', () => {
  it('creates a webhook event', async () => {
    vi.mocked(webhookRepo.createWebhookEvent).mockResolvedValue(mockEvent);

    const rawBody = { id: 'pi_123' };
    const headers = { 'stripe-signature': 'sig_123' };
    const result = await webhookService.processWebhook(
      PaymentProvider.STRIPE,
      'payment_intent.succeeded',
      rawBody,
      headers,
    );

    expect(webhookRepo.createWebhookEvent).toHaveBeenCalledWith(
      PaymentProvider.STRIPE,
      'payment_intent.succeeded',
      rawBody,
      headers,
    );
    expect(result).toEqual(mockEvent);
  });
});

describe('WebhookService — markProcessed', () => {
  it('marks event as processed', async () => {
    vi.mocked(webhookRepo.markProcessed).mockResolvedValue({} as any);

    await webhookService.markProcessed('wh-1');

    expect(webhookRepo.markProcessed).toHaveBeenCalledWith('wh-1');
  });
});

describe('WebhookService — markFailed', () => {
  it('marks event as failed with reason', async () => {
    vi.mocked(webhookRepo.markFailed).mockResolvedValue({} as any);

    await webhookService.markFailed('wh-1', 'Signature invalid');

    expect(webhookRepo.markFailed).toHaveBeenCalledWith('wh-1', 'Signature invalid');
  });
});
