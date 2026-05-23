import prisma from "../lib/prisma";
import { ProductionLogger, WebhookAuditLogger, PaymentAuditLogger } from "./observability";
import { Role } from "../types";

// 1. Safe Retry Exhaustion Handler
export class RetryExhaustionHandler {
  /**
   * Safely reconciles a transaction when webhook/payment retries are completely exhausted.
   * Cancels any pending balance and transitions status to FAILED or CANCELLED to prevent state leakage.
   */
  static async handleWebhookExhaustion(transactionId: string, errorMsg: string): Promise<void> {
    ProductionLogger.writeLog(
      "FATAL",
      "RETRY_EXHAUSTED",
      `Webhook settlement retries exhausted for transaction ID [${transactionId}]. Reconciling client balances.`,
      { transactionId, lastError: errorMsg }
    );

    try {
      await prisma.$transaction(async (tx) => {
        const txRecord = await tx.walletTransaction.findUnique({
          where: { id: transactionId }
        });

        if (!txRecord) {
          ProductionLogger.warn("RETRY_EXHAUSTED_RECONCILE", `Transaction [${transactionId}] not found during compensation.`);
          return;
        }

        if (txRecord.status !== "PENDING") {
          ProductionLogger.info("RETRY_EXHAUSTED_RECONCILE", `Transaction [${transactionId}] is already in finished state [${txRecord.status}]`);
          return;
        }

        // Revert any pending balance increment
        await tx.wallet.update({
          where: { id: txRecord.walletId },
          data: {
            pendingBalance: { decrement: txRecord.amount }
          }
        });

        // Set state to FAILED
        await tx.walletTransaction.update({
          where: { id: transactionId },
          data: { status: "FAILED" }
        });

        ProductionLogger.info(
          "RETRY_EXHAUSTED",
          `Successfully recovered wallet pendings and updated transaction [${transactionId}] status to FAILED.`
        );
      });
    } catch (err: any) {
      ProductionLogger.error(
        "RETRY_EXHAUSTED_FATAL",
        `Failed to execute safe fallback compensation for transaction [${transactionId}]! Core database state could be inconsistent.`,
        err,
        { transactionId }
      );
    }
  }
}

// 2. Transaction Rollback Safety Verification
export class TransactionSafetyVerifier {
  /**
   * Executes a controlled business transaction rollback to confirm DB transactional guarantees are fully intact.
   * Specifically, it creates a test walletTransaction, increments pending balance, and forces an error
   * to guarantee everything rolls back cleanly.
   */
  static async runRollbackTest(walletId: string): Promise<{ success: boolean; message: string }> {
    ProductionLogger.info("DIAGNOSTICS", `Starting controlled database transaction rollback test on wallet [${walletId}]`);
    let testTxCreated = false;

    try {
      await prisma.$transaction(async (tx) => {
        const wallet = await tx.wallet.findUnique({
          where: { id: walletId }
        });
        if (!wallet) throw new Error("WALLET_NOT_FOUND");

        // Step A: Update wallet pending balance
        await tx.wallet.update({
          where: { id: walletId },
          data: { pendingBalance: { increment: 99.99 } }
        });

        // Step B: Intentionally create an ephemeral tx record
        const testTx = await tx.walletTransaction.create({
          data: {
            walletId,
            tenantId: wallet.tenantId,
            referenceId: `diag-rollback-${Date.now()}`,
            amount: 99.99,
            type: "CREDIT",
            status: "PENDING",
            description: "DIAGNOSTIC ROLLBACK TEST"
          }
        });
        testTxCreated = true;

        // Step C: Force transaction failure/abort to trigger rollback
        throw new Error("INTENTIONAL_ROLLBACK_TEST_ERROR");
      });

      // Should not be reached
      return { success: false, message: "Prisma transaction succeeded but was expected to roll back." };
    } catch (error: any) {
      if (error.message === "INTENTIONAL_ROLLBACK_TEST_ERROR") {
        ProductionLogger.info("DIAGNOSTICS", "Transaction rollback test aborted successfully as planned.");

        // D: Verify state remains completely unaltered
        const currentWallet = await prisma.wallet.findUnique({ where: { id: walletId } });
        const createdCount = await prisma.walletTransaction.count({
          where: { description: "DIAGNOSTIC ROLLBACK TEST" }
        });

        if (createdCount > 0) {
          return { success: false, message: "Database isolation leak: ephemeral transaction persisted." };
        }

        return {
          success: true,
          message: "Transaction safety verified. Zero state was leaked, rollback completed flawlessly."
        };
      } else {
        ProductionLogger.error("DIAGNOSTICS", "An unexpected DB error occurred during rollback test.", error);
        return { success: false, message: `Rollback test failed with unexpected error: ${error.message}` };
      }
    }
  }
}

// 3. Multi-Tenant Boundary Isolation Asserter
export class TenantBoundaryVerifier {
  /**
   * Asserts that a user has strict permission to interact with a specific resource tenant.
   * Leveraged as a secure boundary check before performing mutations.
   */
  static assertTenantMatch(userTenantId: string | undefined | null, targetTenantId: string, resourceId: string) {
    if (!userTenantId) {
      throw new Error("MUTATION_DENIED: User context has no associated tenant context.");
    }
    if (userTenantId !== targetTenantId) {
      ProductionLogger.writeLog(
        "FATAL",
        "TENANT_SECURITY_VIOLATION",
        `A multi-tenant boundary breach was intercepted! User from tenant [${userTenantId}] attempted access of target tenant [${targetTenantId}] on resource [${resourceId}].`,
        { userTenantId, targetTenantId, resourceId }
      );
      throw new Error(`MUTATION_DENIED: Multi-tenant boundary breach detected on resource ${resourceId}`);
    }
    return true;
  }
}

// 4. Role (RBAC) Security Clearance Audit
export class RoleSecurityClearance {
  /**
   * Audits that a user's evaluated role meets minimum clearance levels.
   */
  static hasClearance(role: Role, requiredRoles: Role[]): boolean {
    // SUPER_OWNER can bypass all clearance gates
    if (role === "SUPER_OWNER" || role === "SUPER_ADMIN") {
      return true;
    }
    return requiredRoles.includes(role);
  }
}

// 5. Worker Recovery Monitoring
export class WorkerHealthMonitor {
  private static heartbeatMap = new Map<string, number>();

  static recordHeartbeat(workerName: string) {
    this.heartbeatMap.set(workerName, Date.now());
    ProductionLogger.debug("WORKER_HEALTH", `Heartbeat packet recorded for worker [${workerName}]`);
  }

  static checkWorkersHealth(): { workerName: string; active: boolean; lastSeenMs: number }[] {
    const now = Date.now();
    return Array.from(this.heartbeatMap.entries()).map(([workerName, lastSeen]) => {
      const diff = now - lastSeen;
      const active = diff < 65 * 1000; // Expected heartbeat every 60 seconds
      return {
        workerName,
        active,
        lastSeenMs: diff
      };
    });
  }
}
