import { SupplierConnection } from '../../types/index';

export interface SupplierValidationResult {
  isValid: boolean;
  message?: string;
  metadata?: any;
}

export interface ISupplierAdapter {
  id: string;
  name: string;
  validateCredentials(credentials: Partial<SupplierConnection>): Promise<SupplierValidationResult>;
  syncData(connection: SupplierConnection): Promise<any>;
  getProducts?(connection: SupplierConnection): Promise<any[]>;
  placeOrder?(connection: SupplierConnection, product: any, quantity: number, targetUrl: string): Promise<{ externalOrderId: string }>;
}
