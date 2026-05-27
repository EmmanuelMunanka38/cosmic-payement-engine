import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { getConfig } from './config/index.js';
import { setupSwagger } from './config/swagger.js';

import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/users.routes.js';
import walletRoutes from './modules/wallets/wallets.routes.js';
import transactionRoutes from './modules/transactions/transactions.routes.js';
import rateRoutes from './modules/exchangeRates/rates.routes.js';
import payoutRoutes from './modules/payouts/payouts.routes.js';
import webhookRoutes from './modules/webhooks/webhooks.routes.js';
import kycRoutes from './modules/kyc/kyc.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import apiKeyRoutes from './modules/apiKeys/apiKeys.routes.js';
import stripeRoutes from './modules/paymentProviders/stripe/stripe.routes.js';
import mpesaRoutes from './modules/paymentProviders/mpesa/mpesa.routes.js';
import networkRoutes from './modules/paymentProviders/phone-network-detector.js';
import sandboxRoutes from './modules/sandbox/sandbox.routes.js';

export function createApp() {
  const config = getConfig();
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.CORS_ORIGINS.split(','), credentials: true }));
  app.use(express.json());
  app.use(requestLogger);
  app.use(rateLimiter(60000, 100));

  setupSwagger(app);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
  });

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/wallets', walletRoutes);
  app.use('/api/v1/transactions', transactionRoutes);
  app.use('/api/v1/rates', rateRoutes);
  app.use('/api/v1/payouts', payoutRoutes);
  app.use('/api/v1/kyc', kycRoutes);
  app.use('/api/v1/admin', adminRoutes);
  app.use('/api/v1/api-keys', apiKeyRoutes);
  app.use('/api/v1/providers', networkRoutes);
  app.use('/api/v1/sandbox', sandboxRoutes);

  app.use(stripeRoutes);
  app.use(mpesaRoutes);

  app.use('/webhooks', webhookRoutes);

  app.use(errorHandler);

  return app;
}
