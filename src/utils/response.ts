import { Response } from 'express';
import { ApiResponse, PaginatedResult } from '../types/index.js';

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  const body: ApiResponse<T> = {
    status: 'success',
    data,
    meta: { timestamp: new Date().toISOString() },
  };
  res.status(statusCode).json(body);
}

export function sendPaginated<T>(res: Response, result: PaginatedResult<T>): void {
  const body: ApiResponse<T[]> = {
    status: 'success',
    data: result.data,
    meta: {
      timestamp: new Date().toISOString(),
      cursor: result.cursor ?? undefined,
      hasMore: result.hasMore,
      total: result.total,
    },
  };
  res.status(200).json(body);
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown,
): void {
  const body: ApiResponse = {
    status: 'error',
    error: { code, message, details },
    meta: { timestamp: new Date().toISOString() },
  };
  res.status(statusCode).json(body);
}
