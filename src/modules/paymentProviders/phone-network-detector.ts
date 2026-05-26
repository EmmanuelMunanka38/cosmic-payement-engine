import { PaymentProvider } from '../../types/enums.js';
import { NetworkDetectionResult } from '../../types/index.js';
import { detectNetwork } from '../../utils/phone.js';
import { sendSuccess } from '../../utils/response.js';
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/networks', (_req: Request, res: Response) => {
  const networks = [
    { provider: PaymentProvider.MPESA, countries: ['KE', 'TZ', 'MZ', 'CD', 'LS', 'GH', 'EG'], currencies: ['KES', 'TZS'] },
    { provider: PaymentProvider.MTN_MOMO, countries: ['UG', 'GH', 'RW', 'ZM', 'CM', 'CI', 'BJ', 'GN'], currencies: ['UGX', 'GHS', 'RWF', 'ZMW', 'XAF', 'XOF'] },
    { provider: PaymentProvider.AIRTEL_MONEY, countries: ['UG', 'KE', 'TZ', 'RW', 'MW', 'ZM', 'MG', 'CD'], currencies: ['UGX', 'KES', 'TZS', 'MWK', 'ZMW'] },
    { provider: PaymentProvider.ORANGE_MONEY, countries: ['CI', 'SN', 'ML', 'CM', 'GN', 'MG', 'MR'], currencies: ['XOF', 'XAF'] },
    { provider: PaymentProvider.WAVE, countries: ['SN', 'CI', 'ML', 'BF', 'UG'], currencies: ['XOF', 'UGX'] },
  ];
  sendSuccess(res, networks);
});

router.get('/network/:phone', (req: Request, res: Response) => {
  try {
    const result = detectNetwork(req.params.phone as string);
    sendSuccess(res, result as any);
  } catch {
    sendSuccess(res, { network: null, country: null, currency: null, confidence: 0 });
  }
});

export default router;
