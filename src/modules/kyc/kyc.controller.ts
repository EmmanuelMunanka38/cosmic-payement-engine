import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../../types/index.js';
import * as kycService from './kyc.service.js';
import { submitKycSchema } from './kyc.validation.js';
import { sendSuccess } from '../../utils/response.js';

export async function submitKyc(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as unknown as { user: JwtPayload }).user;
    const data = submitKycSchema.parse(req.body);
    const doc = await kycService.submitKyc(user.userId, data);
    sendSuccess(res, doc, 201);
  } catch (err) {
    next(err);
  }
}

export async function getKycStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as unknown as { user: JwtPayload }).user;
    const status = await kycService.getKycStatus(user.userId);
    sendSuccess(res, status);
  } catch (err) {
    next(err);
  }
}
