import { BaseAdapter } from './BaseAdapter';
import { 
  SupplierResponse, 
  SupplierBalance, 
  SupplierOrderResult, 
  SupplierStatus 
} from '../types';

export class EnterpriseAdapter extends BaseAdapter {
  name = 'Enterprise Bridge';

  async syncBalance(): Promise<SupplierResponse<SupplierBalance>> {
    return {
      success: true,
      data: {
        amount: 50000000,
        currency: 'IDR'
      }
    };
  }

  async createOrder(params: {
    productCode: string;
    target: string;
    quantity: number;
    amount: number;
    orderId: string;
  }): Promise<SupplierResponse<SupplierOrderResult>> {
    const { productCode, target, amount, orderId } = params;
    
    await new Promise(r => setTimeout(r, 800));

    return {
      success: true,
      data: {
        supplierOrderId: `ENT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        status: SupplierStatus.PENDING,
        rawResponse: { productCode, amount, target }
      }
    };
  }

  async checkStatus(supplierOrderId: string, internalOrderId: string): Promise<SupplierResponse<SupplierStatus>> {
    return {
      success: true,
      data: SupplierStatus.COMPLETED
    };
  }

  async getProducts(): Promise<SupplierResponse<any[]>> {
    return {
      success: true,
      data: []
    };
  }
}
