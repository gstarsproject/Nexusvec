import React, { useState } from 'react';
import { Terminal, Copy, Check, Code, Globe, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../utils/cn';

export const DeveloperSnippets = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'curl' | 'nodejs' | 'python'>('curl');

  const snippets = {
    curl: `curl -X POST https://api.nexuscore.io/v1/orders \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "product_id": "SKU-9921",
    "target": "81234567890",
    "quantity": 1,
    "reference_id": "ORD-12345"
  }'`,
    nodejs: `const response = await fetch('https://api.nexuscore.io/v1/orders', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    product_id: 'SKU-9921',
    target: '81234567890',
    quantity: 1,
    reference_id: 'ORD-12345'
  })
});

const data = await response.json();`,
    python: `import requests

url = "https://api.nexuscore.io/v1/orders"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "product_id": "SKU-9921",
    "target": "81234567890",
    "quantity": 1,
    "reference_id": "ORD-12345"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-500">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-display font-bold text-white tracking-tight">Developer Bridge</h3>
            <p className="text-xs text-slate-500 font-bold tracking-tight mt-0.5">Order Prototyping & API Integration</p>
          </div>
        </div>
        <div className="flex bg-slate-950 rounded-lg p-1 border border-white/[0.04]">
          {(['curl', 'nodejs', 'python'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] rounded transition-all",
                activeTab === tab ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-400"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="relative group">
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={copyToClipboard}
            className="p-2 bg-slate-950 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-all backdrop-blur-md"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <div className="bg-slate-900 border border-white/[0.04] rounded-2xl overflow-hidden font-mono text-[11px] leading-relaxed">
          <div className="bg-slate-950 px-4 py-2 border-b border-white/[0.04] flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20" />
            </div>
            <span className="text-slate-500 tracking-tight text-xs font-bold ml-2">POST_CREATE_ORDER</span>
          </div>
          <pre className="p-6 text-slate-400 overflow-x-auto">
            <code>{snippets[activeTab]}</code>
          </pre>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="premium-card bg-slate-900/40 p-6 border-none">
          <h4 className="text-xs font-bold text-slate-400 tracking-tight mb-4 flex items-center gap-2">
            <Code className="w-3 h-3 text-blue-500" />
            Request Parameters
          </h4>
          <div className="space-y-4">
            <ParamItem name="product_id" type="string" desc="The unique SKU from the resource catalog" required />
            <ParamItem name="target" type="string" desc="Destination identifier (phone number, ID)" required />
            <ParamItem name="quantity" type="number" desc="Number of units to procure (Default: 1)" />
            <ParamItem name="reference_id" type="string" desc="Your internal transaction identifier" />
          </div>
        </div>

        <div className="premium-card bg-slate-900/40 p-6 border-none">
          <h4 className="text-xs font-bold text-slate-400 tracking-tight mb-4 flex items-center gap-2">
            <Shield className="w-3 h-3 text-emerald-500" />
            Response Interface
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
              <span className="text-[11px] font-mono text-slate-400">status</span>
              <span className="text-[11px] font-bold text-emerald-500 tracking-tight">"PENDING"</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
              <span className="text-[11px] font-mono text-slate-400">order_id</span>
              <span className="text-[11px] font-mono text-blue-400">"tx_7721-abc"</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
              <span className="text-[11px] font-mono text-slate-400">balance_after</span>
              <span className="text-[11px] font-mono text-white">$1,245.50</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
              <span className="text-[11px] font-mono text-slate-400">ledger_node</span>
              <span className="text-[11px] font-mono text-slate-500">primary-east-01</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ParamItem = ({ name, type, desc, required }: { name: string, type: string, desc: string, required?: boolean }) => (
  <div className="flex flex-col gap-1 py-1">
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-mono font-bold text-blue-400">{name}</span>
      <span className="text-xs text-slate-400 font-mono">[{type}]</span>
      {required && <span className="text-xs bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded uppercase font-semibold">Req</span>}
    </div>
    <p className="text-xs text-slate-500 font-medium">{desc}</p>
  </div>
);
