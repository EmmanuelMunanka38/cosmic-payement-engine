import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../../types/index.js';
import { ForbiddenError } from '../../utils/errors.js';

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  const user = (req as unknown as { user: JwtPayload }).user;
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    throw new ForbiddenError('Admin access required');
  }
  next();
}
