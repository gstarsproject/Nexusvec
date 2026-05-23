import { Router } from "express";
import prisma from "../lib/prisma";
import { 
  TransactionSafetyVerifier, 
  RetryExhaustionHandler, 
  TenantBoundaryVerifier, 
  WorkerHealthMonitor 
} from "../infrastructure/reliability";

const router = Router();

/**
 * RELIABILITY DIAGNOSTICS & SIMULATION APIS
 */

// 1. Worker Heartbeat and Health Diagnostics
router.get("/heartbeats", async (req, res) => {
  try {
    const liveStatus = WorkerHealthMonitor.checkWorkersHealth();
    res.json({
      success: true,
      summary: "Real-time background worker heartbeat registration",
      currentTime: new Date().toISOString(),
      workers: liveStatus
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Database Transaction Rollback Safety Verification
router.get("/rollback-test", async (req, res) => {
  try {
    let targetWallet = await prisma.wallet.findFirst();
    if (!targetWallet) {
      let activeTenant = await prisma.tenant.findFirst();
      if (!activeTenant) {
        activeTenant = await prisma.tenant.create({
          data: {
            name: "Reliability Test Tenant",
            slug: `rel-tenant-${Date.now()}`,
            email: `rel-tenant-${Date.now()}@nexuscore.local`,
            status: "ACTIVE"
          }
        });
      }
      targetWallet = await prisma.wallet.create({
        data: {
          ownerId: `sys-safety-test-id-${Date.now()}`,
          tenantId: activeTenant.id,
          balance: 0.00,
          pendingBalance: 0.00
        }
      });
    }

    const result = await TransactionSafetyVerifier.runRollbackTest(targetWallet.id);
    res.json({
      success: result.success,
      testedWalletId: targetWallet.id,
      message: result.message
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Automated Webhook Settlement Retry Exhaustion Simulator
router.post("/reconcile-exhaustion", async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ error: "Missing required orderId to simulate retry exhaustion" });
  }

  try {
    const txRecord = await prisma.walletTransaction.findFirst({
      where: { referenceId: orderId, status: "PENDING" }
    });

    if (!txRecord) {
      return res.status(404).json({
        error: `No pending wallet transaction matching reference orderId [${orderId}] was found to simulate exhaustion on.`
      });
    }

    await RetryExhaustionHandler.handleWebhookExhaustion(txRecord.id, "Simulated maximum retries boundary limit exceeded");

    res.json({
      success: true,
      message: `Successfully executed retry exhaustion compensation flow for transaction [${txRecord.id}]. Wallet pending balances reverted, status updated to FAILED.`,
      details: {
        transactionId: txRecord.id,
        referenceId: txRecord.referenceId,
        reconciledStatus: "FAILED"
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Multi-Tenant Boundary Security Validation Test
router.post("/tenant-breach-test", async (req, res) => {
  const { userTenantId, targetTenantId, resourceId } = req.body;

  if (!userTenantId || !targetTenantId || !resourceId) {
    return res.status(400).json({
      error: "Missing required payload parameter inputs: userTenantId, targetTenantId, resourceId"
    });
  }

  try {
    TenantBoundaryVerifier.assertTenantMatch(userTenantId, targetTenantId, resourceId);
    
    res.json({
      success: true,
      message: "No boundary infraction. Tenants matched successfully."
    });
  } catch (err: any) {
    res.status(403).json({
      success: false,
      error: err.message,
      isBlockedAsIntended: err.message.includes("MUTATION_DENIED")
    });
  }
});

export default router;
