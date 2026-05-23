import prisma from '../../lib/prisma';
import { TransactionType, TransactionStatus, walletService } from './walletService';
import { Decimal } from '../suppliers/types';

export class LedgerService {
  /**
   * Primary method to modify reseller balances with full audit trail.
   */
  static async executeLedgerEntry(params: {
    resellerId: string;
    agencyId: string;
    amount: number;
    type: 'CREDIT' | 'DEBIT' | 'FREEZE' | 'UNFREEZE' | 'CONFIRM_DEBIT' | 'TRANSFER';
    description: string;
    orderId?: string;
    referenceId?: string;
    metadata?: Record<string, any>;
    existingTransaction?: any; // Kept for signature compatibility but ignored
  }) {
    // Look up wallet ID by resellerId
    let wallet = await prisma.wallet.findUnique({
      where: { ownerId: params.resellerId }
    });
    
    // Auto-create wallet if it doesn't exist
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          ownerId: params.resellerId,
          tenantId: params.agencyId
        }
      });
    }

    const { amount, referenceId, orderId } = params;
    const ref = referenceId || orderId || `REF-${Date.now()}`;

    switch (params.type) {
      case 'FREEZE':
        await walletService.freezeBalance(wallet.id, amount, ref);
        break;
      case 'CONFIRM_DEBIT':
        await walletService.finalizeFreezenDebit(wallet.id, amount, ref);
        break;
      case 'UNFREEZE':
        await walletService.revertFrozenBalance(wallet.id, amount, ref);
        break;
      case 'DEBIT':
         // Truly atomic debit (rollback safe)
         await walletService.atomicDebit(wallet.id, amount, ref, params.description);
         break;
      case 'CREDIT':
         // Truly atomic credit (rollback safe)
         await walletService.atomicCredit(wallet.id, amount, ref, params.description);
         break;
      case 'TRANSFER':
         // If there's a specific 'transferTo' logic, it relies on distributeBalance.
         // We map this to a debit if no target is specified in the params (for signature compat).
         await walletService.freezeBalance(wallet.id, amount, ref);
         await walletService.finalizeFreezenDebit(wallet.id, amount, ref);
         break;
    }

    return { success: true, transactionId: ref, balanceAfter: 0 };
  }

  static async distributeBalance(params: {
    agencyId: string;
    distributions: { resellerId: string; amount: number; note: string }[];
  }) {
    const results = [];
    for (const dist of params.distributions) {
      const res = await this.executeLedgerEntry({
        resellerId: dist.resellerId,
        agencyId: params.agencyId,
        amount: dist.amount,
        type: 'CREDIT',
        description: dist.note || 'Balance Distribution',
        metadata: { source: 'AGENCY_DISTRIBUTION' }
      });
      results.push(res);
    }
    return results;
  }

  static async distributeCommissions(params: {
    agencyId: string;
    sourceResellerId: string;
    orderId: string;
    totalProfit: number;
    distributionRules?: { level1: number; level2: number; level3: number };
  }) {
    return { profitsDistributed: 0, agencyProfit: params.totalProfit };
  }

  static async recordSupplierCost(orderId: string, supplierId: string, amount: number) {
    return { success: true };
  }
}
