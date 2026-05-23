import { SupplierFactory } from './supplierFactory';
import { SupplierStatus, SupplierResponse, SupplierOrderResult } from './types';
import { Order, Product, SupplierConnection } from '../../types';

export class OrderProcessor {
  /**
   * Attempts to fulfill an order using the primary supplier.
   * If primary fails and fallback exists, attempts fallback.
   */
  static async processOrder(params: {
    order: Order;
    product: Product;
    primaryConnection: SupplierConnection;
    fallbackConnection?: SupplierConnection;
  }): Promise<SupplierResponse<SupplierOrderResult>> {
    console.log(`[OrderProcessor] Initializing order ${params.order.id} for product ${params.product.name}`);

    // Try Primary with built-in retries (if adapter supports it)
    const primaryResult = await this.executeOrder(params.primaryConnection, params.product, params.order);
    
    if (primaryResult.success && primaryResult.data) {
      return primaryResult;
    }

    // Explicit fallback to another supplier if primary failed permanently
    if (params.fallbackConnection) {
      console.warn(`[OrderProcessor] Primary supplier ${params.primaryConnection.supplierName} failed. Attempting fallback...`);
      const fallbackResult = await this.executeOrder(params.fallbackConnection, params.product, params.order);
      
      if (fallbackResult.success) {
        console.info(`[OrderProcessor] Fallback successful using ${params.fallbackConnection.supplierName}`);
        return fallbackResult;
      }
    }

    return primaryResult;
  }

  private static async executeOrder(connection: SupplierConnection, product: Product, order: Order): Promise<SupplierResponse<SupplierOrderResult>> {
    try {
      const adapter = SupplierFactory.getAdapter(connection.supplierName, {
        apiKey: connection.apiKey,
        secretKey: connection.secretKey,
        username: connection.accessToken // used by Digiflazz usually
      });

      // The adapter itself handles internal retries (e.g., SupplierA does 3 attempts)
      const response = await adapter.createOrder({
        productCode: product.productCode,
        target: order.targetUrl || '',
        quantity: order.quantity || 1,
        amount: order.totalCost || 0,
        orderId: order.id
      });

      return response;
    } catch (err: any) {
      console.error(`[OrderProcessor] Execution error on ${connection.supplierName}:`, err.message);
      return { success: false, error: err.message || 'Unknown Supplier Error' };
    }
  }
}
