import { ISupplierAdapter, SupplierValidationResult } from '../ISupplierAdapter';
import { SupplierConnection } from '../../../types/index';

export class MockSupplierAdapter implements ISupplierAdapter {
  id = 'mock-supplier';
  name = 'Mock Global Supplier';

  async validateCredentials(credentials: Partial<SupplierConnection>): Promise<SupplierValidationResult> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    if (credentials.apiKey === 'error') {
      return { isValid: false, message: 'Invalid API Key provided by Mock Supplier.' };
    }

    if (!credentials.apiKey || !credentials.resellerId) {
      return { isValid: false, message: 'API Key and Reseller ID are required.' };
    }

    return { 
      isValid: true, 
      message: 'Connection established successfully.',
      metadata: { balance: 5000, region: 'Global' }
    };
  }

  async syncData(connection: SupplierConnection): Promise<void> {
    console.log(`Syncing data for ${connection.supplierName}...`);
    // Mock sync logic
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  async getProducts(connection: SupplierConnection): Promise<any[]> {
    console.log(`Fetching products from ${connection.supplierName}...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return [
      {
        externalId: '1001',
        name: 'High Quality Instagram Followers',
        category: 'Instagram',
        type: 'Default',
        rate: 0.15,
        min: 100,
        max: 50000,
        description: 'Real active followers from worldwide.'
      },
      {
        externalId: '2005',
        name: 'TikTok Video Views (Instant)',
        category: 'TikTok',
        type: 'Default',
        rate: 0.02,
        min: 500,
        max: 1000000,
        description: 'Instant delivery for TikTok videos.'
      },
      {
        externalId: '3042',
        name: 'Twitter/X Retweets',
        category: 'Twitter',
        type: 'Default',
        rate: 1.20,
        min: 10,
        max: 5000,
        description: 'High quality retweets with high retention.'
      }
    ];
  }

  async placeOrder(connection: SupplierConnection, product: any, quantity: number, targetUrl: string): Promise<{ externalOrderId: string }> {
    console.log(`Placing order for ${product.name} to ${connection.supplierName}...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      externalOrderId: `MOCK_ORD_${Math.random().toString(36).substring(7).toUpperCase()}`
    };
  }
}
