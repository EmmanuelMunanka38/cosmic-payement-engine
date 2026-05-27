import { Request, Response, NextFunction } from 'express';
import * as walletService from './wallets.service.js';
import { createWalletSchema } from './wallets.validation.js';
import { sendSuccess } from '../../utils/response.js';

export async function createWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as any).user;
    const { currency } = createWalletSchema.parse(req.body);
    const wallet = await walletService.createWallet(user.userId, currency);
    sendSuccess(res, wallet, 201);
  } catch (err) {
    next(err);
  }
}

export async function getWallets(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as any).user;
    const wallets = await walletService.getWallets(user.userId);
    sendSuccess(res, wallets);
  } catch (err) {
    next(err);
  }
}

export async function getWalletById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = (req as any).user;
    const wallet = await walletService.getWalletById(req.params.id as string, user.userId);
    sendSuccess(res, wallet);
  } catch (err) {
    next(err);
  }
}
