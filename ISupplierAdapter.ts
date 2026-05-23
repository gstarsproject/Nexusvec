export interface ProviderResponse<T = any> {
  success: boolean;
  data?: T;
  providerCode?: string;
  providerMessage?: string;
  originalPayload?: any;
}

export interface ISupplierAdapter {
  providerName: string;
  checkBalance(): Promise<ProviderResponse<{ balance: number }>>;
  fetchCatalog(): Promise<ProviderResponse<any[]>>;
  placeOrder(sku: string, target: string, refId: string): Promise<ProviderResponse<{ 
    status: 'SUCCESS' | 'PENDING' | 'FAILED',
    providerRef: string,
    sn?: string 
  }>>;
  checkOrderStatus(refId: string): Promise<ProviderResponse<{ 
    status: 'SUCCESS' | 'PENDING' | 'FAILED',
    providerRef: string,
    sn?: string 
  }>>;
}
