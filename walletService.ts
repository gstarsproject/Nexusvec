import prisma from '../../lib/prisma';
import { PaymentAuditLogger } from '../../infrastructure/observability';
// Backend-only service. Enums and types defined locally for browser-safe bundling compatibility.
export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

import { Decimal } from '../suppliers/types';

export const walletService = {
  /**
   * Freezes balance for an escrow-like behavior during order processing.
   * Prevents double spending by moving 'balance' to 'frozenBalance'.
   */
  async freezeBalance(walletId: string, amount: number, referenceId: string) {
    if (typeof process === 'undefined' || !process.env.DATABASE_URL) {
      throw new Error('Database connection (DATABASE_URL) not configured. Cannot perform stateful transactions.');
    }
    return prisma.$transaction(async (tx) => {
      // Prevent duplicate transactions (double-spending protection)
      if (referenceId) {
        const dupTx = await tx.walletTransaction.findFirst({
          where: { walletId, referenceId, status: TransactionStatus.COMPLETED }
        });
        if (dupTx) {
          PaymentAuditLogger.onDoubleSpendBlocked(walletId, amount, referenceId);
          throw new Error(`Double-spending blocked. ReferenceId ${referenceId} is already processed.`);
        }
      }

      // 1. Lock the wallet row strictly
      const wallets = await tx.$queryRawUnsafe<any[]>(
        `SELECT * FROM "Wallet" WHERE id = $1 FOR UPDATE`,
        walletId
      );
      const wallet = wallets[0];

      if (!wallet) throw new Error('Wallet not found');
      if (new Decimal(wallet.balance).lessThan(amount)) {
        throw new Error('Insufficient balance');
      }

      const updatedWallet = await tx.wallet.update({
        where: { id: walletId },
        data: {
          balance: { decrement: amount },
          frozenBalance: { increment: amount }
        }
      });

      await tx.walletTransaction.create({
        data: {
          walletId,
          tenantId: wallet.tenantId,
          amount,
          type: TransactionType.DEBIT,
          status: TransactionStatus.PENDING,
          description: `Balance frozen for order ${referenceId}`,
          referenceId,
          metadata: { action: 'FREEZE' }
        }
      });

      return updatedWallet;
    });
  },

  /**
   * Finalizes an escrowed transaction after successful fulfillment.
   * Clears the frozen balance.
   */
  async finalizeFreezenDebit(walletId: string, amount: number, referenceId: string) {
    return prisma.$transaction(async (tx) => {
      // Prevent double-spending / duplicate completion
      if (referenceId) {
        const dupTx = await tx.walletTransaction.findFirst({
          where: { walletId, referenceId, status: TransactionStatus.COMPLETED }
        });
        if (dupTx) {
          throw new Error(`Double-spending blocked. ReferenceId ${referenceId} is already completed.`);
        }
      }

      const wallets = await tx.$queryRawUnsafe<any[]>(
        `SELECT * FROM "Wallet" WHERE id = $1 FOR UPDATE`,
        walletId
      );
      const wallet = wallets[0];

      if (!wallet || new Decimal(wallet.frozenBalance).lessThan(amount)) {
        throw new Error('Invalid frozen balance state');
      }

      await tx.wallet.update({
        where: { id: walletId },
        data: {
          frozenBalance: { decrement: amount }
        }
      });

      await tx.walletTransaction.create({
        data: {
          walletId,
          tenantId: wallet.tenantId,
          amount,
          type: TransactionType.DEBIT,
          status: TransactionStatus.COMPLETED,
          description: `Escrow released and debited for order ${referenceId}`,
          referenceId,
          metadata: { action: 'FINALIZE_DEBIT' }
        }
      });
    });
  },

  /**
   * Reverts a frozen balance (Refund).
   * Moves frozen balance back to main balance.
   */
  async revertFrozenBalance(walletId: string, amount: number, referenceId: string) {
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
      if (!wallet) throw new Error('Wallet not found');

      await tx.wallet.update({
        where: { id: walletId },
        data: {
          frozenBalance: { decrement: amount },
          balance: { increment: amount }
        }
      });

      await tx.walletTransaction.create({
        data: {
          walletId,
          tenantId: wallet.tenantId,
          amount,
          type: TransactionType.CREDIT,
          status: TransactionStatus.COMPLETED,
          description: `Frozen balance reverted (Refund) for order ${referenceId}`,
          referenceId,
          metadata: { action: 'REVERT_FREEZE' }
        }
      });
    });
  },

  /**
   * Performs an ATOMIC DIRECT DEBIT. Bypasses the freeze state and instantly debits.
   */
  async atomicDebit(walletId: string, amount: number, referenceId: string, description?: string) {
    if (typeof process === 'undefined' || !process.env.DATABASE_URL) {
      throw new Error('Database connection (DATABASE_URL) not configured. Cannot perform stateful transactions.');
    }
    return prisma.$transaction(async (tx) => {
      if (referenceId) {
        const dupTx = await tx.walletTransaction.findFirst({
          where: { walletId, referenceId, status: TransactionStatus.COMPLETED }
        });
        if (dupTx) {
          throw new Error(`Double-spending blocked. ReferenceId ${referenceId} is already completed.`);
        }
      }

      const wallets = await tx.$queryRawUnsafe<any[]>(
        `SELECT * FROM "Wallet" WHERE id = $1 FOR UPDATE`,
        walletId
      );
      const wallet = wallets[0];

      if (!wallet || new Decimal(wallet.balance).lessThan(amount)) {
        throw new Error('Insufficient balance');
      }

      const updatedWallet = await tx.wallet.update({
        where: { id: walletId },
        data: { balance: { decrement: amount } }
      });

      await tx.walletTransaction.create({
        data: {
          walletId,
          tenantId: wallet.tenantId,
          amount,
          type: TransactionType.DEBIT,
          status: TransactionStatus.COMPLETED,
          description: description || `Direct debit for order ${referenceId}`,
          referenceId,
          metadata: { action: 'ATOMIC_DEBIT' }
        }
      });

      return updatedWallet;
    });
  },

  /**
   * Performs an ATOMIC DIRECT CREDIT. Bypasses the pending state and instantly credits.
   */
  async atomicCredit(walletId: string, amount: number, referenceId: string, description?: string) {
    if (typeof process === 'undefined' || !process.env.DATABASE_URL) {
      throw new Error('Database connection (DATABASE_URL) not configured. Cannot perform stateful transactions.');
    }
    return prisma.$transaction(async (tx) => {
      if (referenceId) {
        const dupTx = await tx.walletTransaction.findFirst({
          where: { walletId, referenceId, status: TransactionStatus.COMPLETED }
        });
        if (dupTx) {
          throw new Error(`Duplicate deposit blocked. ReferenceId ${referenceId} is already completed.`);
        }
      }

      const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
      if (!wallet) throw new Error('Wallet not found');

      const updatedWallet = await tx.wallet.update({
        where: { id: walletId },
        data: { balance: { increment: amount } }
      });

      await tx.walletTransaction.create({
        data: {
          walletId,
          tenantId: wallet.tenantId,
          amount,
          type: TransactionType.CREDIT,
          status: TransactionStatus.COMPLETED,
          description: description || `Direct credit for request ${referenceId}`,
          referenceId,
          metadata: { action: 'ATOMIC_CREDIT' }
        }
      });

      return updatedWallet;
    });
  },

  /**
   * Distributes balance from Agency to Reseller.
   * Uses dual-entry ledger logic for audit trail.
   */
  async distributeBalance(fromWalletId: string, toWalletId: string, amount: number, description: string) {
    if (typeof process === 'undefined' || !process.env.DATABASE_URL) {
      throw new Error('Database connection (DATABASE_URL) not configured. Balance distribution disabled.');
    }
    return prisma.$transaction(async (tx) => {
      // 1. Lock BOTH source and destination to prevent deadlocks and ensure consistency
      // Rule: Always lock in a sorted order by ID to prevent circular dependencies (deadlocks)
      const ids = [fromWalletId, toWalletId].sort();
      await tx.$queryRawUnsafe(
        `SELECT id FROM "Wallet" WHERE id = $1 OR id = $2 FOR UPDATE`,
        ids[0], ids[1]
      );
      
      const source = await tx.wallet.findUnique({ where: { id: fromWalletId } });
      if (!source || new Decimal(source.balance).lessThan(amount)) {
        throw new Error('Source wallet has insufficient funds');
      }

      await tx.wallet.update({
        where: { id: fromWalletId },
        data: { balance: { decrement: amount } }
      });

      await tx.walletTransaction.create({
        data: {
          walletId: fromWalletId,
          tenantId: source.tenantId,
          amount,
          type: TransactionType.DEBIT,
          status: TransactionStatus.COMPLETED,
          description: `Distribution to ${toWalletId}: ${description}`,
          metadata: { transferTo: toWalletId }
        }
      });

      // 2. Credit Destination
      const dest = await tx.wallet.findUnique({ where: { id: toWalletId } });
      if (!dest) throw new Error('Destination wallet not found');

      await tx.wallet.update({
        where: { id: toWalletId },
        data: { balance: { increment: amount } }
      });

      await tx.walletTransaction.create({
        data: {
          walletId: toWalletId,
          tenantId: dest.tenantId,
          amount,
          type: TransactionType.CREDIT,
          status: TransactionStatus.COMPLETED,
          description: `Distribution from ${fromWalletId}: ${description}`,
          metadata: { transferFrom: fromWalletId }
        }
      });
    });
  },

  /**
   * Records a pending deposit request.
   */
  async requestDeposit(walletId: string, amount: number, referenceId: string) {
    return prisma.$transaction(async (tx) => {
      // Prevent duplicate deposit processing (double-deposit protection)
      if (referenceId) {
        const dupTx = await tx.walletTransaction.findFirst({
          where: { walletId, referenceId, status: TransactionStatus.COMPLETED }
        });
        if (dupTx) {
          throw new Error(`Duplicate deposit blocked. ReferenceId ${referenceId} is already completed.`);
        }
      }

      const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
      if (!wallet) throw new Error('Wallet not found');

      PaymentAuditLogger.onIntentStarted(wallet.ownerId, wallet.tenantId, amount, referenceId);

      await tx.wallet.update({
        where: { id: walletId },
        data: { pendingBalance: { increment: amount } }
      });

      return tx.walletTransaction.create({
        data: {
          walletId,
          tenantId: wallet.tenantId,
          amount,
          type: TransactionType.CREDIT,
          status: TransactionStatus.PENDING,
          description: `Pending deposit request: ${referenceId}`,
          referenceId,
          metadata: { action: 'DEPOSIT_REQUEST' }
        }
      });
    });
  },

  /**
   * Approves a pending deposit.
   */
  async approveDeposit(transactionId: string) {
    return prisma.$transaction(async (tx) => {
      const transaction = await tx.walletTransaction.findUnique({
        where: { id: transactionId }
      });

      if (!transaction || transaction.status !== TransactionStatus.PENDING) {
        throw new Error('Invalid transaction status');
      }

      const walletBefore = await tx.wallet.findUnique({ where: { id: transaction.walletId } });
      const balanceBefore = walletBefore ? Number(walletBefore.balance) : 0;

      const updatedWallet = await tx.wallet.update({
        where: { id: transaction.walletId },
        data: {
          pendingBalance: { decrement: transaction.amount },
          balance: { increment: transaction.amount }
        }
      });

      const balanceAfter = updatedWallet ? Number(updatedWallet.balance) : balanceBefore + Number(transaction.amount);
      PaymentAuditLogger.onDepositCredited(transaction.walletId, Number(transaction.amount), balanceBefore, balanceAfter);

      return tx.walletTransaction.update({
        where: { id: transactionId },
        data: { status: TransactionStatus.COMPLETED }
      });
    });
  }
};
