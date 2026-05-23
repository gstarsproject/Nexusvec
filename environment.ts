/**
 * Centralized Environment Configuration File
 * NexusCore Enterprise SaaS Architecture
 * Highly resilient, cloud-agnostic configuration module
 */

const isServer = typeof window === 'undefined';

// Core Environment Checks
export const IS_SERVER = isServer;

export const IS_DEV = isServer
  ? (process.env.NODE_ENV !== 'production')
  : (!!(import.meta as any).env?.DEV);

export const IS_PRODUCTION = isServer
  ? (process.env.NODE_ENV === 'production')
  : (!!(import.meta as any).env?.PROD);

// AI Studio/Preview runtime check
export const IS_PREVIEW_ENV = isServer
  ? (process.env.AIS_PREVIEW === 'true' || process.env.USE_MOCK_SERVICES === 'true' || !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('nexus_mock'))
  : (typeof window !== 'undefined' && (window.location.hostname.includes('ais-pre') || window.location.hostname.includes('ais-dev') || window.location.hostname.includes('localhost')));

// Feature Flags
export const USE_MOCK_SERVICES = isServer
  ? (process.env.USE_MOCK_SERVICES === 'true' || (IS_PREVIEW_ENV && process.env.USE_MOCK_SERVICES !== 'false'))
  : true; // Client always defaults to mocks/server proxy safety

// Workers are enabled if explicitly configured or running in non-preview environment with workers set to true.
export const ENABLE_WORKERS = isServer
  ? (process.env.ENABLE_WORKERS === 'true' || (process.env.ENABLE_WORKERS !== 'false' && !IS_PREVIEW_ENV && process.env.ENABLE_WORKERS === 'true'))
  : false;

// Verbosities
export const ENABLE_VERBOSE_LOGS = isServer
  ? (process.env.ENABLE_VERBOSE_LOGS === 'true' && !IS_PREVIEW_ENV)
  : false;

export const PRISMA_LOG_DEBUG = isServer
  ? (process.env.PRISMA_LOG_DEBUG === 'true' && !IS_PREVIEW_ENV)
  : false;

// Polling and Intervals Rate Configuration (Throttled for AI Studio/Preview Stability)
export const TIMERS = {
  HEARTBEAT_INTERVAL: IS_PREVIEW_ENV ? 60000 : 10000,
  POLLING_INTERVAL: IS_PREVIEW_ENV ? 30000 : 5000,
  RETRY_TIMOUT: IS_PREVIEW_ENV ? 5000 : 1000,
};
