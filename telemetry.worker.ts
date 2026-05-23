import { Worker, Job, WorkerOptions } from 'bullmq';
import { createRedisInstance } from '../infrastructure/redis';
import Redis from 'ioredis';
import prisma from '../lib/prisma';
import { JobMonitorTracker } from '../infrastructure/observability';
import { WorkerHealthMonitor } from '../infrastructure/reliability';
import { ENABLE_WORKERS } from '../config/environment';

let connection: Redis | null = null;
let workerOptions: WorkerOptions | null = null;

if (ENABLE_WORKERS) {
  connection = createRedisInstance();
  workerOptions = {
    connection,
    concurrency: 5,
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

export const startTelemetryWorker = () => {
  if (!ENABLE_WORKERS) {
    console.log('[Telemetry Background Worker] Disabled in preview/sandbox mode to conserve runtime limits.');
    return new MockWorker('telemetry') as any;
  }

  const worker = new Worker('telemetry', async (job: Job) => {
    WorkerHealthMonitor.recordHeartbeat('telemetry');
    const startTimeStamp = process.hrtime();
    JobMonitorTracker.onStart('telemetry', job.name, job.id || 'unknown');
    
    const { action, userId, metadata, ipAddress, tenantId } = job.data;
    
    // Safety check
    if (!action || !userId || !tenantId) {
      throw new Error('Invalid telemetry payload: missing action, userId or tenantId');
    }

    // Persist to safe AuditLog using Prisma
    const res = await prisma.auditLog.create({
      data: {
        action,
        userId,
        tenantId,
        ipAddress: ipAddress || 'unknown',
        details: metadata || {}
      }
    });

    const [diffSec, diffNano] = process.hrtime(startTimeStamp);
    const durationMs = Number((diffSec * 1000 + diffNano / 1e6).toFixed(2));
    JobMonitorTracker.onSuccess('telemetry', job.name, job.id || 'unknown', { success: true, id: res.id }, durationMs);
    
    return { success: true };
  }, workerOptions!);

  worker.on('failed', (job, err) => {
    JobMonitorTracker.onFailure('telemetry', job?.name || 'unknown', job?.id || 'unknown', err, job?.attemptsMade || 1);
  });
  
  worker.on('error', err => {
    JobMonitorTracker.onFailure('telemetry', 'SYSTEM_ERR', 'system', err, 0);
  });

  return worker;
};
