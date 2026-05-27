import { JwtPayload } from './index.js';
import { Environment } from './enums.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      environment?: Environment;
    }
  }
}

export {};
