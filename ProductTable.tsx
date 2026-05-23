import React from 'react';
import { 
  Package, 
  Search, 
  Power, 
  PowerOff, 
  ExternalLink, 
  MoreVertical,
  Layers,
  Database,
  DollarSign
} from 'lucide-react';
import { Product } from '../../types';
import { cn } from '../../utils/cn';
import { format } from 'date-fns';

interface ProductTableProps {
  products: Product[];
  onToggle: (id: string, enabled: boolean) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({ products, onToggle }) => {
  return (
    <div className="overflow-x-auto rounded-[32px] border border-white/10 bg-slate-950/20 backdrop-blur-3xl shadow-2xl">
      <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr className="bg-slate-950/5 border-b border-white/10">
            <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 tracking-[0.2em]">Service_Ref</th>
            <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 tracking-[0.2em]">Network_Origin</th>
            <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 tracking-[0.2em]">Platform/Category</th>
            <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 tracking-[0.2em]">Base_Rate</th>
            <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 tracking-[0.2em]">Selling_Price</th>
            <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 tracking-[0.2em]">Node_Control</th>
            <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500 tracking-[0.2em] text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {products.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-20 text-center">
                <div className="flex flex-col items-center gap-4">
                  <Database className="w-12 h-12 text-slate-800" />
                  <div>
                    <h3 className="text-slate-400 font-semibold tracking-tight text-sm">System Empty</h3>
                    <p className="text-xs text-slate-400 font-mono">No localized service infrastructure detected.</p>
                  </div>
                </div>
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-950/5 transition-all group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center font-mono text-xs text-purple-400 font-bold group-hover:border-purple-500/50 transition-colors">
                      {product.productCode.slice(-3)}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white uppercase tracking-tight line-clamp-1">{product.name}</div>
                      <div className="text-xs font-mono text-slate-400 mt-0.5">UID: {product.id.slice(0, 12)}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 tracking-tight">{product.supplierName}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-semibold tracking-tight rounded border border-blue-500/20">
                      {product.appName}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs font-semibold tracking-tight rounded border border-white/[0.04]">
                      {product.category}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-1.5 font-mono">
                    <DollarSign className="w-3 h-3 text-slate-500" />
                    <span className="text-sm font-bold text-slate-400">{product.basePrice.toFixed(2)}</span>
                    <span className="text-xs text-slate-300">/1k</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 font-mono">
                      <DollarSign className="w-3 h-3 text-emerald-500" />
                      <span className="text-sm font-bold text-white">{(product.sellingPrice || product.basePrice).toFixed(2)}</span>
                      <span className="text-xs text-slate-400">/1k</span>
                    </div>
                    {product.marginValue && (
                      <div className="text-xs font-semibold text-emerald-500/80 tracking-tight bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10 w-fit">
                        +{product.marginValue}{product.marginType === 'PERCENTAGE' ? '%' : ' FIXED'} Profit
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <button 
                    onClick={() => onToggle(product.id, !product.isEnabled)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all border",
                      product.isEnabled 
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20" 
                        : "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20"
                    )}
                  >
                    {product.isEnabled ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
                    {product.isEnabled ? 'Active' : 'Disabled'}
                  </button>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="p-2 text-slate-500 hover:text-white hover:bg-slate-950/5 rounded-lg transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
