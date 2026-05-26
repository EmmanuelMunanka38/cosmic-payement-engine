import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../../types/index.js';
import * as userRepo from './users.repository.js';
import { sendSuccess } from '../../utils/response.js';

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as unknown as { user: JwtPayload }).user;
    const profile = await userRepo.getUserById(user.userId);
    sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as unknown as { user: JwtPayload }).user;
    const profile = await userRepo.updateProfile(user.userId, req.body);
    sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
}
