import { Router } from "express";
import crypto from "crypto";
import prisma from "../lib/prisma";
import { walletService } from "../services/billing/walletService";
import { auditMiddleware } from "../middleware/audit.middleware";
import { WebhookAuditLogger } from "../infrastructure/observability";

const router = Router();

// Helper to calculate Midtrans Webhook Signature with timing safe equality and multi-decimal formats
function verifyMidtransSignature(orderId: string, statusCode: string, grossAmount: string | number, serverKey: string, receivedSignature: string) {
  if (!orderId || !statusCode || !grossAmount || !receivedSignature) {
    return false;
  }
  const amountStr = String(grossAmount);
  // 1. Exact amount match
  const input1 = `${orderId}${statusCode}${amountStr}${serverKey}`;
  const hash1 = crypto.createHash('sha512').update(input1).digest('hex');
  
  // 2. Float double decimal match (e.g., 10000.00)
  const numericAmount = Number(grossAmount);
  const withDecimals = isNaN(numericAmount) ? amountStr : numericAmount.toFixed(2);
  const input2 = `${orderId}${statusCode}${withDecimals}${serverKey}`;
  const hash2 = crypto.createHash('sha512').update(input2).digest('hex');

  // 3. Integer rounded match (e.g., 10000)
  const withNoDecimals = isNaN(numericAmount) ? amountStr : String(Math.floor(numericAmount));
  const input3 = `${orderId}${statusCode}${withNoDecimals}${serverKey}`;
  const hash3 = crypto.createHash('sha512').update(input3).digest('hex');

  const compSecure = (h: string) => {
    try {
      const a = Buffer.from(h, 'utf8');
      const b = Buffer.from(receivedSignature, 'utf8');
      if (a.length !== b.length) return false;
      return crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  };

  return compSecure(hash1) || compSecure(hash2) || compSecure(hash3);
}

// In-Memory Webhook Idempotency Lock Class
class WebhookLock {
  private static locks = new Set<string>();

  static async acquire(key: string): Promise<boolean> {
    if (this.locks.has(key)) {
      return false;
    }
    this.locks.add(key);
    return true;
  }

  static release(key: string) {
    this.locks.delete(key);
  }
}

// In-Memory Webhook Replay Protection Tracking Class
class WebhookReplayTracker {
  private static processedSignatures = new Map<string, number>();
  private static CLEANUP_INTERVAL = 60 * 1000; // 1 minute
  private static timer: NodeJS.Timeout | null = null;

  static {
    this.timer = setInterval(() => {
      const now = Date.now();
      for (const [sig, ts] of this.processedSignatures.entries()) {
        if (now - ts > 15 * 60 * 1000) {
          this.processedSignatures.delete(sig);
        }
      }
    }, this.CLEANUP_INTERVAL);
    if (this.timer && typeof this.timer.unref === 'function') {
      this.timer.unref();
    }
  }

  static isReplay(signature: string): boolean {
    if (!signature) return true;
    const now = Date.now();
    if (this.processedSignatures.has(signature)) {
      return true;
    }
    this.processedSignatures.set(signature, now);
    return false;
  }
}

// Fluent Retry Executor Helper
async function performWithRetry<T>(orderId: string, fn: () => Promise<T>, retries = 3, delay = 100): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries <= 0) throw error;
    WebhookAuditLogger.onRetryAttempt(orderId, 4 - retries, error.message || String(error));
    await new Promise(resolve => setTimeout(resolve, delay));
    return performWithRetry(orderId, fn, retries - 1, delay * 2);
  }
}

// Fluent Deposit Cancellation helper matching database schema
async function cancelDeposit(transactionId: string) {
  return prisma.$transaction(async (tx) => {
    const transaction = await tx.walletTransaction.findUnique({
      where: { id: transactionId }
    });
    if (!transaction || transaction.status !== 'PENDING') {
      return;
    }
    await tx.wallet.update({
      where: { id: transaction.walletId },
      data: {
        pendingBalance: { decrement: transaction.amount }
      }
    });
    await tx.walletTransaction.update({
      where: { id: transactionId },
      data: { status: 'CANCELLED' }
    });
  });
}

// 5. MIDTRANS TOP-UP INTEGRATION (Checkout route)
router.post("/topup/checkout", auditMiddleware('PAYMENT_CHECKOUT'), async (req, res) => {
  const { amount, resellerId, agencyId, customerName, customerEmail } = req.body;
  
  if (!amount || !resellerId) {
    return res.status(400).json({ error: "Amount and resellerId are required" });
  }

  const serverKey = process.env.MIDTRANS_API_KEY || 'MOCK_API_KEY';
  const isProd = process.env.NODE_ENV === 'production' && !serverKey.includes('SB-'); // simple heuristic
  const baseUrl = isProd ? "https://app.midtrans.com/snap/v1/transactions" : "https://app.sandbox.midtrans.com/snap/v1/transactions";

  const orderId = `NXC-${resellerId}-${Date.now()}`;
  
  const payload = {
    transaction_details: {
      order_id: orderId,
      gross_amount: Math.round(Number(amount))
    },
    customer_details: {
      first_name: customerName || "Nexus",
      last_name: "Customer",
      email: customerEmail || "customer@nexuscore.local"
    },
    custom_field1: resellerId,
    custom_field2: agencyId || "mock-agency-id"
  };

  try {
    const resellerObj = await prisma.reseller.findUnique({
      where: { id: resellerId }
    });
    const resolvedTenantId = resellerObj?.tenantId || agencyId || "default-tenant-id";
    let tenantIdToUse = resolvedTenantId;
    if (tenantIdToUse === "mock-agency-id" || tenantIdToUse === "default-tenant-id") {
      const activeTenant = await prisma.tenant.findFirst();
      if (activeTenant) {
        tenantIdToUse = activeTenant.id;
      }
    }

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(serverKey + ':').toString('base64')}`
      },
      body: JSON.stringify(payload)
    });

    const midtransRes = await response.json();
    
    if (!response.ok) {
      console.error("[MIDTRANS] Failed to create snap invoice:", midtransRes);
      return res.status(response.status).json({ error: midtransRes });
    }

    let wallet = await prisma.wallet.findUnique({
      where: { ownerId: resellerId }
    });
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          ownerId: resellerId,
          tenantId: tenantIdToUse
        }
      });
    }

    await walletService.requestDeposit(wallet.id, Number(amount), orderId);

    return res.status(200).json({
      success: true,
      orderId,
      token: midtransRes.token,
      redirect_url: midtransRes.redirect_url
    });
  } catch (error: any) {
    console.error("[MIDTRANS] Checkout Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// 6. MIDTRANS WEBHOOK CALLBACK
router.post("/topup/webhook", async (req, res) => {
  const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status, custom_field1, custom_field2, transaction_time } = req.body || {};
  
  if (!order_id) {
    return res.status(400).json({ error: "Missing order_id" });
  }

  const hasLock = await WebhookLock.acquire(order_id);
  if (!hasLock) {
    console.warn("[MIDTRANS WEBHOOK] Idempotency lock active. Rejecting concurrent webhook for order_id:", order_id);
    return res.status(409).json({ error: "Concurrent webhook processing in progress. Try again." });
  }

  try {
    const serverKey = process.env.MIDTRANS_API_KEY || 'MOCK_API_KEY';

    if (!signature_key) {
      console.warn("[MIDTRANS WEBHOOK] Signature key is missing.");
      return res.status(403).json({ error: "Missing signature" });
    }

    const isValidSignature = verifyMidtransSignature(order_id, status_code, gross_amount, serverKey, signature_key);
    WebhookAuditLogger.onSignatureVerified(order_id, isValidSignature);
    if (!isValidSignature) {
      console.warn("[MIDTRANS WEBHOOK] Invalid signature key for order", order_id);
      return res.status(403).json({ error: "Invalid signature verification failed" });
    }

    if (WebhookReplayTracker.isReplay(signature_key)) {
      WebhookAuditLogger.onReplayDetected(signature_key, `Duplicate signature detected for order ${order_id}`);
      return res.status(403).json({ error: "Replay attack detected" });
    }

    if (transaction_time) {
      const eventTime = new Date(transaction_time).getTime();
      const now = Date.now();
      const fifteenMinutes = 15 * 60 * 1000;
      if (!isNaN(eventTime) && Math.abs(now - eventTime) > fifteenMinutes) {
        WebhookAuditLogger.onReplayDetected(signature_key, `Transaction time ${transaction_time} is outside the 15-minute sliding window (diff: ${Math.abs(now - eventTime)}ms)`);
        return res.status(403).json({ error: "Replay window expired" });
      }
    }

    console.log(`[MIDTRANS WEBHOOK] Processing order ${order_id} status updated to ${transaction_status}`);

    const existingTx = await prisma.walletTransaction.findFirst({
      where: { referenceId: order_id }
    });

    if (!existingTx) {
      console.warn(`[MIDTRANS WEBHOOK] Order ${order_id} not found in DB`);
      return res.status(404).json({ error: "Order not found" });
    }

    if (existingTx.status === 'COMPLETED') {
      WebhookAuditLogger.onPaymentDuplicateBlocked(order_id, existingTx.status);
      return res.status(200).json({ message: "Already completed" });
    }

    if (existingTx.status === 'CANCELLED' || existingTx.status === 'FAILED') {
      WebhookAuditLogger.onPaymentDuplicateBlocked(order_id, existingTx.status);
      return res.status(200).json({ message: "Already finalized as non-successful" });
    }

    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      if (transaction_status === 'capture' && fraud_status === 'challenge') {
        return res.status(200).json({ message: "Challenged" });
      }

      await performWithRetry(order_id, async () => {
        await walletService.approveDeposit(existingTx.id);
      });

      console.log(`[MIDTRANS WEBHOOK] Successfully credited order ${order_id} to reseller wallet`);
    } else if (transaction_status === 'cancel' || transaction_status === 'deny' || transaction_status === 'expire') {
      await performWithRetry(order_id, async () => {
        await cancelDeposit(existingTx.id);
      });
      console.log(`[MIDTRANS WEBHOOK] Successfully cancelled pending deposit for order ${order_id}`);
    }

    return res.status(200).json({ status: "ok" });
  } catch (error: any) {
    console.error(`[MIDTRANS WEBHOOK] Error processing webhook:`, error);
    return res.status(500).json({ error: error.message });
  } finally {
    WebhookLock.release(order_id);
  }
});

export default router;
