import React from 'react';
import { ProductCatalog } from '../modules/products/ProductCatalog';
import { OrderHistory } from '../modules/orders/OrderHistory';

export const ServicesPage = () => {
  return (
    <div className="max-w-7xl mx-auto py-6 space-y-12">
      <div className="mb-0">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-4">
          Service Registry
          <span className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 font-bold uppercase tracking-wider">
            Operational
          </span>
        </h1>
        <p className="text-sm text-slate-400 mt-2 font-medium">
          Unified distribution gateway and active market instruments.
        </p>
      </div>

      <section>
        <ProductCatalog />
      </section>

      <section className="pt-12 border-t border-white/[0.04]">
        <OrderHistory />
      </section>
    </div>
  );
};
