import { BaseAdapter } from './BaseAdapter';
import { 
  SupplierResponse, 
  SupplierBalance, 
  SupplierOrderResult, 
  SupplierStatus,
  Decimal
} from '../types';

export class SupplierAAdapter extends BaseAdapter {
  name = 'SupplierA';

  async syncBalance(): Promise<SupplierResponse<SupplierBalance>> {
    return this.withRetry(async () => {
      // Simulate API call
      console.log(`[${this.name}] Fetching balance for ${this.config.apiKey.substring(0, 5)}...`);
      return {
        success: true,
        data: {
          amount: new Decimal('1500000.00'),
          currency: 'IDR'
        }
      };
    });
  }

  async createOrder(params: {
    productCode: string;
    target: string;
    quantity: number;
    amount: number;
    orderId: string;
  }): Promise<SupplierResponse<SupplierOrderResult>> {
    return this.withRetry(async () => {
      console.log(`[${this.name}] Placing order for ${params.productCode} to ${params.target}`);
      
      // Simulate potential failure for retry demonstration
      if (Math.random() < 0.1) throw new Error('Network Timeout');

      return {
        success: true,
        data: {
          supplierOrderId: `SA_${Math.random().toString(36).substring(7).toUpperCase()}`,
          status: SupplierStatus.PROCESSING,
          rawResponse: { message: 'Order received' }
        }
      };
    });
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
        { externalId: 'ML_100', name: 'Mobile Legends 100 Diamonds', category: 'Mobile Legends', type: 'Diamond', rate: 14000, status: 'ACTIVE' },
        { externalId: 'FF_140', name: 'Free Fire 140 Diamonds', category: 'Free Fire', type: 'Diamond', rate: 18500, status: 'ACTIVE' },
        { externalId: 'VAL_625', name: 'Valorant 625 Points', category: 'Valorant', type: 'Points', rate: 58000, status: 'ACTIVE' }
      ]
    };
  }
}
