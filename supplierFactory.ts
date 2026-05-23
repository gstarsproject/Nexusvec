import { ISupplierAdapter } from './types';
import { DigiflazzAdapter } from './adapters/DigiflazzAdapter';
import { SupplierAAdapter } from './adapters/SupplierAAdapter';
import { SupplierBAdapter } from './adapters/SupplierBAdapter';
import { SupplierCAdapter } from './adapters/SupplierCAdapter';
import { EnterpriseAdapter } from './adapters/EnterpriseAdapter';

export class SupplierFactory {
  private static instances: Map<string, ISupplierAdapter> = new Map();

  static getAdapter(type: string, config: any): ISupplierAdapter {
    const apiKey = config.apiKey || config.username || 'NO_KEY';
    const key = `${type}-${apiKey.substring(0, 5)}`;
    
    if (this.instances.has(key)) {
      return this.instances.get(key)!;
    }

    // Explicitly mark as mock if key is missing
    if (apiKey === 'NO_KEY') {
      config.isMock = true;
    }

    let adapter: ISupplierAdapter;

    switch (type.toUpperCase()) {
      case 'DIGIFLAZZ':
        adapter = new DigiflazzAdapter(config);
        break;
      case 'SUPPLIER_A':
      case 'SUPPLIERA':
        adapter = new SupplierAAdapter(config);
        break;
      case 'SUPPLIER_B':
      case 'SUPPLIERB':
        adapter = new SupplierBAdapter(config);
        break;
      case 'SUPPLIER_C':
      case 'SUPPLIERC':
        adapter = new SupplierCAdapter(config);
        break;
      case 'ENTERPRISE':
        adapter = new EnterpriseAdapter(config);
        break;
      default:
        throw new Error(`Supplier type ${type} not supported`);
    }

    this.instances.set(key, adapter);
    return adapter;
  }
}
