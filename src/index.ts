import { createApp } from './app.js';
import { loadConfig, getConfig } from './config/index.js';
import { logger } from './config/logger.js';

loadConfig();

const app = createApp();
const config = getConfig();

const server = app.listen(config.PORT, () => {
  logger.info({ port: config.PORT, env: config.NODE_ENV }, `AfriPay Gateway started`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down');
  server.close(() => process.exit(0));
});
