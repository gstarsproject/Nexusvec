import { ISupplierAdapter } from './ISupplierAdapter';
import { MockSupplierAdapter } from './instances/MockSupplierAdapter';
import { DigiflazzAdapter } from './instances/DigiflazzAdapter';
import { SupplierAAdapter } from './instances/SupplierAAdapter';
import { SupplierBAdapter } from './instances/SupplierBAdapter';
import { SupplierCAdapter } from './instances/SupplierCAdapter';

class SupplierRegistry {
  private adapters: Map<string, ISupplierAdapter> = new Map();

  constructor() {
    this.register(new MockSupplierAdapter());
    this.register(new DigiflazzAdapter());
    this.register(new SupplierAAdapter());
    this.register(new SupplierBAdapter());
    this.register(new SupplierCAdapter());
    // Register other suppliers here
  }

  register(adapter: ISupplierAdapter) {
    this.adapters.set(adapter.id, adapter);
  }

  getAdapter(id: string): ISupplierAdapter | undefined {
    return this.adapters.get(id);
  }

  getAllAdapters(): ISupplierAdapter[] {
    return Array.from(this.adapters.values());
  }
}

export const supplierRegistry = new SupplierRegistry();
