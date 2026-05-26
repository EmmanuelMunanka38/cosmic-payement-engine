import { Request, Response, NextFunction } from 'express';
import * as rateService from './rates.service.js';
import { sendSuccess } from '../../utils/response.js';

export async function getAllRates(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rates = await rateService.getAllRates();
    sendSuccess(res, rates);
  } catch (err) {
    next(err);
  }
}

export async function getPairRate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const from = (req.params.from as string).toUpperCase();
    const to = (req.params.to as string).toUpperCase();
    const rate = await rateService.getPairRate(from as any, to as any);
    sendSuccess(res, rate);
  } catch (err) {
    next(err);
  }
}

export async function getQuote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { from, to, amount } = req.body;
    const quote = await rateService.getQuote(
      (from as string).toUpperCase() as any,
      (to as string).toUpperCase() as any,
      Number(amount),
    );
    sendSuccess(res, quote);
  } catch (err) {
    next(err);
  }
}
