import { ISupplierAdapter, SupplierValidationResult } from '../ISupplierAdapter';
import { SupplierConnection } from '../../../types/index';

export class SupplierAAdapter implements ISupplierAdapter {
  id = 'supplier-a';
  name = 'SupplierA Alpha Node';

  async validateCredentials(credentials: Partial<SupplierConnection>): Promise<SupplierValidationResult> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));

    // Mock credentials check
    if (credentials.apiKey === 'SUPPLY_DEMO_KEY') {
      return { 
        isValid: true, 
        message: 'Mock authentication successful.',
        metadata: { region: 'US-EAST' } 
      };
    }

    if (!credentials.apiKey) {
      return { isValid: false, message: 'SupplierA requires an API Key.' };
    }

    return { 
      isValid: true, 
      message: 'Connection established.',
      metadata: { region: 'AUTO-SELECT' }
    };
  }

  async syncData(connection: SupplierConnection): Promise<void> {
    console.log(`[SupplierA] Syncing clusters...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async getProducts(connection: SupplierConnection): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        externalId: 'SA_ML_50',
        name: 'Mobile Legends 50 Diamonds',
        category: 'Mobile Legends',
        type: 'Diamond',
        rate: 7000,
        min: 1,
        max: 10,
        description: 'Quick top-up for Mobile Legends'
      },
      {
        externalId: 'SA_FF_70',
        name: 'Free Fire 70 Diamonds',
        category: 'Free Fire',
        type: 'Diamond',
        rate: 9000,
        min: 1,
        max: 10,
        description: 'Instant Free Fire diamonds'
      }
    ];
  }

  async placeOrder(connection: SupplierConnection, product: any, quantity: number, targetUrl: string): Promise<{ externalOrderId: string }> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      externalOrderId: `SA_TX_${Math.random().toString(36).substring(7).toUpperCase()}`
    };
  }
}
