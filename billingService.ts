import { Transaction } from '../../types';

export class BillingService {

  static async getPendingDeposits(tenantId: string): Promise<any[]> {
    try {
      const res = await fetch(`/api/transactions?agencyId=${tenantId}`);
      if (!res.ok) throw new Error("Failed to fetch pending deposits");
      const txs = await res.json();
      return txs.filter((t: any) => t.status === 'PENDING' && t.type === 'CREDIT');
    } catch (err) {
      console.error("getPendingDeposits error:", err);
      return [];
    }
  }

  static async approveDeposit(tx: any) {
    try {
      const res = await fetch('/api/wallet/credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resellerId: tx.resellerId,
          amount: tx.amount,
          description: `Sandbox Approved: ${tx.description || 'Deposit'}`,
          paymentMethod: tx.paymentMethod
        })
      });
      if (!res.ok) throw new Error("Approval failed");
    } catch (err) {
      console.error("approveDeposit error:", err);
    }
  }

  static async rejectDeposit(id: string) {
    try {
      const res = await fetch(`/api/wallet/debit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resellerId: id,
          amount: 0,
          description: "Cancelled Deposit"
        })
      });
    } catch (err) {
      console.error("rejectDeposit error:", err);
    }
  }

  static async requestDeposit(params: {
    resellerId: string;
    agencyId: string;
    amount: number;
    paymentMethod: string;
    autoApprove?: boolean;
  }) {
    try {
      if (params.autoApprove) {
        const res = await fetch('/api/wallet/credit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resellerId: params.resellerId,
            amount: params.amount,
            description: `Instant Capital Deposit via ${params.paymentMethod} (Sandbox Approved)`,
            paymentMethod: params.paymentMethod
          })
        });
        return res.ok;
      }

      const res = await fetch('/api/topup/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: params.amount,
          resellerId: params.resellerId,
          agencyId: params.agencyId
        })
      });
      return res.ok;
    } catch (err) {
      console.error("requestDeposit error:", err);
      return false;
    }
  }

  static async debitReseller(params: {
    resellerId: string;
    amount: number;
    description: string;
    agencyId: string;
    orderId?: string;
  }) {
    try {
      const res = await fetch('/api/wallet/debit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resellerId: params.resellerId,
          amount: params.amount,
          description: params.description
        })
      });
      return await res.json();
    } catch (err) {
      console.error("debitReseller error:", err);
      return { success: false };
    }
  }

  static async creditReseller(params: {
    resellerId: string;
    amount: number;
    description: string;
    agencyId: string;
    orderId?: string;
  }) {
    try {
      const res = await fetch('/api/wallet/credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resellerId: params.resellerId,
          amount: params.amount,
          description: params.description
        })
      });
      return await res.json();
    } catch (err) {
      console.error("creditReseller error:", err);
      return { success: false };
    }
  }
}
