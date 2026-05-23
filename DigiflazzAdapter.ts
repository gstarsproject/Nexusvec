import { BaseAdapter } from './BaseAdapter';
import { SupplierResponse, SupplierBalance, SupplierOrderResult, SupplierStatus, Decimal } from '../types';
import crypto from 'crypto';

export class DigiflazzAdapter extends BaseAdapter {
  name = 'DIGIFLAZZ';
  private baseUrl: string;
  private username: string;
  private apiKey: string;

  constructor(config: { username: string; apiKey: string; baseUrl?: string }) {
    super(config);
    this.username = config.username;
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.digiflazz.com/v1';
  }

  private generateSignature(suffix: string): string {
    return crypto
      .createHash('md5')
      .update(this.username + this.apiKey + suffix)
      .digest('hex');
  }

  async syncBalance(): Promise<SupplierResponse<SupplierBalance>> {
    return this.withRetry(async () => {
      const response = await fetch(`${this.baseUrl}/cek-saldo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: this.username,
          sign: this.generateSignature('depo')
        })
      });

      const result = await response.json();
      
      if (result.data && result.data.rc === '00') {
        return {
          success: true,
          data: { amount: new Decimal(result.data.deposit), currency: 'IDR' }
        };
      }

      throw new Error(result.data?.message || 'Failed to sync balance');
    });
  }

  async createOrder(params: {
    productCode: string;
    target: string;
    orderId: string;
  }): Promise<SupplierResponse<SupplierOrderResult>> {
    return this.withRetry(async () => {
      const response = await fetch(`${this.baseUrl}/transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: this.username,
          buyer_sku_code: params.productCode,
          customer_no: params.target,
          ref_id: params.orderId,
          sign: this.generateSignature(params.orderId)
        })
      });

      const result = await response.json();
      const statusMap: Record<string, SupplierStatus> = {
        'Pending': SupplierStatus.PENDING,
        'Sukses': SupplierStatus.COMPLETED,
        'Gagal': SupplierStatus.FAILED
      };

      if (result.data) {
        return {
          success: true,
          data: {
            supplierOrderId: result.data.trx_id || `DF-${params.orderId}`,
            status: statusMap[result.data.status] || SupplierStatus.PENDING,
            sn: result.data.sn,
            rawResponse: result.data
          }
        };
      }

      throw new Error(result.data?.message || 'Order request failed');
    });
  }

  async checkStatus(supplierOrderId: string, internalOrderId: string): Promise<SupplierResponse<SupplierStatus>> {
    const response = await fetch(`${this.baseUrl}/transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: this.username,
        buyer_sku_code: 'status', // Special code for status check in some versions or reuse ref_id
        customer_no: 'status',
        ref_id: internalOrderId,
        sign: this.generateSignature(internalOrderId)
      })
    });

    const result = await response.json();
    if (result.data) {
      if (result.data.status === 'Sukses') return { success: true, data: SupplierStatus.COMPLETED };
      if (result.data.status === 'Gagal') return { success: true, data: SupplierStatus.FAILED };
      return { success: true, data: SupplierStatus.PROCESSING };
    }
    return { success: false, error: 'Status check failed' } as any;
  }

  async getProducts(): Promise<SupplierResponse<any[]>> {
    return this.withRetry(async () => {
      const response = await fetch(`${this.baseUrl}/price-list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: this.username,
          sign: this.generateSignature('pricelist')
        })
      });

      const result = await response.json();
      if (result.data) {
        return { success: true, data: result.data };
      }
      throw new Error(result.data?.message || 'Failed to fetch price list');
    });
  }
}
