import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../../types/index.js';
import * as userService from './users.service.js';
import { sendSuccess } from '../../utils/response.js';

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as unknown as { user: JwtPayload }).user;
    const profile = await userService.getProfile(user.userId);
    sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = (req as unknown as { user: JwtPayload }).user;
    const profile = await userService.updateProfile(user.userId, req.body);
    sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
}
