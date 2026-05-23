import { ISupplierAdapter, SupplierValidationResult } from '../ISupplierAdapter';
import { SupplierConnection } from '../../../types/index';

export class SupplierBAdapter implements ISupplierAdapter {
  id = 'supplier-b';
  name = 'SupplierB Global Nexus';

  async validateCredentials(credentials: Partial<SupplierConnection>): Promise<SupplierValidationResult> {
    await new Promise(resolve => setTimeout(resolve, 800));

    if (credentials.apiKey === 'SUPPLY_DEMO_B_KEY') {
      return { 
        isValid: true, 
        message: 'Enterprise-grade credential verification success.',
        metadata: { region: 'EU-WEST', tier: 'PRIVATE_POOL' } 
      };
    }

    return { 
      isValid: true, 
      message: 'Node synchronized with global distributor.',
      metadata: { region: 'AUTO-SCALE' }
    };
  }

  async syncData(connection: SupplierConnection): Promise<void> {
    console.log(`[SupplierB] Synchronizing resource pool v4.2...`);
    await new Promise(resolve => setTimeout(resolve, 1200));
  }

  async getProducts(connection: SupplierConnection): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return [
      {
        externalId: 'SB_VAL_100',
        name: 'Valorant 100 Points (EU)',
        category: 'Valorant',
        type: 'Point',
        rate: 15000,
        min: 1,
        max: 50,
        description: 'Direct distribution for Valorant Points'
      },
      {
        externalId: 'SB_PUBGM_UC_60',
        name: 'PUBG Mobile 60 UC',
        category: 'PUBG Mobile',
        type: 'Currency',
        rate: 12000,
        min: 1,
        max: 100,
        description: 'Tier-1 global UC supply channel'
      }
    ];
  }

  async placeOrder(connection: SupplierConnection, product: any, quantity: number, targetUrl: string): Promise<{ externalOrderId: string }> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      externalOrderId: `SB_DIST_TX_${Math.random().toString(36).substring(7).toUpperCase()}`
    };
  }
}
