import { 
  ISupplierAdapter, 
  SupplierResponse, 
  SupplierBalance, 
  SupplierOrderResult, 
  SupplierStatus 
} from '../types';

export abstract class BaseAdapter implements ISupplierAdapter {
  abstract name: string;
  protected config: any;

  constructor(config: any) {
    this.config = config;
  }

  abstract syncBalance(): Promise<SupplierResponse<SupplierBalance>>;
  
  abstract createOrder(params: {
    productCode: string;
    target: string;
    quantity: number;
    amount: number;
    orderId: string;
  }): Promise<SupplierResponse<SupplierOrderResult>>;

  abstract checkStatus(supplierOrderId: string, internalOrderId: string): Promise<SupplierResponse<SupplierStatus>>;

  abstract getProducts(): Promise<SupplierResponse<any[]>>;

  async validateCredentials(config: any): Promise<{ isValid: boolean; message?: string }> {
    // In demo/mock mode, we bypass credential validation
    if (config.isMock || !config.apiKey) {
      console.warn(`[${this.name}] Warning: Initializing with mock/empty credentials`);
      return { isValid: true };
    }
    return { isValid: true };
  }

  /**
   * Universal retry wrapper with exponential backoff
   */
  protected async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        const delay = initialDelay * Math.pow(2, attempt);
        console.warn(`[${this.name}] Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }
}
