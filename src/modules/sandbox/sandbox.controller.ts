import { Request, Response, NextFunction } from 'express';
import * as sandboxService from './sandbox.service.js';
import {
  createSandboxApiKeySchema,
  simulateStripeSchema,
  simulateMpesaSchema,
  simulatePayoutSchema,
} from './sandbox.validation.js';
import { sendSuccess } from '../../utils/response.js';
import { parsePagination } from '../../utils/pagination.js';

export async function createSandboxApiKey(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = (req as any).user;
    const data = createSandboxApiKeySchema.parse(req.body);
    const key = await sandboxService.createSandboxApiKey(user.userId, data.name, data.scopes);
    sendSuccess(res, key, 201);
  } catch (err) {
    next(err);
  }
}

export async function listSandboxApiKeys(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = (req as any).user;
    const keys = await sandboxService.listSandboxApiKeys(user.userId);
    sendSuccess(res, keys);
  } catch (err) {
    next(err);
  }
}

export async function listSandboxTransactions(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = (req as any).user;
    const { cursor, limit } = parsePagination(req.query as any);
    const transactions = await sandboxService.listSandboxTransactions(user.userId, cursor, limit);
    sendSuccess(res, transactions);
  } catch (err) {
    next(err);
  }
}

export async function simulateStripe(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = (req as any).user;
    const data = simulateStripeSchema.parse(req.body);
    const result = await sandboxService.simulateStripeCallback(
      user.userId,
      data.event,
      data.transactionId,
    );
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function simulateMpesa(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = (req as any).user;
    const data = simulateMpesaSchema.parse(req.body);
    const result = await sandboxService.simulateMpesaCallback(
      user.userId,
      data.resultCode,
      data.transactionId,
    );
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function simulatePayout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = (req as any).user;
    const data = simulatePayoutSchema.parse(req.body);
    const result = await sandboxService.simulatePayoutResolution(
      user.userId,
      data.transactionId,
      data.outcome,
    );
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function resetSandbox(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as any).user;
    await sandboxService.resetSandboxData(user.userId);
    sendSuccess(res, { message: 'Sandbox data reset successfully' });
  } catch (err) {
    next(err);
  }
}
