import { Request, Response } from 'express';
import { MpesaProvider } from './mpesa.provider.js';
import { logger } from '../../../config/logger.js';

const provider = new MpesaProvider();

export async function handleCallback(req: Request, res: Response): Promise<void> {
  try {
    const { event, data } = await provider.handleWebhook(req.body, req.headers);
    logger.info({ event, data }, 'M-Pesa callback received');
    res.json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (err) {
    logger.error({ err }, 'Error processing M-Pesa callback');
    res.json({ ResultCode: 1, ResultDesc: 'Processing failed' });
  }
}
