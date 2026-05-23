import { BaseAdapter } from './BaseAdapter';
import { 
  SupplierResponse, 
  SupplierBalance, 
  SupplierOrderResult, 
  SupplierStatus,
  Decimal
} from '../types';

export class SupplierBAdapter extends BaseAdapter {
  name = 'SupplierB';

  async syncBalance(): Promise<SupplierResponse<SupplierBalance>> {
    return {
      success: true,
      data: {
        amount: new Decimal('2500000.00'),
        currency: 'IDR'
      }
    };
  }

  async createOrder(params: any): Promise<SupplierResponse<SupplierOrderResult>> {
    console.log(`[${this.name}] Processing premium order for ${params.productCode}`);
    return {
      success: true,
      data: {
        supplierOrderId: `SB_${Date.now()}`,
        status: SupplierStatus.PENDING,
        rawResponse: { priority: 'high' }
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
        { externalId: 'GEN_50', name: 'Genshin 50 Genesis', category: 'Genshin Impact', type: 'Genesis', rate: 12500, status: 'ACTIVE' },
        { externalId: 'GEN_300', name: 'Genshin 300 Genesis', category: 'Genshin Impact', type: 'Genesis', rate: 75000, status: 'ACTIVE' }
      ]
    };
  }
}
