import { Worker, Job, WorkerOptions } from 'bullmq';
import { createRedisInstance } from '../infrastructure/redis';
import Redis from 'ioredis';
import { JobMonitorTracker } from '../infrastructure/observability';
import { WorkerHealthMonitor } from '../infrastructure/reliability';
import { ENABLE_WORKERS } from '../config/environment';

// Workers need their own Redis connection
let connection: Redis | null = null;
let workerOptions: WorkerOptions | null = null;

if (ENABLE_WORKERS) {
  connection = createRedisInstance();
  workerOptions = {
    connection,
    concurrency: process.env.NODE_ENV === 'production' ? 10 : 2,
    limiter: {
      max: 100,
      duration: 1000,
    },
  };
}

class MockWorker {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  on(event: string, callback: (...args: any[]) => void) {
    // Elegant silent receiver for event handlers
    return this;
  }
  async close() {
    console.log(`[Mock Worker: ${this.name}] Safely closed`);
  }
}

export const startRetryWorker = () => {
  if (!ENABLE_WORKERS) {
    console.log('[Retry Background Worker] Disabled in preview/sandbox mode to conserve runtime limits.');
    return new MockWorker('retry') as any;
  }

  const worker = new Worker('retry', async (job: Job) => {
    WorkerHealthMonitor.recordHeartbeat('retry');
    const startTimeStamp = process.hrtime();
    JobMonitorTracker.onStart('retry', job.name, job.id || 'unknown');
    
    // Validate payload and memory protection
    if (!job.data || Object.keys(job.data).length === 0) {
      throw new Error('Empty payload');
    }
    
    const result = { status: 'ok', processedAt: new Date().toISOString() };
    const [diffSec, diffNano] = process.hrtime(startTimeStamp);
    const durationMs = Number((diffSec * 1000 + diffNano / 1e6).toFixed(2));
    JobMonitorTracker.onSuccess('retry', job.name, job.id || 'unknown', result, durationMs);
    
    return result;
  }, workerOptions!);

  worker.on('failed', (job, err) => {
    JobMonitorTracker.onFailure('retry', job?.name || 'unknown', job?.id || 'unknown', err, job?.attemptsMade || 1);
  });

  worker.on('error', err => {
    JobMonitorTracker.onFailure('retry', 'SYSTEM_ERR', 'system', err, 0);
  });
  
  worker.on('stalled', (jobId) => {
    JobMonitorTracker.onFailure('retry', 'STALLED_ERR', jobId, new Error('Job stalled'), 0);
  });

  return worker;
};

// Graceful shutdown handling
export const shutdownWorkers = async (workers: Worker[]) => {
  console.log('Shutting down workers gracefully...');
  for (const worker of workers) {
    if (worker) {
      await worker.close();
    }
  }
  if (connection) {
    await connection.quit();
  }
};
