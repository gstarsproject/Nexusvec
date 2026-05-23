import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Layers, 
  Database, 
  Zap, 
  ShieldAlert, 
  GitBranch, 
  HardDrive, 
  Terminal, 
  Server, 
  Code,
  Network,
  Share2,
  Lock,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  FileCode,
  Settings,
  HelpCircle
} from 'lucide-react';

type TabId = 'overview' | 'microservices' | 'security' | 'expansion' | 'monetization' | 'frontend' | 'backend' | 'database' | 'messaging' | 'cloud';

export const TechnicalArchitecture = () => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [selectedSchema, setSelectedSchema] = useState<'ledger' | 'routing' | 'webhook'>('ledger');

  const tabs = [
    { id: 'overview', label: 'Architecture Overview', icon: Layers },
    { id: 'microservices', label: 'Monolith vs Microservices', icon: GitBranch },
    { id: 'security', label: 'Security Strategy', icon: Lock },
    { id: 'expansion', label: 'Post-MVP Expansion', icon: TrendingUp },
    { id: 'monetization', label: 'Monetization Framework', icon: Activity },
    { id: 'frontend', label: 'Frontend Stack', icon: Code },
    { id: 'backend', label: 'Backend Services', icon: Cpu },
    { id: 'database', label: 'Database & Storage', icon: Database },
    { id: 'messaging', label: 'Queues & Caching', icon: Zap },
    { id: 'cloud', label: 'Cloud & Infrastructure', icon: HardDrive },
  ] as const;

  const schemas = {
    ledger: `// White Label Multitenant Ledger Transaction (PostgreSQL DDL)
CREATE TABLE ledger_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    reseller_id UUID NOT NULL REFERENCES resellers(id) ON DELETE RESTRICT,
    account_id UUID NOT NULL REFERENCES reseller_wallets(id),
    
    amount NUMERIC(20, 8) NOT NULL, -- Fixed-precision balance allocation
    currency VARCHAR(10) DEFAULT 'IDR',
    direction VARCHAR(4) CHECK (direction IN ('DEBIT', 'CREDIT')) NOT NULL,
    transaction_type VARCHAR(30) CHECK (transaction_type IN ('TOPUP', 'PURCHASE', 'REFUND', 'REVENUE')) NOT NULL,
    
    reference_id VARCHAR(100) UNIQUE, -- Idem key to avert double-spending
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SETTLED', 'FAILED', 'ROLLED_BACK')) NOT NULL,
    
    metadata JSONB_NULL, -- Flexible routing details & callback payloads
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    settled_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT positive_transaction_amount CHECK (amount > 0)
);

CREATE INDEX idx_ledger_tenant ON ledger_transactions(tenant_id, status);
CREATE INDEX idx_ledger_reseller_ref ON ledger_transactions(reseller_id, reference_id);`,

    routing: `// Go Structure - Dynamic Supplier Routing & Abstraction Engine
package supplier

import (
	"context"
	"github.com/google/uuid"
)

type SupplierType string
const (
	Digiflazz   SupplierType = "digiflazz"
	VIPReseller SupplierType = "vip_reseller"
	Midtrans    SupplierType = "midtrans"
)

type Route struct {
	ID           uuid.UUID    \`json:"id"\`
	ProductID    string       \`json:"product_id"\`
	Supplier     SupplierType \`json:"supplier"\`
	CostPrice    float64      \`json:"cost_price"\`
	MarginMarkup float64      \`json:"margin_markup"\`
	UptimeScore  float64      \`json:"uptime_score"\`
	Priority     int          \`json:"priority"\`
	IsActive     bool         \`json:"is_active"\`
}

type Router interface {
	RouteAndDispatch(ctx context.Context, txID uuid.UUID, route Route, payload map[string]interface{}) (*DispatchResult, error)
	GetOptimalPath(ctx context.Context, productID string) (Route, error)
}`,

    webhook: `// Webhook Receiver & Backoff Retry System Queue Event
{
  "event_id": "evt_wh_78201",
  "tenant_id": "502b6f31-bcaf-4db4-a809-803156ec6d46",
  "payload": {
    "transaction_id": "tx_901124",
    "provider_reference": "DF-90118224",
    "sku": "MOBILE_LEGENDS_500_COINS",
    "status": "SUCCESS",
    "buyer_identity": "8291024",
    "reseller_margin": 1250.00
  },
  "retry_context": {
    "delivery_count": 2,
    "max_retries": 5,
    "backoff_multiplier": 1.5,
    "next_attempt_at": "2026-05-19T18:55:00Z"
  }
}`
  };

  return (
    <div className="bg-slate-950 border border-white/[0.04] rounded-[32px] overflow-hidden shadow-2xl relative">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-blue-900/10 via-slate-950/0 to-slate-950/0 pointer-events-none" />
      
      {/* Header section */}
      <div className="p-8 border-b border-white/[0.04] relative z-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full font-mono uppercase tracking-widest">
                System PRD & Architecture Specification
              </span>
            </div>
            <h2 className="text-2xl font-bold font-sans text-white tracking-tight mt-1">Enterprise-Grade Technical Blueprint</h2>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              Define the multi-tenant architecture, scalable database indexes, real-time transaction orchestration engine, 
              and supplier integration frameworks required for zero-downtime ledger operations of NexusCore.
            </p>
          </div>
          
          <div className="flex items-center gap-2.5 shrink-0 bg-slate-900 border border-white/[0.04] p-1.5 rounded-2xl">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">ARCHITECTURE_VERSION: 4.1.0</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto scrollbar-hide border-b border-white/[0.04] bg-slate-900/30 p-2 gap-1.5 relative z-10">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all shrink-0 border ${
                isActive 
                  ? 'bg-blue-600/15 border-blue-500/30 text-blue-400 shadow-md shadow-blue-500/5' 
                  : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Grid Content */}
      <div className="p-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Column 1 & 2: Structural description */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Executive System Blueprint</h3>
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                      NexusCore represents a highly resilient, enterprise-designed multi-tenant digital monetization platform. 
                      Crafted for millions of transactions per day, the infrastructure integrates a strict dual-entry ledger keeping system, 
                      real-time supplier gateway orchestration, dynamic markups, cache layers, and redundant cloud deployments.
                    </p>
                  </div>

                  {/* Interactive flow map representation */}
                  <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/[0.04]">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Transaction Orchestration Lifepath</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Gateway Roundtrip ~ 45ms</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
                      {[
                        { step: '01', title: 'Anycast DNS/Edge', desc: 'Secure Cloud Armor entry point' },
                        { step: '02', title: 'API Gateway', desc: 'JWT Verify, Tenant, Rate Limits' },
                        { step: '03', title: 'Ledger Engine', desc: 'Double-Entry ACID Verification' },
                        { step: '04', title: 'Supplier Bus', desc: 'Asynchronous Fulfillment' },
                        { step: '05', title: 'Direct API Webhook', desc: 'Idempotent Multi-retry Loop' },
                      ].map((item, id) => (
                        <div key={id} className="relative bg-slate-950 p-4 rounded-xl border border-white/[0.04] flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-slate-500 block mb-2">{item.step}.</span>
                            <p className="text-xs font-bold text-white tracking-tight mb-1">{item.title}</p>
                            <p className="text-[10px] text-slate-500 leading-normal">{item.desc}</p>
                          </div>
                          {id < 4 && (
                            <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 z-10" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Technical Highlights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/[0.04] space-y-3">
                      <ShieldAlert className="w-5 h-5 text-indigo-400" />
                      <h4 className="text-sm font-bold text-white tracking-tight">Tenant Isolation Protocols</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        Tenants operate on fully isolated database schemas or logically segregated PostgreSQL partitioning. 
                        Tenant secrets (APIs keys, Supplier credentials) are hardware-encrypted on the fly via 
                        KMS (Key Management Service) and HashiCorp Vault.
                      </p>
                    </div>

                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/[0.04] space-y-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <h4 className="text-sm font-bold text-white tracking-tight">Ledger Audits & Reconcile</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        Ledger tables enforce absolute dual-entry book-keeping. A scheduled asynchronous cron 
                        reconciliation routine runs every 10 minutes, matching external Supplier API responses 
                        against core database records to flag any mismatch instantly.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Column 3: Summary card specs */}
                <div className="space-y-6">
                  <div className="bg-slate-900 border border-white/[0.06] rounded-2xl p-6 space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Production Topology</h4>
                    
                    <div className="space-y-4 font-mono text-[11px] text-slate-400">
                      <div className="flex justify-between border-b border-white/[0.02] pb-2">
                        <span>API Standard</span>
                        <span className="text-white font-semibold">gRPC / REST JSON</span>
                      </div>
                      <div className="flex justify-between border-b border-white/[0.02] pb-2">
                        <span>Ledger Consistency</span>
                        <span className="text-emerald-400 font-semibold">Strict ACID</span>
                      </div>
                      <div className="flex justify-between border-b border-white/[0.02] pb-2">
                        <span>Latency Target</span>
                        <span className="text-white font-semibold">p99 &lt; 85ms</span>
                      </div>
                      <div className="flex justify-between border-b border-white/[0.02] pb-2">
                        <span>Availability</span>
                        <span className="text-blue-400 font-semibold">99.99% (Multi-Region)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Throughput Limit</span>
                        <span className="text-white font-semibold">50,000 req/sec</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/20 rounded-2xl p-6 space-y-3">
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest">CTO Architecture Assessment</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      "To power 100+ separate white-label platforms with sub-second topups, we run our catalog on in-memory Redis keys. 
                      All requests hit a lightweight, highly optimized API Gateway proxy which routes heavy business logic 
                      to scalable Node.js/TypeScript Pods while the financial updates bypass to high-performance Go-based microservices."
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/[0.08] flex items-center justify-center text-[10px] font-mono text-white font-bold uppercase">
                        CTO
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Adrian Winata</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Co-Founder & CTO</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MONOLITH VS MICROSERVICES TAB */}
            {activeTab === 'microservices' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white tracking-tight">Structured Monolith &rArr; Microservices Staging</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      As a startup, speed to market and cognitive load are massive considerations. A premature microservices architecture, 
                      introducing distributed network state, cross-service transactions, service-discovery tools, and multi-repository CI/CD, 
                      is a known startup killer.
                    </p>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      We architecture NexusCore as an <strong className="text-white">Isolate-Ready Modular Monolith</strong>. Inside our codebase, 
                      separate domains like <code className="text-blue-400 font-mono text-xs">Suppliers</code>, <code className="text-blue-400 font-mono text-xs">Ledger</code>, 
                      and <code className="text-blue-400 font-mono text-xs">Notifications</code> are fully segregated internally. 
                      They communicate via clean abstractions, making extraction to external services trivial when throughput warrants it.
                    </p>
                  </div>

                  <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/[0.04] flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Scalability Trigger Matrix</h4>
                      <div className="space-y-3.5">
                        {[
                          { service: 'Supplier API Dispatcher', type: 'I/O Bound', stack: 'NestJS / Node.js Cluster', trigger: 'External Supplier rate limits', action: 'Extract to microservice' },
                          { service: 'Ledger Engine / Wallets', type: 'CPU & DB Bound', stack: 'Golang / PostgreSQL Client', trigger: '&gt; 10,000 tx/s peak limit', action: 'Extract to isolated system' },
                          { service: 'Branding Storefront UI', type: 'Static Delivery', stack: 'Vite React CDN SPA / SSR Edge', trigger: 'Traffic spikes on campaign days', action: 'Edge cache deployment' }
                        ].map((m, idx) => (
                          <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-white/[0.02] text-xs space-y-1.5 font-mono">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-white">{m.service}</span>
                              <span className="p-0.5 px-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] rounded uppercase font-bold">{m.type}</span>
                            </div>
                            <p className="text-[10px] text-slate-500">Stack: {m.stack}</p>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <span className="text-amber-500 font-bold uppercase">&rArr; Trigger:</span> {m.trigger}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-2xl border border-white/[0.04]">
                  <div className="flex gap-4 items-center">
                    <span className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono text-xs font-bold shrink-0">RECOMMENDATION</span>
                    <p className="text-xs text-slate-300 leading-normal">
                      <strong>CTO Verdict:</strong> Keep the codebase in a modular monolithic state during early-stage scaling. Place particular emphasis on strict package boundaries in TypeScript/NestJS, and avoid database joins across domains. This maintains an extreme development speed while making horizontal scaling and future microservices partitioning frictionless.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY STRATEGY TAB */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left block - Secure Architecture */}
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">Enterprise Security Matrix</h3>
                      <p className="text-sm text-slate-400 mt-2 leading-relaxed font-sans">
                        NexusCore deploys a multi-dimensional strategy to protect the white-label coin reseller network. 
                        Every data-layer intersection, transaction lifecycle phase, and external API interface is guarded by strict, zero-trust protocols.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                      <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/[0.04] space-y-3">
                        <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Data Encryption Standards
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          <strong>In-Transit:</strong> Mandatory secure TLS 1.3 encryption on all public endpoints. Internal service channels leverage Mutual TLS (mTLS) for authenticated gRPC communication.
                        </p>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          <strong>At-Rest:</strong> Database storage is locked down with native AES-256 transparent encryption. Highly sensitive variables (like tenant supplier keys and webhook client secrets) are encrypted using dynamized envelope keys tied directly to Google Cloud KMS.
                        </p>
                      </div>

                      <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/[0.04] space-y-3">
                        <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Zero-Trust Web Protection
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          <strong>OWASP Security Controls:</strong> Absolute mitigation against OWASP Top 10 vulnerabilities. Dynamic JSON input validation prevents SQL/NoSQL injection payloads. Fully parameterized queries (via Prisma) represent our absolute default.
                        </p>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          <strong>Access Control Guards:</strong> Cross-tenant isolation is strictly verified on the network router level. Any transaction, product load, or user profile query evaluates the bound session identity to block ID spoofing.
                        </p>
                      </div>

                      <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/[0.04] space-y-3">
                        <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Secure Wallet Ledger Engine
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          All asset balance changes are processed through atomic database transactions. Read-write blocks lock down critical wallet rows to prevent race-condition exploits. An immutable, append-only ledger schema verifies every single top-up and debit.
                        </p>
                      </div>

                      <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/[0.04] space-y-3">
                        <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          External API Integration Guard
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          System API keys (e.g., <code className="text-blue-300 font-mono text-[10px]">nx_live_...</code>) are generated once and hashed immediately using SHA-256 at rest. Any integration webhook is validated using dual HMAC-SHA256 request signature verification to prove authentic dispatcher origin.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right block - Operational Safeguards Checklist */}
                  <div className="space-y-6">
                    <div className="bg-slate-900 border border-white/[0.06] rounded-2xl p-6 space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Compliance Checklist</h4>
                      <ul className="space-y-3 text-xs text-slate-300 font-mono">
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          <div>
                            <p className="text-white font-semibold">SOC2 Type II Ready</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Continuous robust logs on system operator modifications.</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          <div>
                            <p className="text-white font-semibold">PCI-DSS Compliant Gates</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Card details transit exclusively through fully containerized direct Stripe SDK pipelines.</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          <div>
                            <p className="text-white font-semibold">FIDO2 & Hardware MFA</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Secure biometric identification and secure TOTP passkeys protect the mainframe.</p>
                          </div>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/20 rounded-2xl p-6">
                      <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Threat Detection Logs</h4>
                      <div className="text-[10px] font-mono space-y-2 bg-black/40 p-4 rounded-xl border border-white/5 max-h-[160px] overflow-y-auto">
                        <div className="text-emerald-400">INFO: mTLS handshakes validated (Asia-SGP-pod)</div>
                        <div className="text-emerald-400">INFO: Integrity cron match verified [10,000 tx reconciled]</div>
                        <div className="text-amber-400">WARN: Blocked suspected ID spoofing attempt [IP: 142.250.x.x]</div>
                        <div className="text-slate-500">DEBUG: KMS master wrap key successfully rotated</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* POST-MVP EXPANSION TAB */}
            {activeTab === 'expansion' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">Strategic Scaling Opportunities</h3>
                      <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                        To sustain long-term growth and maintain strategic competitive advantages, the platform plan maps multiple advanced post-MVP modules, ecosystem growth parameters, and regional integration points.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/[0.04] space-y-3">
                        <h4 className="text-sm font-bold text-white">1. Smart Provider Routing & Arbitrage</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          Analyze supplier real-time status, success rates, speed metrics, and cost parameters to route transactions dynamically. If Digiflazz latency surpasses 120ms or returns errors, traffic redirects automatically to alternative networks, preserving consumer SLAs.
                        </p>
                      </div>

                      <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/[0.04] space-y-3">
                        <h4 className="text-sm font-bold text-white">2. AI-Driven Automation (Gemini Integration)</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          Deploy high-performance, context-aware AI agents trained directly on transaction logs to triage reseller ticket cases, analyze balance anomalies, resolve typical billing issues, and suggest margin adjustments according to historic demand curves.
                        </p>
                      </div>

                      <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/[0.04] space-y-3">
                        <h4 className="text-sm font-bold text-white">3. Global Fiat Payouts & Multi-Currency</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          Establish direct APIs with card acquirers and microfinance networks (like Adyen, dLocal, PromptPay, and SEPA) to allow multi-currency settlement. Resellers handle store-end items in native currencies, while the settlement automatically bridges to parent assets.
                        </p>
                      </div>

                      <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/[0.04] space-y-3">
                        <h4 className="text-sm font-bold text-white">4. App & Plugin SDK Marketplace</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          Provide out-of-the-box ecommerce connectors (Shopify, WHMCS, WooCommerce) alongside developer-centric React/Vue embed libraries. Allow independent developers to build specialized tools (arbitrage tracking metrics, Discord transaction bots) on our network.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 flex flex-col justify-between">
                    <div className="bg-slate-900 border border-white/[0.06] rounded-2xl p-6 space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Future Expansion Roadmap</h4>
                      <div className="space-y-4 font-mono text-xs">
                        <div className="relative pl-4 border-l-2 border-emerald-500">
                          <p className="text-white font-bold uppercase text-[10px]">Q3 2026: Multi-Supplier Router</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Automated path selection and provider health checking.</p>
                        </div>
                        <div className="relative pl-4 border-l-2 border-indigo-500">
                          <p className="text-white font-bold uppercase text-[10px]">Q4 2026: Gemini AI Assistant</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Contextual Level 1 triage automation inside agency support.</p>
                        </div>
                        <div className="relative pl-4 border-l-2 border-slate-700">
                          <p className="text-slate-400 font-bold uppercase text-[10px]">Q1 2027: SDK Ecosystem</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Open Developer Console and secure app directories.</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/10 rounded-2xl p-6 text-center space-y-3">
                      <p className="text-xs text-indigo-300 font-semibold uppercase">Global Market Sizing</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Expanding transaction nodes to the Latin American (LATAM) and European (EU) game top-up sectors increases addressable market sizing by 320%.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MONETIZATION FRAMEWORK TAB */}
            {activeTab === 'monetization' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">Structured Monetization Blueprint</h3>
                      <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                        NexusCore deploys a diversified monetization architecture. By combining predictable, tiered subscriptions, volume usage-based processing commissions, and high-margin platform addons, the system sustains dynamic recurring revenues.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { 
                          tier: "Starter Module", 
                          price: "$29/mo", 
                          vol: "Up to $5k processed", 
                          features: ["Core Dashboard Access", "Basic Domain White-Labeling", "Up to 3 Supplier Bridges", "Standard Support SLA"] 
                        },
                        { 
                          tier: "Business Scale", 
                          price: "$149/mo", 
                          vol: "Up to $50k processed", 
                          features: ["Unlimited Domain Overrides", "Full Theme customizations", "Automatic Multi-Supplier Paths", "Premier SLA & Priority SLA"] 
                        },
                        { 
                          tier: "Enterprise Core", 
                          price: "Custom", 
                          vol: "Unlimited volume", 
                          features: ["Dedicated Storage Clusters", "Parametrizable SLA Agreements", "SSO Active Directory Federation", "Local Ledger Co-location"] 
                        }
                      ].map((p, idx) => (
                        <div key={idx} className="bg-slate-900/40 border border-white/[0.04] p-5 rounded-2xl space-y-4 flex flex-col justify-between font-sans">
                          <div>
                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{p.tier}</p>
                            <p className="text-2xl font-bold text-white mt-1.5">{p.price}</p>
                            <p className="text-[10px] text-slate-500 font-medium tracking-tight mt-1">Volume Cap: {p.vol}</p>
                            <div className="h-px bg-white/5 my-4" />
                            <ul className="space-y-2">
                              {p.features.map((f, i) => (
                                <li key={i} className="text-[10px] text-slate-400 flex items-center gap-1.5">
                                  <span className="w-1 h-1 rounded-full bg-emerald-500" />
                                  <span>{f}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-slate-900 border border-white/[0.06] rounded-2xl p-6 space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Additional Revenue Operators</h4>
                      <ul className="space-y-3.5 text-xs text-slate-300 font-sans">
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-semibold text-white">Volume Commissions (0.25% - 0.75%)</p>
                            <p className="text-[10px] text-slate-500 leading-normal mt-0.5">Percentage processing fees calculated programmatically on successful provider routing payouts.</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-semibold text-white">White-Label Native App Compiler</p>
                            <p className="text-[10px] text-slate-500 leading-normal mt-0.5">Premium $99/mo addon compiling core store features to native Android & iOS platforms deploying to markets.</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-semibold text-white">ML Fraud Guard Add-On</p>
                            <p className="text-[10px] text-slate-500 leading-normal mt-0.5">Preemptively block suspicious buyer proxy ips, card profiles, chargebacks, and high-frequency rate abuse for only $49/mo.</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FRONTEND TAB */}
            {activeTab === 'frontend' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-4">
                  <h3 className="text-lg font-bold text-white tracking-tight">High-Performance SPA & White-Label Delivery</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Our multi-tenant storefront renders pages dynamically using an optimized, client-side SPA bundle built with Vite, 
                    ensuring blistering transitions and zero server rendering latency for end-customers.
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      React 18+ and Vite with Hot Module Replacement disabled in production.
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      Tailwind CSS utility classes for styling to achieve an ultra-lightweight DOM.
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      TanStack Query (React Query) for smart caching and optimistic local UI updates.
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      Dynamic CSS Custom Variables in the HTML layout to inject White-Label brand colors on on-load execution.
                    </li>
                  </ul>
                </div>

                <div className="lg:col-span-8 bg-slate-900/50 p-6 rounded-2xl border border-white/[0.04]">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">White-Label Custom Theme Injector Mock</h4>
                  <div className="bg-slate-950 p-4 rounded-xl border border-white/[0.04] font-mono text-xs leading-relaxed text-slate-300 overflow-x-auto">
                    {`// On Client Load / Session Initialization
import React, { useEffect } from 'react';
import { useTenant } from './contexts/TenantContext';

export const BrandThemeProvider = ({ children }) => {
  const { tenant } = useTenant();

  useEffect(() => {
    if (tenant?.branding) {
      const root = document.documentElement;
      root.style.setProperty('--primary-color', tenant.branding.primaryColor || '#3b82f6');
      root.style.setProperty('--secondary-color', tenant.branding.secondaryColor || '#1e293b');
      root.style.setProperty('--font-family', tenant.branding.fontFamily || 'Inter');
    }
  }, [tenant]);

  return <div className="theme-applied font-family">{children}</div>;
};`}
                  </div>
                </div>
              </div>
            )}

            {/* BACKEND TAB */}
            {activeTab === 'backend' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white tracking-tight">Decoupled Performance Layering</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    A dual-stack approach is perfect for fintech and digital product distribution startups. 
                    Rather than forcing a single language, we utilize two backend layers separated by responsibilities.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-white/[0.04] flex gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <Terminal className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Node.js (NestJS / TypeScript)</h4>
                        <p className="text-xs text-slate-500 leading-normal mt-1">
                          Powers business domains, partner management portal, authentication, dashboard configuration, 
                          tenant configurations, and custom domains. Perfect for fast iterability and vast ecosystem libraries.
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-900/50 p-4 rounded-xl border border-white/[0.04] flex gap-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Golang (Transaction Processing Core)</h4>
                        <p className="text-xs text-slate-500 leading-normal mt-1">
                          Handles core ledger updates, balance deduction, routing map calculations, and supplier gateway adapters. 
                          Extremely fast thread concurrent goroutines enable up-to-the-millisecond execution with sub-megabyte RAM overhead.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/40 border border-white/[0.04] rounded-2xl overflow-hidden p-6">
                  <div className="flex border-b border-white/[0.04] mb-4 pb-2 justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Modular Backend Services Map</span>
                    <span className="text-[10px] font-mono text-slate-500">Service API Blueprint</span>
                  </div>
                  
                  <div className="space-y-2.5">
                    {[
                      { svc: 'Auth & Session API', type: 'JWT JWT/JWT', latency: '4ms', stack: 'NodeJS (NestJS)' },
                      { svc: 'Core Ledgerr Ledger Sync', type: 'gRPC IPC', latency: '0.8ms', stack: 'Golang Core' },
                      { svc: 'Supplier Routing Engine', type: 'gRPC Internal', latency: '2.5ms', stack: 'Golang Core' },
                      { svc: 'Admin Sync Panel', type: 'GraphQL/JSON', latency: '12ms', stack: 'NodeJS (Express)' }
                    ].map((s, i) => (
                      <div key={i} className="flex justify-between items-center text-xs p-3 bg-slate-950 rounded-xl border border-white/[0.02]">
                        <div>
                          <p className="font-bold text-white tracking-tight">{s.svc}</p>
                          <p className="text-[10px] text-slate-500">{s.stack}</p>
                        </div>
                        <div className="text-right text-mono">
                          <span className="text-emerald-400 font-semibold">{s.latency}</span>
                          <p className="text-[9px] text-slate-500 uppercase font-bold">{s.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* DATABASE & STORAGE TAB */}
            {activeTab === 'database' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left DB Specs */}
                  <div className="lg:col-span-5 space-y-4">
                    <h3 className="text-lg font-bold text-white tracking-tight">Relational ACID Consistency</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      All financial balance transactions require absolute strictness. There is zero tolerance for ghost transactions or duplicate balance deductions (double-spending).
                    </p>
                    
                    <div className="space-y-3.5 text-xs text-slate-400">
                      <div className="p-3 bg-slate-900 border border-white/[0.04] rounded-xl flex gap-3">
                        <div className="text-blue-400 mt-0.5 font-bold uppercase font-mono tracking-tighter shrink-0">[PG]</div>
                        <p className="leading-relaxed">
                          <strong>PostgreSQL (AWS RDS Aurora / Cloud SQL)</strong> is our primary write target. Ledger entries, catalog prices, tenant configurations, and reseller margins reside strictly within normalized, relational tables.
                        </p>
                      </div>

                      <div className="p-3 bg-slate-900 border border-white/[0.04] rounded-xl flex gap-3">
                        <div className="text-emerald-400 mt-0.5 font-bold uppercase font-mono tracking-tighter shrink-0">[MGO]</div>
                        <p className="leading-relaxed">
                          <strong>MongoDB (Atlas Cluster)</strong> holds the historical, unstructured payload of Supplier callbacks, outgoing webhooks log, and API telemetry records. segregation isolates core relation queries from heavy write stress.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Schema Display */}
                  <div className="lg:col-span-7 bg-slate-900/50 rounded-2xl border border-white/[0.04] overflow-hidden flex flex-col">
                    <div className="flex border-b border-white/[0.04] bg-slate-900 px-4 py-2 justify-between items-center text-xs shrink-0">
                      <div className="flex gap-2">
                        {['ledger', 'routing', 'webhook'].map((sId) => (
                          <button
                            key={sId}
                            onClick={() => setSelectedSchema(sId as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                              selectedSchema === sId 
                                ? 'bg-slate-950 border border-white/10 text-white' 
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {sId === 'ledger' ? 'Ledger Schema' : sId === 'routing' ? 'Go Core Router' : 'Webhook Payload'}
                          </button>
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">PRD SPEC</span>
                    </div>

                    <div className="p-6 bg-slate-950 font-mono text-[11px] leading-relaxed text-slate-300 overflow-y-auto max-h-[340px] border-t border-white/[0.02]">
                      <pre className="whitespace-pre">{schemas[selectedSchema]}</pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MESSAGING & CACHING TAB */}
            {activeTab === 'messaging' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Queued Processing & Low Latency Caches</h3>
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                      Topup requests are intrinsically asynchronous: we trigger an API call to VIP Reseller or Digiflazz, 
                      which takes anywhere from 500ms to 20 seconds to process. Processing this inside an HTTP thread pools block 
                      results in extreme performance degradation.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/[0.04] space-y-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-blue-400" />
                      </div>
                      <h4 className="text-sm font-bold text-white tracking-tight">Redis Server Cluster</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-mono">
                        Primary cache engine. Stores catalog SKU keys, rates, and active session tokens. 
                        Handles sliding-window API Rate Limits on the proxy middleware. Ensures single-request mutex locking 
                        on wallets to eliminate thread races or negative-balance exploits.
                      </p>
                    </div>

                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/[0.04] space-y-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center font-bold text-orange-400 font-mono text-sm">
                        MQ
                      </div>
                      <h4 className="text-sm font-bold text-white tracking-tight">RabbitMQ AMQP Broker</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-mono">
                        Enterprise message queue. Dequeues order fulfillment payloads safely. If a supplier gateway is offline 
                        or lagging, the order remains persisted inside RabbitMQ, triggering exponential retry loops and Dead Letter Queues (DLQ) 
                        to avoid any lost orders.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-white/[0.04] rounded-2xl p-6 space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AMQP Queue Parameters</h4>
                  
                  <div className="space-y-4 text-xs font-mono">
                    <div className="p-3 bg-slate-950 rounded-xl border border-white/[0.02]">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-white font-bold">order.fulfillment</span>
                        <span className="text-emerald-400 text-[10px] font-bold">DURABLE</span>
                      </div>
                      <p className="text-[10px] text-slate-500">Prefetch: 100 per pod. Acknowledges on supplier Callback.</p>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-white/[0.02]">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-white font-bold">tenant.callbacks</span>
                        <span className="text-purple-400 text-[10px] font-bold">TRANSIENT</span>
                      </div>
                      <p className="text-[10px] text-slate-500">Dynamic webhook sender queue with exponential backoff algorithm.</p>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-white/[0.02]">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-red-400 font-bold">fulfillment.dlq</span>
                        <span className="text-red-500 text-[10px] font-bold">ROBUST_DLX</span>
                      </div>
                      <p className="text-[10px] text-slate-500">For corrupted transactions requiring human system admin veto.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CLOUD TAB */}
            {activeTab === 'cloud' && (
              <div className="bg-slate-900/40 border border-white/[0.04] rounded-2xl p-8 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-white tracking-tight">Google Cloud Platform Deployment Suite</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      We prioritize Google Cloud Platform (GCP) or AWS for server provisioning due to superior edge orchestration routing, 
                      integrated container registries, and managed SQL engines. The deployment model isolates frontends from operational workers completely.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div className="p-4 bg-slate-950 border border-white/[0.02] rounded-xl space-y-1.5">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          Cloud Run & GKE
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal">
                          Serverless pods scale automatically from 0 to 100 instances during massive content creator live drops.
                        </p>
                      </div>

                      <div className="p-4 bg-slate-950 border border-white/[0.02] rounded-xl space-y-1.5">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          Cloud KMS / HashiCorp
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal">
                          Protects crucial API secret credentials for supplier routes (Digiflazz/VIP) using custom HSM keys.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Infrastructure Security Checklist</h4>
                      <ul className="space-y-3.5 text-xs text-slate-300 font-medium font-mono">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Strict CORS & Origin Guard</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>gRPC Mutual TLS Encryption</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Cloud Armor Web Application Firewall</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Datadog APM & Opentelemetry Logging</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
