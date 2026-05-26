import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../../types/index.js';
import * as payoutService from './payouts.service.js';
import { createPayoutSchema } from './payouts.validation.js';
import { sendSuccess } from '../../utils/response.js';
import { parsePagination } from '../../utils/pagination.js';

export async function createPayout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as unknown as { user: JwtPayload }).user;
    const data = createPayoutSchema.parse(req.body);
    const payout = await payoutService.createPayout(user.userId, data);
    sendSuccess(res, payout, 201);
  } catch (err) {
    next(err);
  }
}

export async function getPayouts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as unknown as { user: JwtPayload }).user;
    const { cursor, limit } = parsePagination(req.query as Record<string, string>);
    const payouts = await payoutService.getPayouts(user.userId, cursor, limit);
    sendSuccess(res, payouts);
  } catch (err) {
    next(err);
  }
}
