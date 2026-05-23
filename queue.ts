import { Queue, QueueOptions } from 'bullmq';
import { createRedisInstance } from './redis';
import { JobMonitorTracker } from './observability';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const isMock = process.env.USE_MOCK_SERVICES === 'true' || 
               !process.env.REDIS_URL || 
               process.env.REDIS_URL.includes('localhost');

const defaultOptions: QueueOptions = {
  connection: isMock ? undefined : createRedisInstance(REDIS_URL),
  defaultJobOptions: {
    removeOnComplete: 100, // keep last 100
    removeOnFail: 500,     // keep last 500
    attempts: 3,           // default to 3 retries
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
};

class MockQueue {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  async add(name: string, data: any) {
    const jobId = `mock-job-${Math.floor(Math.random() * 100000)}`;
    console.log(`[Mock Queue: ${this.name}] Added job [${name}]`, data);
    return {
      id: jobId,
      name,
      data,
      attemptsMade: 0,
      timestamp: Date.now()
    };
  }
  async close() {}
}

// Application Queues
export const queues = isMock ? {
  paymentVerification: new MockQueue('payment-verification') as any,
  payoutProcessing: new MockQueue('payout-processing') as any,
  analyticsAggregator: new MockQueue('analytics-aggregator') as any,
  webhooks: new MockQueue('webhooks') as any,
  notifications: new MockQueue('notifications') as any,
} : {
  paymentVerification: new Queue('payment-verification', defaultOptions),
  payoutProcessing: new Queue('payout-processing', defaultOptions),
  analyticsAggregator: new Queue('analytics-aggregator', defaultOptions),
  webhooks: new Queue('webhooks', defaultOptions),
  notifications: new Queue('notifications', defaultOptions),
};

export const enqueueJob = async (queueName: keyof typeof queues, name: string, data: any) => {
  const queue = queues[queueName];
  if (!queue) throw new Error(`Queue ${queueName} not found`);
  const job = await queue.add(name, data);
  JobMonitorTracker.onAdd(queueName, name, job.id, data);
  return job;
};
