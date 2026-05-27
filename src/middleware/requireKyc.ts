import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../types/index.js';
import { KycRequiredError } from '../utils/errors.js';
import { prisma } from '../lib/prisma.js';

export async function requireKyc(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const user = (req as unknown as { user: JwtPayload }).user;
  if (!user) {
    next();
    return;
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { kycStatus: true },
  });

  if (!dbUser || dbUser.kycStatus !== 'VERIFIED') {
    throw new KycRequiredError();
  }

  next();
}
