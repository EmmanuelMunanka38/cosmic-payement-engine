import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getConfig } from '../config/index.js';
import { JwtPayload } from '../types/index.js';
import { AuthError } from '../utils/errors.js';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthError('AUTH_TOKEN_MISSING', 'Authorization token is required');
  }

  const token = authHeader.slice(7);
  try {
    const config = getConfig();
    const payload = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    (req as unknown as { user: JwtPayload }).user = payload;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AuthError('AUTH_TOKEN_EXPIRED', 'Token has expired');
    }
    throw new AuthError('AUTH_TOKEN_INVALID', 'Invalid token');
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.slice(7);
  try {
    const config = getConfig();
    const payload = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    (req as unknown as { user: JwtPayload }).user = payload;
  } catch {
    // silently ignore invalid tokens for optional auth
  }
  next();
}
