import Redis from 'ioredis';
import { getConfig } from '../config/index.js';

const config = getConfig();

export const redis = new Redis(config.REDIS_URL, { maxRetriesPerRequest: null });
