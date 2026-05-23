import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import prisma from "../lib/prisma";
import { AuditLogger } from "../modules/audit/auditLogger";

// 1. Centralized Structured Logger Interface
export interface LogEntry {
  timestamp: string;
  traceId?: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG" | "FATAL";
  module: string;
  message: string;
  durationMs?: number;
  metadata?: any;
}

export class ProductionLogger {
  private static serialize(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  static writeLog(level: LogEntry["level"], module: string, message: string, metadata?: any, traceId?: string, durationMs?: number) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      traceId,
      level,
      module,
      message,
      durationMs,
      metadata: metadata ? this.sanitize(metadata) : undefined
    };

    // Output to stdout/stderr in structured JSON format
    if (level === "ERROR" || level === "FATAL") {
      console.error(this.serialize(entry));
    } else if (level === "WARN") {
      console.warn(this.serialize(entry));
    } else {
      console.log(this.serialize(entry));
    }

    // Persist severe system events to database AuditLog
    if (level === "ERROR" || level === "FATAL" || level === "WARN") {
      const tenantId = metadata?.tenantId || metadata?.agencyId || "nexus-core-prod";
      AuditLogger.log({
        tenantId,
        userId: metadata?.userId || undefined,
        action: `SYS_OBSERVABILITY_${module.toUpperCase()}_${level}`,
        entityType: "SystemLog",
        entityId: traceId || "system",
        severity: level === "FATAL" ? "CRITICAL" : (level === "ERROR" ? "CRITICAL" : "WARNING"),
        details: {
          message,
          durationMs,
          ...metadata
        }
      });
    }
  }

  private static sanitize(obj: any): any {
    if (!obj || typeof obj !== "object") return obj;
    const sensitiveKeys = ["password", "apiKey", "clientKey", "secret", "token", "signature", "signature_key", "passwordHash", "authorization"];
    const clone = { ...obj };
    
    for (const key of Object.keys(clone)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        clone[key] = "[REDACTED_SECURE_VAL]";
      } else if (typeof clone[key] === "object") {
        clone[key] = this.sanitize(clone[key]);
      }
    }
    return clone;
  }

  static info(module: string, message: string, metadata?: any, traceId?: string, duration?: number) {
    this.writeLog("INFO", module, message, metadata, traceId, duration);
  }

  static warn(module: string, message: string, metadata?: any, traceId?: string, duration?: number) {
    this.writeLog("WARN", module, message, metadata, traceId, duration);
  }

  static error(module: string, message: string, err?: any, metadata?: any, traceId?: string) {
    const errorDetails = err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err;
    this.writeLog("ERROR", module, message, { ...(metadata || {}), error: errorDetails }, traceId);
  }

  static debug(module: string, message: string, metadata?: any, traceId?: string) {
    if (process.env.NODE_ENV !== "production") {
      this.writeLog("DEBUG", module, message, metadata, traceId);
    }
  }
}

// 2. Request Tracing Middleware
export interface TracedRequest extends Request {
  traceId?: string;
  startTime?: [number, number];
}

export function requestTracerMiddleware(req: TracedRequest, res: Response, next: NextFunction) {
  // Generate or forward Trace Identity
  const traceId = (req.headers["x-trace-id"] as string) || crypto.randomUUID();
  req.traceId = traceId;
  req.startTime = process.hrtime();
  res.setHeader("X-Trace-ID", traceId);

  // Capture payload details safely (excluding sensitive fields)
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
  
  ProductionLogger.info("API_REQUEST", `Incoming ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: clientIp,
    userAgent: req.headers["user-agent"],
    headers: req.headers,
    query: req.query,
    body: req.method !== "GET" ? req.body : undefined
  }, traceId);

  // Log response duration when finished
  res.on("finish", () => {
    let durationMs = 0;
    if (req.startTime) {
      const [diffSec, diffNano] = process.hrtime(req.startTime);
      durationMs = Number((diffSec * 1000 + diffNano / 1e6).toFixed(2));
    }

    const logMetadata = {
      statusCode: res.statusCode,
      method: req.method,
      url: req.originalUrl,
      ip: clientIp,
      tenantId: (req as any).tenantId || "system",
      userId: (req as any).userId || "anonymous"
    };

    if (res.statusCode >= 500) {
      ProductionLogger.writeLog("FATAL", "API_RESPONSE", `HTTP Server Error ${res.statusCode} on ${req.method} ${req.originalUrl}`, logMetadata, traceId, durationMs);
    } else if (res.statusCode >= 400) {
      ProductionLogger.warn("API_RESPONSE", `HTTP Client Error ${res.statusCode} on ${req.method} ${req.originalUrl}`, logMetadata, traceId, durationMs);
    } else {
      ProductionLogger.info("API_RESPONSE", `Completed ${req.method} ${req.originalUrl} - status: ${res.statusCode}`, logMetadata, traceId, durationMs);
    }

    // Performance Warning
    if (durationMs > 200) {
      ProductionLogger.warn("PERFORMANCE_DEGRADED", `Slow response on API ${req.method} ${req.originalUrl}`, {
        durationMs,
        method: req.method,
        url: req.originalUrl
      }, traceId);
    }
  });

  next();
}

// 3. Queue and Job Monitoring System Helper
export class JobMonitorTracker {
  static onAdd(queueName: string, jobName: string, jobId?: string, data?: any) {
    ProductionLogger.info("QUEUE_SYSTEM", `Enqueued background work task: Queue=[${queueName}], Job=[${jobName}], ID=[${jobId || "NA"}]`, {
      queueName,
      jobName,
      jobId,
      data
    });
  }

  static onStart(queueName: string, jobName: string, jobId: string) {
    ProductionLogger.info("WORKER_RUN", `Executing task: Queue=[${queueName}], Job=[${jobName}], ID=[${jobId}]`);
  }

  static onSuccess(queueName: string, jobName: string, jobId: string, result: any, durationMs?: number) {
    ProductionLogger.info("WORKER_SUCCESS", `Completed worker task successfully: Queue=[${queueName}], Job=[${jobName}], ID=[${jobId}]`, {
      result
    }, undefined, durationMs);
  }

  static onFailure(queueName: string, jobName: string, jobId: string, error: Error, attempt: number) {
    ProductionLogger.error("WORKER_FAILURE", `Background job processing failed on queue [${queueName}]. Job=[${jobName}], ID=[${jobId}], Attempt=[${attempt}]`, error, {
      queueName,
      jobName,
      jobId,
      attempt
    });
  }
}

// 4. Webhook Security and Execution Audits
export class WebhookAuditLogger {
  static onSignatureVerified(orderId: string, isValid: boolean) {
    ProductionLogger.info("WEBHOOK_SECURITY", `Signature verification calculated for Order [${orderId}]: Valid=[${isValid}]`, {
      orderId,
      isValid
    });
  }

  static onReplayDetected(signature: string, reason: string) {
    ProductionLogger.warn("SECURITY_BREACH", `Potential Webhook Replay Attack blocked: ${reason}`, {
      signature,
      reason
    });
  }

  static onPaymentDuplicateBlocked(orderId: string, originalStatus: string) {
    ProductionLogger.info("PAYMENT_IDEMPOTENCY", `Duplicate payment check triggered. Ignored webhook update as order [${orderId}] is already completed/terminal. Current status=[${originalStatus}]`, {
      orderId,
      originalStatus
    });
  }

  static onRetryAttempt(orderId: string, attempt: number, errorMsg: string) {
    ProductionLogger.warn("PROCESS_RETRY", `Transient error executing webhook handler transaction for order [${orderId}]. Initiating exponential backoff retry #${attempt}`, {
      orderId,
      attempt,
      errorMsg
    });
  }
}

// 5. Payment Action Audits
export class PaymentAuditLogger {
  static onIntentStarted(userId: string, tenantId: string, amount: number, transactionId: string) {
    ProductionLogger.info("PAYMENT_INTENT", `Payment Deposit Process Launched: User=[${userId}], Tenant=[${tenantId}], Amount=[${amount}], TX_ID=[${transactionId}]`, {
      userId,
      tenantId,
      amount,
      transactionId
    });
  }

  static onDoubleSpendBlocked(walletId: string, amount: number, referenceId: string) {
    ProductionLogger.warn("FRAUD_IDEMPOTENCY_BREACH", `DoubleSpend transaction flagged. Intercepted request on wallet ID [${walletId}] of amount [${amount}] to prevent duplicate wallet balance updating. RefId: ${referenceId}`, {
      walletId,
      amount,
      referenceId
    });
  }

  static onDepositCredited(walletId: string, amount: number, balanceBefore: number, balanceAfter: number) {
    ProductionLogger.info("PAYMENT_SUCCESS", `Vault Ledger credit posted: Wallet=[${walletId}], Added=[${amount}], Before=[${balanceBefore}], After=[${balanceAfter}]`, {
      walletId,
      amount,
      balanceBefore,
      balanceAfter
    });
  }
}

// 6. Prisma Database Statement Diagnostics
export function logPrismaDiagnostics(query: string, params: string, durationMs: number) {
  // Flag slow query execution
  if (durationMs > 100) {
    ProductionLogger.warn("PRISMA_DATABASE_SLOW_QUERY", `Prisma query took ${durationMs}ms to complete`, {
      query,
      params,
      durationMs
    });
  } else if (process.env.PRISMA_LOG_DEBUG === "true") {
    ProductionLogger.debug("PRISMA_QUERY", `Executed DB query [${durationMs}ms]`, {
      query,
      params,
      durationMs
    });
  }
}
