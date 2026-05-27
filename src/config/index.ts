import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),

  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),

  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  MPESA_CONSUMER_KEY: z.string().optional(),
  MPESA_CONSUMER_SECRET: z.string().optional(),
  MPESA_PASSKEY: z.string().optional(),
  MPESA_SHORTCODE: z.string().optional(),
  MPESA_ENVIRONMENT: z.enum(['sandbox', 'production']).default('sandbox'),

  MTN_MOMO_API_KEY: z.string().optional(),
  MTN_MOMO_API_SECRET: z.string().optional(),
  MTN_MOMO_SUBSCRIPTION_KEY: z.string().optional(),
  MTN_MOMO_ENVIRONMENT: z.enum(['sandbox', 'production']).default('sandbox'),

  AIRTEL_CLIENT_ID: z.string().optional(),
  AIRTEL_CLIENT_SECRET: z.string().optional(),
  AIRTEL_ENVIRONMENT: z.enum(['sandbox', 'production']).default('sandbox'),

  ORANGE_CLIENT_ID: z.string().optional(),
  ORANGE_CLIENT_SECRET: z.string().optional(),
  ORANGE_ENVIRONMENT: z.enum(['sandbox', 'production']).default('sandbox'),

  WAVE_API_KEY: z.string().optional(),
  WAVE_ENVIRONMENT: z.enum(['test', 'prod']).default('test'),

  EXCHANGE_RATE_API_KEY: z.string().optional(),
  EXCHANGE_RATE_PROVIDER: z.string().default('open-exchange-rates'),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  NOTIFICATION_EMAIL_FROM: z.string().email().optional(),

  SMS_PROVIDER: z.string().optional(),
  SMS_PROVIDER_API_KEY: z.string().optional(),
  SMS_FROM_NUMBER: z.string().optional(),

  ENCRYPTION_KEY: z.string().min(32).optional(),

  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  APP_URL: z.string().default('http://localhost:3000'),
});

export type Env = z.infer<typeof envSchema>;

let config: Env | null = null;

export function loadConfig(): Env {
  if (config) return config;
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment variables:', result.error.flatten());
    process.exit(1);
  }
  config = result.data;
  return config;
}

export function getConfig(): Env {
  if (!config) return loadConfig();
  return config;
}
