import { PaymentProvider } from '../../types/enums.js';
import { detectNetwork } from '../../utils/phone.js';
import { sendSuccess } from '../../utils/response.js';
import { Router, Request, Response } from 'express';

const router = Router();

/**
 * @openapi
 * /api/v1/providers/networks:
 *   get:
 *     tags: [Providers]
 *     summary: List supported mobile money providers
 *     responses:
 *       200:
 *         description: List of providers with countries and currencies
 */
router.get('/networks', (_req: Request, res: Response) => {
  const networks = [
    {
      provider: PaymentProvider.MPESA,
      countries: ['KE', 'TZ', 'MZ', 'CD', 'LS', 'GH', 'EG'],
      currencies: ['KES', 'TZS'],
    },
    {
      provider: PaymentProvider.MTN_MOMO,
      countries: ['UG', 'GH', 'RW', 'ZM', 'CM', 'CI', 'BJ', 'GN'],
      currencies: ['UGX', 'GHS', 'RWF', 'ZMW', 'XAF', 'XOF'],
    },
    {
      provider: PaymentProvider.AIRTEL_MONEY,
      countries: ['UG', 'KE', 'TZ', 'RW', 'MW', 'ZM', 'MG', 'CD'],
      currencies: ['UGX', 'KES', 'TZS', 'MWK', 'ZMW'],
    },
    {
      provider: PaymentProvider.ORANGE_MONEY,
      countries: ['CI', 'SN', 'ML', 'CM', 'GN', 'MG', 'MR'],
      currencies: ['XOF', 'XAF'],
    },
    {
      provider: PaymentProvider.WAVE,
      countries: ['SN', 'CI', 'ML', 'BF', 'UG'],
      currencies: ['XOF', 'UGX'],
    },
  ];
  sendSuccess(res, networks);
});

/**
 * @openapi
 * /api/v1/providers/network/{phone}:
 *   get:
 *     tags: [Providers]
 *     summary: Detect mobile money provider from phone number
 *     parameters:
 *       - in: path
 *         name: phone
 *         required: true
 *         schema: { type: string, example: "+254712345678" }
 *     responses:
 *       200:
 *         description: Detected network, country, and currency
 */
router.get('/network/:phone', (req: Request, res: Response) => {
  try {
    const result = detectNetwork(req.params.phone as string);
    sendSuccess(res, result as any);
  } catch {
    sendSuccess(res, { network: null, country: null, currency: null, confidence: 0 });
  }
});

export default router;
