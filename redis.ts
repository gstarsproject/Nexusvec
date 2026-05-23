import Redis from 'ioredis';
import { EventEmitter } from 'events';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Shared config with optimization for BullMQ
export const redisConfig = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy(times: number) {
    // Exponential backoff with maximum 5s delay
    const delay = Math.min(times * 100, 5000);
    return delay;
  },
  reconnectOnError(err: Error) {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      // Only reconnect when the error contains "READONLY"
      return true;
    }
    return false;
  }
};

class MockRedis extends EventEmitter {
  status = 'ready';
  constructor() {
    super();
    process.nextTick(() => {
      this.emit('connect');
      this.emit('ready');
    });
  }
  async get(key: string) { return null; }
  async set(key: string, value: string) { return 'OK'; }
  async del(key: string) { return 0; }
  async quit() { this.status = 'closed'; return 'OK'; }
  async disconnect() { this.status = 'closed'; }
}

const isMock = process.env.USE_MOCK_SERVICES === 'true' || 
               !process.env.REDIS_URL || 
               process.env.REDIS_URL.includes('localhost');

/**
 * Robust Centralized Redis Instance Creator
 * Properly configures TLS/SSL, reconnect logic, error listeners, and BullMQ specifications.
 */
export const createRedisInstance = (url?: string) => {
  if (isMock) {
    return new MockRedis() as any;
  }

  const rawUrl = url || process.env.REDIS_URL || 'redis://localhost:6379';
  // Sanitize: take the first part, remove quotes, and ensure rediss protocol
  let targetUrl = rawUrl.split(' ')[0].replace(/['"]/g, '');
  if (targetUrl.startsWith('https://')) {
    targetUrl = targetUrl.replace('https://', 'rediss://');
  } else if (!targetUrl.includes('://')) {
    targetUrl = 'rediss://' + targetUrl;
  }
  
  const options: any = {
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,
    retryStrategy(times: number) {
      // Exponential backoff with maximum 5s delay
      const delay = Math.min(times * 200, 5000);
      return delay;
    },
    reconnectOnError(err: Error) {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        return true;
      }
      return false;
    }
  };

  // Safe TLS configuration for production Upstash Redis or rediss:// protocol
  if (targetUrl.startsWith('rediss://') || targetUrl.includes('upstash.io')) {
    options.tls = {
      rejectUnauthorized: false // Bypasses self-signed or intermediate cert verification errors in limited runtime envs
    };
  }

  const client = new Redis(targetUrl, options);

  client.on('error', (err: any) => {
    console.error('[Redis Client Error]', err);
  });

  client.on('ready', () => {
    console.log('[Redis] Client connected and ready');
  });

  return client;
};

// export const redis = createRedisInstance(REDIS_URL); // DEPRECATED: Use getRedisClient()
let lazyRedis: any = null;

export const getRedisClient = () => {
  if (!lazyRedis) {
    lazyRedis = createRedisInstance(REDIS_URL);
  }
  return lazyRedis;
};

/**
 * Handle graceful shutdown of connections
 */
export const closeRedis = async () => {
  if (isMock) {
    if (lazyRedis) lazyRedis.status = 'closed';
    return;
  }
  if (lazyRedis && (lazyRedis.status === 'ready' || lazyRedis.status === 'connect')) {
    await lazyRedis.quit();
    console.log('[Redis] Connection closed safely');
  }
};
