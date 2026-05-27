import { Request, Response, NextFunction } from 'express';
import * as adminService from './admin.service.js';
import { sendSuccess } from '../../utils/response.js';
import { parsePagination, paginatedResult } from '../../utils/pagination.js';
import { cacheIdempotencyResponse } from '../../middleware/idempotency.js';

export async function getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { cursor, limit } = parsePagination(req.query as any);
    const users = await adminService.getUsers(cursor, limit);
    const result = paginatedResult(users, limit);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getTransactions(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { cursor, limit } = parsePagination(req.query as any);
    const status = req.query.status as string | undefined;
    const transactions = await adminService.getTransactions(cursor, limit, status as any);
    const result = paginatedResult(transactions, limit);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await adminService.getTransactionStats();
    sendSuccess(res, stats);
  } catch (err) {
    next(err);
  }
}

export async function approveTransaction(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const transaction = await adminService.updateTransactionStatus(
      req.params.id as string,
      'SUCCESS' as any,
    );
    await cacheIdempotencyResponse(req, transaction);
    sendSuccess(res, transaction);
  } catch (err) {
    next(err);
  }
}

export async function rejectTransaction(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const transaction = await adminService.updateTransactionStatus(
      req.params.id as string,
      'FAILED' as any,
    );
    await cacheIdempotencyResponse(req, transaction);
    sendSuccess(res, transaction);
  } catch (err) {
    next(err);
  }
}

export async function updateUserKyc(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { status, rejectedReason } = req.body;
    await adminService.updateUserKycStatus(req.params.id as string, status, rejectedReason);
    sendSuccess(res, { message: 'KYC status updated' });
  } catch (err) {
    next(err);
  }
}
