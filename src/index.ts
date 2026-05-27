import { createApp } from './app.js';
import { loadConfig, getConfig } from './config/index.js';
import { logger } from './config/logger.js';
import { shutdownClients } from './lib/clients.js';

loadConfig();

const app = createApp();
const config = getConfig();

const server = app.listen(config.PORT, () => {
  logger.info({ port: config.PORT, env: config.NODE_ENV }, `Cosmic Payment started`);
});

async function gracefulShutdown(signal: string) {
  logger.info({ signal }, 'Shutting down gracefully');
  server.close(async () => {
    await shutdownClients();
    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
