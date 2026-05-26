import pino from 'pino';
import { getConfig } from './index.js';

const config = getConfig();

export const logger = pino({
  level: config.LOG_LEVEL,
  transport: config.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: { colorize: true, translateTime: 'HH:MM:ss.l' },
  } : undefined,
  redact: {
    paths: ['req.headers.authorization', 'req.headers["x-api-key"]', 'body.password', 'body.passwordHash'],
    censor: '[REDACTED]',
  },
});
