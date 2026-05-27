import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CurrencyCode } from '@prisma/client';
import * as rateService from '../rates.service.js';
import * as rateRepo from '../rates.repository.js';

vi.mock('../rates.repository.js');

const mockRedis = vi.hoisted(() => {
  const redis: Record<string, ReturnType<typeof vi.fn>> = {
    setex: vi.fn(),
    get: vi.fn(),
    del: vi.fn(),
  };
  return redis as {
    setex: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    del: ReturnType<typeof vi.fn>;
  };
});

vi.mock('ioredis', () => ({ default: vi.fn(() => mockRedis) }));

beforeEach(() => {
  vi.clearAllMocks();
});

const mockRate = {
  id: 'rate-1',
  fromCurrency: CurrencyCode.USD,
  toCurrency: CurrencyCode.KES,
  rate: 130,
  bid: 128,
  ask: 132,
  source: 'test',
  validUntil: new Date(Date.now() + 3600000),
  createdAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RateService — getQuote', () => {
  it('returns a valid quote when rate exists', async () => {
    vi.mocked(rateRepo.getRate).mockResolvedValue(mockRate);

    const result = await rateService.getQuote(CurrencyCode.USD, CurrencyCode.KES, 100);

    expect(rateRepo.getRate).toHaveBeenCalledWith(CurrencyCode.USD, CurrencyCode.KES);
    expect(result.rate).toBe(130);
    expect(result.fee).toBe(1);
    expect(result.destinationAmount).toBe(12870);
    expect(result.validForSeconds).toBe(30);
    expect(result.quoteId).toMatch(/^Q-/);
  });

  it('throws when rate is not available', async () => {
    vi.mocked(rateRepo.getRate).mockResolvedValue(null);

    await expect(rateService.getQuote(CurrencyCode.USD, CurrencyCode.KES, 100)).rejects.toThrow(
      'Exchange rate not available',
    );
  });

  it('calculates zero fee for zero amount', async () => {
    vi.mocked(rateRepo.getRate).mockResolvedValue(mockRate);

    const result = await rateService.getQuote(CurrencyCode.USD, CurrencyCode.KES, 0);

    expect(result.fee).toBe(0);
    expect(result.destinationAmount).toBe(0);
  });
});

describe('RateService — confirmQuote', () => {
  it('returns quote data when key exists', async () => {
    const quoteData = {
      from: 'USD',
      to: 'KES',
      amount: 100,
      rate: 130,
      fee: 1,
      destinationAmount: 12870,
    };
    mockRedis.get.mockResolvedValue(JSON.stringify(quoteData));

    const result = await rateService.confirmQuote('Q-test');

    expect(mockRedis.get).toHaveBeenCalledWith('quote:Q-test');
    expect(mockRedis.del).toHaveBeenCalledWith('quote:Q-test');
    expect(result).toEqual(quoteData);
  });

  it('throws when quote has expired', async () => {
    mockRedis.get.mockResolvedValue(null);

    await expect(rateService.confirmQuote('Q-expired')).rejects.toThrow('Quote has expired');
  });
});

describe('RateService — getAllRates', () => {
  it('returns all active rates', async () => {
    vi.mocked(rateRepo.getAllRates).mockResolvedValue([mockRate]);

    const result = await rateService.getAllRates();

    expect(rateRepo.getAllRates).toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });
});

describe('RateService — getPairRate', () => {
  it('returns the rate for a currency pair', async () => {
    vi.mocked(rateRepo.getRate).mockResolvedValue(mockRate);

    const result = await rateService.getPairRate(CurrencyCode.USD, CurrencyCode.KES);

    expect(rateRepo.getRate).toHaveBeenCalledWith(CurrencyCode.USD, CurrencyCode.KES);
    expect(result).toEqual(mockRate);
  });

  it('returns null when pair not found', async () => {
    vi.mocked(rateRepo.getRate).mockResolvedValue(null);

    const result = await rateService.getPairRate(CurrencyCode.USD, CurrencyCode.UGX);

    expect(result).toBeNull();
  });
});
