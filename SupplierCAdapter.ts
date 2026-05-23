import { BaseAdapter } from './BaseAdapter';
import { 
  SupplierResponse, 
  SupplierBalance, 
  SupplierOrderResult, 
  SupplierStatus,
  Decimal
} from '../types';

export class SupplierCAdapter extends BaseAdapter {
  name = 'SupplierC';

  async syncBalance(): Promise<SupplierResponse<SupplierBalance>> {
    return {
      success: true,
      data: {
        amount: new Decimal('500000.00'),
        currency: 'IDR'
      }
    };
  }

  async createOrder(params: any): Promise<SupplierResponse<SupplierOrderResult>> {
    console.log(`[${this.name}] Fallback order executing for ${params.orderId}`);
    return {
      success: true,
      data: {
        supplierOrderId: `SC_${Math.floor(Math.random() * 1000000)}`,
        status: SupplierStatus.PROCESSING,
        rawResponse: { mode: 'economy' }
      }
    };
  }

  async checkStatus(supplierOrderId: string): Promise<SupplierResponse<SupplierStatus>> {
    return {
      success: true,
      data: SupplierStatus.COMPLETED
    };
  }

  async getProducts(): Promise<SupplierResponse<any[]>> {
    return {
      success: true,
      data: [
        { externalId: 'ST_60', name: 'Steam Wallet $5', category: 'Steam', type: 'Wallet', rate: 82000, status: 'ACTIVE' },
        { externalId: 'ST_120', name: 'Steam Wallet $10', category: 'Steam', type: 'Wallet', rate: 164000, status: 'ACTIVE' }
      ]
    };
  }
}
