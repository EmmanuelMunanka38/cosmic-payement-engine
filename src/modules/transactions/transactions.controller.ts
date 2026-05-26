import { Request, Response, NextFunction } from 'express';
import * as transactionService from './transactions.service.js';
import { crossBorderSchema, payInSchema, payOutSchema } from './transactions.validation.js';
import { sendSuccess } from '../../utils/response.js';
import { parsePagination, paginatedResult } from '../../utils/pagination.js';
import { cacheIdempotencyResponse } from '../../middleware/idempotency.js';
import { v4 as uuidv4 } from 'uuid';

export async function sendInternal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as any).user;
    const idempotencyKey = (req as any).idempotencyKey || uuidv4();
    const result = await transactionService.sendInternal(user, req.body, idempotencyKey);
    await cacheIdempotencyResponse(req, result);
    sendSuccess(res, result, 201);
  } catch (err) {
    next(err);
  }
}

export async function crossBorderSend(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as any).user;
    const data = crossBorderSchema.parse(req.body);
    const idempotencyKey = (req as any).idempotencyKey || uuidv4();
    const result = await transactionService.crossBorderSend(user, data, idempotencyKey);
    await cacheIdempotencyResponse(req, result);
    sendSuccess(res, result, 201);
  } catch (err) {
    next(err);
  }
}

export async function payIn(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as any).user;
    const data = payInSchema.parse(req.body);
    const idempotencyKey = (req as any).idempotencyKey || uuidv4();
    const result = await transactionService.payIn(user, data, idempotencyKey);
    await cacheIdempotencyResponse(req, result);
    sendSuccess(res, result, 201);
  } catch (err) {
    next(err);
  }
}

export async function payOut(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as any).user;
    const data = payOutSchema.parse(req.body);
    const idempotencyKey = (req as any).idempotencyKey || uuidv4();
    const result = await transactionService.payOut(user, data, idempotencyKey);
    await cacheIdempotencyResponse(req, result);
    sendSuccess(res, result, 201);
  } catch (err) {
    next(err);
  }
}

export async function listTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as any).user;
    const { cursor, limit } = parsePagination(req.query as any);
    const transactions = await transactionService.getUserTransactions(user, cursor, limit);
    const result = paginatedResult(transactions, limit);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as any).user;
    const transaction = await transactionService.getTransaction(user, req.params.id as string);
    sendSuccess(res, transaction);
  } catch (err) {
    next(err);
  }
}

export async function getTransactionByReference(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as any).user;
    const transaction = await transactionService.getTransactionByRef(user, req.params.reference as string);
    sendSuccess(res, transaction);
  } catch (err) {
    next(err);
  }
}
