import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { useTenant } from "../contexts/TenantContext";
import { useOperationalIntelligence } from "../contexts/OperationalIntelligenceContext";
import { cn } from "../utils/cn";
import {
  TrendingUp,
  Wallet,
  ShieldCheck,
  Globe,
  Database,
  Users,
  Activity,
  Package,
  History,
  ShoppingCart,
  Server,
  Shuffle,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Sliders,
  Cpu,
  RefreshCw,
  Plus,
  Compass,
  DollarSign,
  Layers,
  ArrowRight,
  Info,
  Clock,
  Lock,
  Network,
  Radio,
  SlidersHorizontal,
  ChevronRight,
  X,
  MapPin,
  Flame,
  BadgeAlert,
  HardDrive,
  Search,
  Copy,
  Check,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { LiquidityChart } from "../modules/Analytics/LiquidityChart";
import { WalletFlowVisual } from "../modules/System/WalletFlowVisual";

// Operational Intelligence Modules
import { ExecutiveOverlay } from "../modules/Intelligence/ExecutiveOverlay";
import { HistoricalAnalytics } from "../modules/Intelligence/HistoricalAnalytics";
import { IncidentCenter } from "../modules/Intelligence/IncidentCenter";
import { TenantIntelligence } from "../modules/Intelligence/TenantIntelligence";
import { ProviderTrustSystem } from "../modules/Intelligence/ProviderTrustSystem";
import { EcosystemTimeline } from "../modules/Intelligence/EcosystemTimeline";

export interface TransactionFeed {
  id: string;
  tenant: string;
  item: string;
  volume: number;
  margin: number;
  status: 'SUCCESS' | 'ROUTING' | 'FAILOVER' | 'QUEUED';
  provider: string;
  latency: string;
  timestamp: string;
}

export interface TenantNode {
  id: string;
  name: string;
  region: string;
  resellersCount: number;
  dailyVolume: number;
  healthRate: number;
  activeWebhook: string;
}

const REALTIME_EVENT_TYPES = [
  { key: "settlement_verified", severity: "success", module: "LEDGER" },
  { key: "fulfillment_completed", severity: "success", module: "FULFILLMENT" },
  { key: "supplier_latency_spike", severity: "warn", module: "SUPPLIER" },
  { key: "routing_optimized", severity: "sys", module: "ROUTER" },
  { key: "escrow_synchronized", severity: "success", module: "LEDGER" },
  { key: "retry_queue_executed", severity: "sys", module: "SYSTEM" },
  { key: "provider_node_recovered", severity: "success", module: "SUPPLIER" },
  { key: "regional_traffic_spike", severity: "warn", module: "ROUTER" },
  { key: "payment_gateway_reconnected", severity: "success", module: "SHIELD" }
];

export const Dashboard = () => {
  const { t } = useTranslation();
  const { role } = useAuth();
  const { tenant } = useTenant();

  const {
    systemHealth,
    rollingGmv,
    rollingRevenue,
    activeNodes,
    wholesaleSla,
    routingVelocity,
    queueLatencyMs: queueLatency,
    isHighLoadActive,
    incidents,
    providerTrust,
    tenantIntel,
    timelineEntries,
    triggerSimulationIncident,
    resolveActiveIncident,
    injectManualTransaction,
    triggerHighLoadState,
    updateEscrowBalances,
    resetTelemetryEcosystem
  } = useOperationalIntelligence();

  // Primary Workspace tab state
  const [activeTab, setActiveTab] = useState<'infrastructure' | 'financials' | 'tenants'>('infrastructure');

  // Table Searching and Filtering
  const [searchTxQuery, setSearchTxQuery] = useState("");
  const [statusTxFilter, setStatusTxFilter] = useState("ALL");
  const [providerTxFilter, setProviderTxFilter] = useState("ALL");

  const [searchTenantQuery, setSearchTenantQuery] = useState("");
  const [regionTenantFilter, setRegionTenantFilter] = useState("ALL");

  // Interaction feedbacks
  const [copiedTxId, setCopiedTxId] = useState("");

  // Interactive Gateway Latency Engine
  const [latency, setLatency] = useState(12);
  const [uptime, setUptime] = useState(99.992);
  const [gatewayStatus, setGatewayStatus] = useState<'OPERATIONAL' | 'DEGRADED'>('OPERATIONAL');
  
  // Router strategy state
  const [routingStrategy, setRoutingStrategy] = useState<'AUTONOMOUS' | 'LOW_LATENCY' | 'MAX_MARGIN' | 'FALLBACK_CODASHOP'>('AUTONOMOUS');
  
  // Selected visual active node
  const [activeGeoNode, setActiveGeoNode] = useState<'SG' | 'EU' | 'JP' | 'US'>('SG');

  // Interactive Liquidity Allocation State
  const [escrowDigiflazz, setEscrowDigiflazz] = useState(145000);
  const [escrowCodashop, setEscrowCodashop] = useState(150000);
  const totalEscrowLimit = 300000; // Capital pool limit

  // Supplier Pinger values
  const [isPingingUpstreams, setIsPingingUpstreams] = useState(false);
  const [supplierMetrics, setSupplierMetrics] = useState({
    digiflazz: { latency: 84, status: 'OPTIMAL', fill: '99.98%' },
    codashop: { latency: 106, status: 'OPTIMAL', fill: '99.99%' },
    razer: { latency: 132, status: 'STEADY', fill: '99.91%' },
    unipin: { latency: 198, status: 'DEGRADED', fill: '99.45%' }
  });

  // Transaction Lists state
  const [transactions, setTransactions] = useState<TransactionFeed[]>([
    { id: "TX-98402", tenant: "Apex Esports Jakarta", item: "Mobile Legends 1000 Gems", volume: 14.50, margin: 4.8, status: "SUCCESS", provider: "Digiflazz", latency: "74ms", timestamp: "12:08:14" },
    { id: "TX-98401", tenant: "GamerVoucher Europe", item: "Razer Gold $50 Voucher", volume: 50.00, margin: 3.5, status: "ROUTING", provider: "Codashop", latency: "112ms", timestamp: "12:08:02" },
    { id: "TX-98400", tenant: "Rio de Janeiro Arena Coins", item: "PUBG Mobile 600 UC", volume: 8.90, margin: 5.2, status: "SUCCESS", provider: "Razer Gold", latency: "148ms", timestamp: "12:07:46" },
    { id: "TX-98399", tenant: "Sumatra Distribution Hub", item: "Steam Wallet $20 Gift Card", volume: 20.00, margin: 2.9, status: "FAILOVER", provider: "UniPin Global Node", latency: "210ms", timestamp: "12:07:11" },
    { id: "TX-98398", tenant: "SG Games Unlimited", item: "Free Fire 500 Diamonds", volume: 4.20, margin: 6.1, status: "SUCCESS", provider: "Digiflazz", latency: "68ms", timestamp: "12:06:55" },
    { id: "TX-98397", tenant: "IndoGamer Premium", item: "Valorant 2400 Points", volume: 24.00, margin: 3.8, status: "QUEUED", provider: "Codashop APAC", latency: "95ms", timestamp: "12:06:33" }
  ]);

  // Operational System Timeline Event Logs
  const [eventLogs, setEventLogs] = useState([
    { time: "12:08:21", module: "LEDGER", translKey: "escrow_synchronized", message: "Zero-Knowledge ledger consistency check completed: 100% matched.", status: "ok" },
    { time: "12:07:11", module: "ROUTER", translKey: "supplier_latency_spike", message: "Path failover protocol launched for Sumatra SKU: STEAM-20. Switched UniPin -> Codashop.", status: "warn" },
    { time: "12:05:00", module: "SHIELD", translKey: "payment_gateway_reconnected", message: "Mutual TLS (mTLS) certificate keys rotated for 84 tenant micro-instances.", status: "ok" },
    { time: "11:42:19", module: "SYSTEM", translKey: "routing_optimized", message: "Singapore Core Node assigned as dynamic master traffic router.", status: "sys" },
    { time: "11:15:30", module: "SUPPLIER", translKey: "provider_node_recovered", message: "Digiflazz wholesale endpoint latency dropped below 90ms benchmark.", status: "ok" }
  ]);

  // Simulated live load ticker with beautiful natural fluctuations
  useEffect(() => {
    const latencyInterval = setInterval(() => {
      setLatency(prev => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta;
        return next >= 8 && next <= 15 ? next : prev;
      });
    }, 4500);

    const uptimeInterval = setInterval(() => {
      setUptime(prev => {
        const delta = Math.random() * 0.001;
        const next = 99.992 - delta;
        return Number(next.toFixed(4));
      });
    }, 15000);

    // Auto transaction generator
    const txInterval = setInterval(() => {
      injectSingleTransaction(false);
    }, 8500);

    return () => {
      clearInterval(latencyInterval);
      clearInterval(uptimeInterval);
      clearInterval(txInterval);
    };
  }, [routingStrategy, isHighLoadActive]);

  const injectSingleTransaction = (userInitiated = false, isHighLoad = false) => {
    const items = [
      { name: "MLBB 2000 Diamonds", price: 29.00, margin: 5.1 },
      { name: "Valorant 4000 Points", price: 38.50, margin: 4.2 },
      { name: "Skins Chest Pack", price: 12.00, margin: 6.5 },
      { name: "Steam Wallet $100 Gift Card", price: 100.00, margin: 2.5 },
      { name: "Free Fire Mega Diamond Bundle", price: 16.80, margin: 5.8 }
    ];
    const tenants = [
      "Apex Esports Jakarta", "GamerVoucher Europe", "Rio de Janeiro Arena Coins", 
      "Sumatra Distribution Hub", "SG Games Unlimited", "IndoGamer Premium", 
      "Frankfurt Digital Games", "Tokyo Apex Wholesaler"
    ];
    const providers = ["Digiflazz", "Codashop", "Razer Gold", "UniPin Hub"];

    const selectedItem = items[Math.floor(Math.random() * items.length)];
    const selectedTenant = tenants[Math.floor(Math.random() * tenants.length)];
    const selectedProvider = providers[Math.floor(Math.random() * providers.length)];
    
    const randomTxId = `TX-${Math.floor(98000 + Math.random() * 900)}`;
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const isFailover = !isHighLoad && Math.random() < 0.1;
    const finalStatus = isFailover ? "FAILOVER" : (Math.random() > 0.85 ? "ROUTING" : "SUCCESS");

    const newTx: TransactionFeed = {
      id: randomTxId,
      tenant: selectedTenant,
      item: selectedItem.name,
      volume: selectedItem.price,
      margin: selectedItem.margin,
      status: finalStatus,
      provider: selectedProvider,
      latency: `${Math.floor(55 + Math.random() * 110)}ms`,
      timestamp: timeStr
    };

    setTransactions(prev => [newTx, ...prev.slice(0, 50)]); // keep a larger buffer for filtering/searching!
    injectManualTransaction(selectedTenant, selectedItem.price);
  };

  const handleManualInject = () => {
    triggerHighLoadState();
    
    // Inject multiple transactions visually in the scrolling trace table too
    let count = 0;
    const burstInterval = setInterval(() => {
      injectSingleTransaction(true, true);
      count++;
      if (count >= 12) {
        clearInterval(burstInterval);
      }
    }, 450);
  };

  // Helper function to trigger single manual test transaction
  const handleSingleManualInject = () => {
    injectSingleTransaction(true);
  };

  const handleTriggerUpstreamProbe = () => {
    setIsPingingUpstreams(true);
    setTimeout(() => {
      setSupplierMetrics({
        digiflazz: { latency: Math.floor(75 + Math.random() * 15), status: 'OPTIMAL', fill: '99.98%' },
        codashop: { latency: Math.floor(95 + Math.random() * 20), status: 'OPTIMAL', fill: '99.99%' },
        razer: { latency: Math.floor(121 + Math.random() * 18), status: 'STEADY', fill: '99.93%' },
        unipin: { latency: Math.floor(182 + Math.random() * 25), status: 'OPTIMAL', fill: '99.52%' }
      });
      setIsPingingUpstreams(false);
      
      const now = new Date().toTimeString().split(' ')[0];
      setEventLogs(prev => [
        { time: now, module: "SUPPLIER", translKey: "escrow_synchronized", message: "SLA gateway probe executed. Multi-region endpoint connectivity synchronized.", status: "ok" },
        ...prev
      ]);
    }, 1200);
  };

  const handleStrategyChange = (strategy: typeof routingStrategy) => {
    setRoutingStrategy(strategy);
    const now = new Date().toTimeString().split(' ')[0];
    
    let desc = "";
    if (strategy === "AUTONOMOUS") desc = "Activated fully autonomous load-balancing mode.";
    if (strategy === "LOW_LATENCY") desc = "Enforced Singapore edge lines latency prioritization.";
    if (strategy === "MAX_MARGIN") desc = "Maximizing direct contract clearing spreads.";
    if (strategy === "FALLBACK_CODASHOP") desc = "Primary bypass routing forced on Codashop APAC trunks.";

    setEventLogs(prev => [
      { time: now, module: "ROUTER", translKey: "routing_optimized", message: `Routing Strategy Overridden: ${strategy}. ${desc}`, status: "sys" },
      ...prev
    ]);
  };

  // Capital Allocator slider handler
  const handleEscrowShift = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setEscrowDigiflazz(val);
    setEscrowCodashop(totalEscrowLimit - val);
    updateEscrowBalances(val, totalEscrowLimit - val);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16 font-sans selection:bg-blue-500/30 text-slate-300">
      
      {/* 1. EXECUTIVE OPERATIONAL HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/[0.04] relative">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-blue-400 tracking-[0.25em] uppercase px-2.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
              NEXUSCORE CENTRAL SYSTEM OWNER
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest border border-white/5 px-2 py-0.5 rounded">
              NODE: PROD-MAIN #01-SG
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              ISO-27001 ACTIVE_
            </span>
          </div>
          
          <h1 className="text-3xl font-bold text-white tracking-tight leading-none">
            {t('dashboard:title')}
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
            {t('dashboard:subtitle')}
          </p>
        </div>

        {/* Workspace Operations Tabs */}
        <div className="flex bg-[#030610] border border-white/5 p-1 rounded-xl shrink-0 gap-1 self-start lg:self-auto font-mono">
          <button
            onClick={() => setActiveTab('infrastructure')}
            className={cn(
              "px-4 py-2 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all flex items-center gap-2",
              activeTab === 'infrastructure' ? "bg-white/5 text-white border border-white/5 shadow-inner" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            Infrastructure Pulse
          </button>
          
          <button
            onClick={() => setActiveTab('financials')}
            className={cn(
              "px-4 py-2 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all flex items-center gap-2",
              activeTab === 'financials' ? "bg-white/5 text-white border border-white/5 shadow-inner" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            Finance & Escrow
          </button>

          <button
            onClick={() => setActiveTab('tenants')}
            className={cn(
              "px-4 py-2 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all flex items-center gap-2",
              activeTab === 'tenants' ? "bg-white/5 text-white border border-white/5 shadow-inner" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <Users className="w-3.5 h-3.5 text-purple-400" />
            Tenant Clusters
          </button>
        </div>
      </div>

      {/* 2. EXECUTIVE AI-ASSISTED INTELLIGENCE OVERLAY */}
      <ExecutiveOverlay />

      {/* 3. EXECUTIVE OPERATIONS KPI METRICS LAYER */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          {
            title: "Rolling 24h Settlement GMV",
            value: `$${rollingGmv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            trend: "+18.42% (Live)",
            status: "Sovereign Clearing",
            icon: Wallet,
            color: "text-emerald-400",
            glow: "rgba(16,185,129,0.15)",
            pulse: true
          },
          {
            title: "Registered Edge Tenants",
            value: `${activeNodes.toLocaleString()} Nodes`,
            trend: "+12.8% YoY",
            status: "Isolated Storefronts",
            icon: Layers,
            color: "text-blue-400",
            glow: "rgba(59,130,246,0.15)",
            pulse: false
          },
          {
            title: "Wholesale Partner SLA",
            value: `${wholesaleSla.toFixed(4)}%`,
            trend: "99.95% Benchmark",
            status: "0 Failures Traced",
            icon: ShieldCheck,
            color: "text-blue-400",
            glow: "rgba(59,130,246,0.15)",
            pulse: false
          },
          {
            title: "Core Routing velocity",
            value: `${routingVelocity} tx / min`,
            trend: isHighLoadActive ? "🔥 SLA Traffic Burst" : "+40 tx/min Spike",
            status: `Avg Queue: ${queueLatency}ms`,
            icon: Activity,
            color: isHighLoadActive ? "text-amber-500 animate-pulse" : "text-amber-400",
            glow: "rgba(245,158,11,0.15)",
            pulse: isHighLoadActive
          },
          {
            title: "Reconciled Cash Reserves",
            value: `$${(escrowDigiflazz + escrowCodashop).toLocaleString()}.00`,
            trend: "Fully Escrow Locked",
            status: "Digiflazz & Codashop pools",
            icon: Database,
            color: "text-purple-400",
            glow: "rgba(168,85,247,0.15)",
            pulse: false
          }
        ].map((kpi, i) => (
          <div 
            key={i}
            className="group bg-[#04060c] border border-white/[0.04] p-5 rounded-2xl flex flex-col justify-between transition-all hover:border-white/[0.1] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 h-16 w-16 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" 
                 style={{ background: `radial-gradient(circle at top right, ${kpi.glow} 0%, transparent 70%)` }} />
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest leading-none">{kpi.title}</span>
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                <kpi.icon className={cn("w-4 h-4", kpi.color, kpi.pulse && "animate-pulse")} />
              </div>
            </div>
            
            <div className="space-y-1 mt-2">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-xl font-bold text-white tracking-tight font-sans leading-none">{kpi.value}</span>
                <span className={cn("text-[9px] font-mono font-bold", isHighLoadActive && kpi.title.includes("velocity") ? "text-amber-400 animate-bounce" : "text-emerald-400")}>{kpi.trend}</span>
              </div>
              <div className="flex items-center gap-1.5 pt-1.5 text-[9px] font-mono text-slate-400">
                <span className={cn("w-1.5 h-1.5 rounded-full", isHighLoadActive && kpi.title.includes("velocity") ? "bg-amber-400 animate-ping" : "bg-[#10b981]")} />
                <span>{kpi.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. MAIN WORKSPACE VIEW ROUTER */}
      
      {/* VIEW A: INFRASTRUCTURE PULSE */}
      {activeTab === 'infrastructure' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Block (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Live System Geography Map & Interactive Plane */}
            <div className="bg-[#04060c] rounded-2xl border border-white/[0.04] p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[#020305]/20 pointer-events-none" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10 border-b border-white/[0.04] pb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-500 animate-spin" />
                    {t('infrastructure:system_health')}
                  </h3>
                  <p className="text-[11px] text-slate-500">{t('infrastructure:click_telemetry')}</p>
                </div>

                <div className="flex bg-[#020305] border border-white/5 rounded-lg p-0.5 text-[10px] font-mono">
                  <span className="px-2 py-1 text-slate-400">{t('infrastructure:active_region')}&nbsp;</span>
                  <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold rounded">
                    {activeGeoNode === 'SG' ? 'SINGAPORE CORE' : activeGeoNode === 'EU' ? 'FRANKFURT EDGES' : activeGeoNode === 'JP' ? 'TOKYO CLUSTER' : 'US-EAST BACKBONE'}
                  </span>
                </div>
              </div>

              {/* Physical Topology Representation Grid */}
              <div className="h-[260px] relative w-full flex items-center justify-center mt-6 border border-white/[0.02] bg-[#020305]/60 rounded-xl overflow-hidden p-6">
                
                {/* Visual Connection Vector Paths */}
                <svg className="absolute inset-0 w-full h-full opacity-30 select-none" xmlns="http://www.w3.org/2000/svg">
                  {/* Lines drawing network paths from Singapore Core to other nodes */}
                  <line x1="22%" y1="78%" x2="50%" y2="28%" stroke="rgba(59,130,246,0.3)" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />
                  <line x1="22%" y1="78%" x2="82%" y2="42%" stroke="rgba(59,130,246,0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
                  <line x1="22%" y1="78%" x2="52%" y2="82%" stroke="rgba(59,130,246,0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
                  {/* Secondary connection paths */}
                  <line x1="50%" y1="28%" x2="82%" y2="42%" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <line x1="52%" y1="82%" x2="82%" y2="42%" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                </svg>

                {/* Regional anchor points */}
                {[
                  { id: 'US', name: 'US-EAST BACKBONE', ip: 'us-east.nexuscore.net', coords: { left: '46%', top: '22%' }, status: 'ONLINE', ping: '114ms', isPrimary: false },
                  { id: 'EU', name: 'FRANKFURT EDGES', ip: 'de-frank.nexuscore.net', coords: { left: '78%', top: '36%' }, status: 'ONLINE', ping: '122ms', isPrimary: false },
                  { id: 'JP', name: 'TOKYO CLUSTER', ip: 'jp-tokyo.nexuscore.net', coords: { left: '48%', top: '76%' }, status: 'STEADY', ping: '82ms', isPrimary: false },
                  { id: 'SG', name: 'SINGAPORE CORE', ip: 'sg-central.nexuscore.net', coords: { left: '18%', top: '72%' }, status: 'ONLINE', ping: '14ms', isPrimary: true },
                ].map((node) => {
                  const isActive = activeGeoNode === node.id;
                  return (
                    <button
                      key={node.id}
                      onClick={() => setActiveGeoNode(node.id as any)}
                      style={{ left: node.coords.left, top: node.coords.top }}
                      className={cn(
                        "absolute p-1 sm:p-2 lg:p-3 rounded-lg sm:rounded-xl border flex items-center gap-1 sm:gap-3 transition-all text-left group -translate-x-1/2 -translate-y-1/2",
                        isActive 
                          ? "bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)] z-30" 
                          : "bg-slate-950/85 border-white/[0.04] hover:bg-slate-900/60 hover:border-white/[0.1] z-20"
                      )}
                    >
                      <div className="relative shrink-0">
                        <div className={cn(
                          "w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex items-center justify-center border",
                          node.id === 'SG' ? "border-emerald-500 bg-emerald-500/20" : "border-blue-500 bg-blue-500/20"
                        )}>
                          <div className={cn("w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full", node.id === 'SG' ? "bg-emerald-400" : "bg-blue-400")} />
                        </div>
                        {isActive && (
                          <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-70" />
                        )}
                      </div>

                      <div className="leading-none space-y-0.5">
                        <p className="text-[8px] sm:text-[10px] font-bold text-white uppercase tracking-wide">{node.id}</p>
                        <p className="hidden md:block text-[8px] font-mono text-slate-500">{node.ip}</p>
                        <div className="flex items-center gap-1 pt-0.5">
                          <span className="text-[8px] font-mono text-slate-400">{node.ping}</span>
                          {node.isPrimary && (
                            <span className="hidden sm:inline-block px-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[7px] font-bold rounded">
                              PRIMARY
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}

                {/* Map corner instructions */}
                <div className="absolute bottom-3 right-3 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                  Secure cryptographic tunnel active (SSTP)
                </div>
              </div>

              {/* Node statistics sub-table */}
              <div className="mt-6 pt-4 border-t border-white/[0.04] grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-[10px] text-slate-400">
                <div className="bg-[#020305]/40 border border-white/[0.02] p-2.5 rounded-lg">
                  <span className="text-slate-500 block mb-0.5">ACTIVE CO-ROUTERS</span>
                  <strong className="text-white">1,248 Paths Checked</strong>
                </div>
                <div className="bg-[#020305]/40 border border-white/[0.02] p-2.5 rounded-lg">
                  <span className="text-slate-500 block mb-0.5">LEDGER RECONCILED</span>
                  <strong className="text-emerald-400">100.0% SECURE_</strong>
                </div>
                <div className="bg-[#020305]/40 border border-white/[0.02] p-2.5 rounded-lg">
                  <span className="text-slate-500 block mb-0.5">LAST RE-ROUTE</span>
                  <strong className="text-white">Sumatra SKU Failover</strong>
                </div>
                <div className="bg-[#020305]/40 border border-white/[0.02] p-2.5 rounded-lg">
                  <span className="text-slate-500 block mb-0.5">GATEWAY LATENCY PING</span>
                  <strong className="text-blue-400">{latency} ms (Optimal)</strong>
                </div>
              </div>
            </div>

            {/* Incident Management & Operational Alerts Response Center */}
            <IncidentCenter />

            {/* Real-time Order & Transaction stream ledger */}
            <div className="bg-[#04060c] border border-white/[0.04] rounded-2xl p-6 relative">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 border-b border-white/[0.04] pb-5">
                <div>
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-emerald-400/80" />
                    Sovereign Real-Time Transaction Stream Ledger
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">Live digital payout events, route margins, and direct provider clearance telemetry.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button 
                    onClick={handleSingleManualInject}
                    className="px-3 py-1.5 bg-[#03050b] hover:bg-white/[0.03] border border-white/5 rounded-lg text-[10px] font-mono font-bold text-slate-300 uppercase transition-all flex items-center gap-1.5 active:scale-95"
                    title="Generate a single mock transaction"
                  >
                    <Plus className="w-3 h-3 text-blue-400" />
                    Single Tx
                  </button>
                  <button 
                    onClick={handleManualInject}
                    className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-[10px] font-mono font-bold tracking-wider text-blue-400 uppercase transition-all flex items-center gap-1.5 active:scale-95"
                    disabled={isHighLoadActive}
                  >
                    <Zap className={cn("w-3 h-3 text-blue-400", isHighLoadActive && "animate-bounce")} />
                    {isHighLoadActive ? "High Load Active" : "Inject High-Load Stream"}
                  </button>
                </div>
              </div>

              {/* Advanced Stripe-grade Filter Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5 p-3 bg-slate-950/40 rounded-xl border border-white/[0.02]">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTxQuery}
                    onChange={(e) => setSearchTxQuery(e.target.value)}
                    placeholder="Search by Trace, Tenant, or Voucher..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-white/5 rounded-lg text-[11px] font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                  {searchTxQuery && (
                    <button 
                      onClick={() => setSearchTxQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest pl-1 shrink-0">STATUS:</span>
                  <select
                    value={statusTxFilter}
                    onChange={(e) => setStatusTxFilter(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-950 border border-white/5 rounded-lg text-[11px] font-mono text-white focus:outline-none focus:border-blue-500/40"
                  >
                    <option value="ALL">ALL PROCESSES</option>
                    <option value="SUCCESS">SUCCESS</option>
                    <option value="ROUTING">ROUTING</option>
                    <option value="FAILOVER">FAILOVER</option>
                    <option value="QUEUED">QUEUED</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest pl-1 shrink-0">CLEARER:</span>
                  <select
                    value={providerTxFilter}
                    onChange={(e) => setProviderTxFilter(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-950 border border-white/5 rounded-lg text-[11px] font-mono text-white focus:outline-none focus:border-blue-500/40"
                  >
                    <option value="ALL">ALL UPSTREAMS</option>
                    <option value="Digiflazz">Digiflazz</option>
                    <option value="Codashop">Codashop</option>
                    <option value="Razer">Razer Gold</option>
                    <option value="UniPin">UniPin Hub</option>
                  </select>
                </div>
              </div>

              {/* Transactions table rendering loop */}
              {(() => {
                const filteredTxs = transactions.filter(tx => {
                  const query = searchTxQuery.toLowerCase();
                  const matchesSearch = tx.id.toLowerCase().includes(query) || 
                                        tx.tenant.toLowerCase().includes(query) || 
                                        tx.item.toLowerCase().includes(query);
                  const matchesStatus = statusTxFilter === "ALL" || tx.status === statusTxFilter;
                  const matchesProvider = providerTxFilter === "ALL" || tx.provider.includes(providerTxFilter);
                  return matchesSearch && matchesStatus && matchesProvider;
                });

                if (filteredTxs.length === 0) {
                  return (
                    <div className="py-14 border border-white/[0.02] bg-[#020305]/40 rounded-xl flex flex-col items-center justify-center text-center max-w-lg mx-auto p-6 space-y-4 my-2">
                      <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 shadow-sm">
                        <Search className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white tracking-tight font-sans">No Transaction Telemetries Found</h4>
                        <p className="text-[11px] text-slate-400 max-w-sm leading-relaxed">
                          No matching routes were cleared inside this sliding operations window. Try resetting filters or forcing an automated SLA traffic check.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <button 
                          onClick={() => { setSearchTxQuery(""); setStatusTxFilter("ALL"); setProviderTxFilter("ALL"); }}
                          className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[10px] font-mono font-bold uppercase text-white flex items-center gap-1.5 transition-all"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                          Reset Filters
                        </button>
                        <button 
                          onClick={handleSingleManualInject}
                          className="px-3.5 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-[10px] font-mono font-bold uppercase text-blue-400 flex items-center gap-1.5 transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                          Force Tx Injection
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-white/[0.04] text-[10px] uppercase text-slate-500 tracking-wider font-mono">
                          <th className="pb-3 px-3">Trace UUID</th>
                          <th className="pb-3 px-3">Agency Sub-Node</th>
                          <th className="pb-3 px-3">SKU Voucher Description</th>
                          <th className="pb-3 px-3">Gross Clearing</th>
                          <th className="pb-3 px-3">Margin Spread</th>
                          <th className="pb-3 px-3">Active Gateway</th>
                          <th className="pb-3 px-3 text-right">Route Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.02] text-[11px] font-mono text-slate-300">
                        {filteredTxs.map((tx) => {
                          const isCopied = copiedTxId === tx.id;
                          return (
                            <tr key={tx.id} className="hover:bg-white/[0.01] transition-colors group">
                              <td className="py-3 px-3 relative">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(tx.id);
                                    setCopiedTxId(tx.id);
                                    setTimeout(() => setCopiedTxId(""), 1500);
                                  }}
                                  className="text-white hover:text-blue-450 font-bold flex items-center gap-1 text-left decoration-dotted underline hover:decoration-solid transition-all leading-tight shrink-0 focus:outline-none"
                                  title="Click to copy unique Trace UUID"
                                >
                                  {tx.id}
                                  {isCopied ? (
                                    <span className="text-[8px] bg-blue-500/15 text-blue-400 px-1 py-0.5 rounded font-bold uppercase flex items-center gap-0.5 ml-1 select-none animate-in fade-in zoom-in-95 duration-100">
                                      <Check className="w-2.5 h-2.5" /> COPIED
                                    </span>
                                  ) : (
                                    <Copy className="w-2.5 h-2.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                                  )}
                                </button>
                                <span className="text-[9px] text-slate-600 block leading-tight mt-0.5">{tx.timestamp} GMT</span>
                              </td>
                              <td className="py-3 px-3 text-slate-400">
                                <span className="font-semibold block">{tx.tenant}</span>
                                <span className="text-[9px] text-slate-600 block">Edge SLA path validated</span>
                              </td>
                              <td className="py-3 px-3 font-sans truncate max-w-[150px]" title={tx.item}>
                                {tx.item}
                              </td>
                              <td className="py-3 px-3 text-emerald-400 font-bold">
                                ${tx.volume.toFixed(2)}
                              </td>
                              <td className="py-3 px-3 text-emerald-500 font-semibold">
                                +{tx.margin.toFixed(1)}%
                              </td>
                              <td className="py-3 px-3">
                                <span className="px-2 py-0.5 rounded bg-white/[0.03] border border-white/5 text-[9px] text-slate-300">
                                  {tx.provider}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <span className={cn(
                                  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase font-sans border",
                                  tx.status === 'SUCCESS' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                  tx.status === 'FAILOVER' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                  tx.status === 'QUEUED' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                  "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                )}>
                                  <span className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    tx.status === 'SUCCESS' ? "bg-emerald-400" :
                                    tx.status === 'FAILOVER' ? "bg-amber-400" :
                                    "bg-blue-400 text-blue-400"
                                  )} />
                                  {tx.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}

              <div className="mt-4 pt-4 border-t border-white/[0.04] flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] text-slate-500 font-mono">
                <span>Displaying live operational sliding queue buffer ({transactions.length} tracked frames)</span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  SLA Stream Autorefreshing: ~8.5s Telemetry Rate
                </span>
              </div>
            </div>

          </div>

          {/* Right Block (4 Cols) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Autonomous Routing Overrides switches */}
            <div className="bg-[#04060c] border border-white/[0.04] p-6 rounded-2xl space-y-5">
              <div className="border-b border-white/[0.04] pb-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Shuffle className="w-4 h-4 text-blue-500" />
                  Autonomous Routing Strategy Engine
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">Configure active real-time path prioritization overrides.</p>
              </div>

              <div className="space-y-2">
                {[
                  { id: 'AUTONOMOUS', label: 'Dynamic Load-Balancing (Lowest Ping)', sub: "Active failover telemetry checking SLA endpoints." },
                  { id: 'LOW_LATENCY', label: 'Force Singapore Core (Fastest Path)', sub: "Prioritizes direct fiber-links with SE-Asia providers." },
                  { id: 'MAX_MARGIN', label: 'Optimize Payout Margin Spread', sub: "Prioritizes direct wholesale contracts to boost GMV margins." },
                  { id: 'FALLBACK_CODASHOP', label: 'Direct Bypass: Force Codashop Trunks', sub: "Locks primary connections exclusively to secondary APAC nodes." }
                ].map((strat) => {
                  const isSelected = routingStrategy === strat.id;
                  return (
                    <button
                      key={strat.id}
                      onClick={() => handleStrategyChange(strat.id as any)}
                      className={cn(
                        "w-full p-3.5 rounded-xl text-left border transition-all flex flex-col gap-1 relative overflow-hidden group",
                        isSelected 
                          ? "bg-blue-600/5 border-blue-500/40 text-white" 
                          : "bg-[#020305]/60 border-white/[0.03] text-slate-400 hover:border-white/[0.1] hover:bg-slate-900/40"
                      )}
                    >
                      {isSelected && (
                        <div className="absolute top-0 bottom-0 left-0 w-1 bg-blue-500" />
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-sans">{strat.label}</span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-sans leading-normal">{strat.sub}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Supplier UI Trust Assessment Engine */}
            <ProviderTrustSystem />

            {/* Comprehensive Cryptographical Event Ecosystem Timeline */}
            <EcosystemTimeline />

          </div>

        </div>
      )}

      {/* VIEW B: FINANCIALS & ESCROW TAB */}
      {activeTab === 'financials' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Liquidity Center Column (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            <div className="bg-[#04060c] border border-white/[0.04] rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/[0.04] pb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Clearing Operations Volume Graph
                  </h3>
                  <p className="text-[11px] text-slate-500">Hourly transacted voucher credit volumes and margin yields pooled globally.</p>
                </div>

                <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  RECONCILED MATCH OK
                </span>
              </div>

              {/* Liquidity Graph */}
              <LiquidityChart />
            </div>

            {/* Tactile Capital Escrow Balancer - Slider Allocator */}
            <div className="bg-[#04060c] border border-white/[0.04] rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                  Tactile Upstream Escrow Balance Allocator
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  Adjust active financial reserves deposited within wholesale supplier pools. Recalculates dynamically to optimize clearance speeds.
                </p>
              </div>

              <div className="bg-[#020305]/60 border border-white/[0.03] p-5 rounded-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6 font-mono text-center">
                  <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-widest">DIGIFLAZZ CORE POOL</span>
                    <strong className="text-2xl text-blue-400 font-bold tracking-tight">${escrowDigiflazz.toLocaleString()}.00</strong>
                    <p className="text-[9px] text-slate-500 font-sans">Required SLA minimum collateral: $5,000</p>
                  </div>

                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-widest">CODASHOP APAC PORTAL POOL</span>
                    <strong className="text-2xl text-emerald-400 font-bold tracking-tight">${escrowCodashop.toLocaleString()}.00</strong>
                    <p className="text-[9px] text-slate-500 font-sans">Required SLA minimum collateral: $2,500</p>
                  </div>
                </div>

                {/* Range Slider for Escrow Allocating */}
                <div className="space-y-3 font-sans">
                  <div className="flex justify-between items-center text-xs text-slate-400 font-mono font-bold uppercase">
                    <span>Allocate to Digiflazz</span>
                    <span>Allocate to Codashop</span>
                  </div>
                  
                  <input 
                    type="range" 
                    min="10000" 
                    max="290000" 
                    value={escrowDigiflazz}
                    onChange={handleEscrowShift}
                    className="w-full h-2 bg-[#020305] rounded-lg appearance-none cursor-pointer accent-blue-500 outline-none"
                  />
                  
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                    <span>$10,000 MIN</span>
                    <span className="text-center text-slate-400 font-bold">TOTAL CONTROLLED LIQUIDITY RESERVES: ${(totalEscrowLimit).toLocaleString()}.00</span>
                    <span>$290,000 MAX</span>
                  </div>
                </div>
              </div>

              {/* Slider outcome details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[10px] text-slate-400">
                <div className="p-3 bg-white/[0.01] border border-white/[0.03] rounded-xl">
                  <span className="text-slate-500 block">SETTLEMENT VELOCITY</span>
                  <strong className="text-white">Active (Instantly)</strong>
                </div>
                <div className="p-3 bg-white/[0.01] border border-white/[0.03] rounded-xl">
                  <span className="text-slate-500 block">MARGIN RE-ROUTING IMPACT</span>
                  <strong className="text-emerald-400">Optimizing +4.8% spread</strong>
                </div>
                <div className="p-3 bg-white/[0.01] border border-white/[0.03] rounded-xl">
                  <span className="text-slate-500 block">SLA BREACH PROBABILITY</span>
                  <span className="text-emerald-500 font-bold">0.00% (Fully Guarded)</span>
                </div>
              </div>
            </div>

            {/* Advanced Historic Analytics Engine */}
            <HistoricalAnalytics />

          </div>

          {/* Ledger Flow Sidebar (4 Cols) */}
          <div className="lg:col-span-4">
            <WalletFlowVisual />
          </div>

        </div>
      )}

      {/* VIEW C: TENANT CLUSTERS TAB */}
      {activeTab === 'tenants' && (
        <div className="space-y-8">
          
          {/* Active Tenant Intelligence & Risk Analytics Engine */}
          <TenantIntelligence />
          
          {/* Tenant lists & Reseller statistics index */}
          <div className="bg-[#04060c] border border-white/[0.04] rounded-2xl p-6">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 border-b border-white/[0.04] pb-4">
              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  Tenant Virtual Clusters & Webhook Callback Metrics
                </h3>
                <p className="text-[11px] text-slate-500">Distribution segments operating white-labeled storefront interfaces from downstream reseller hubs.</p>
              </div>

              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                ACTIVE MULTI-TENANTS: <strong className="text-white">{activeNodes.toLocaleString()} SECURE</strong>
              </span>
            </div>

            {/* Tenant Search & Filter controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 p-3 bg-slate-950/40 rounded-xl border border-white/[0.02]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTenantQuery}
                  onChange={(e) => setSearchTenantQuery(e.target.value)}
                  placeholder="Search by Tenant Name or Webhook url..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-white/5 rounded-lg text-[11px] font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
                {searchTenantQuery && (
                  <button 
                    onClick={() => setSearchTenantQuery("")}
                    className="absolute right-2.5 top-1/12 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest pl-1 shrink-0">ANCHOR REGION:</span>
                <select
                  value={regionTenantFilter}
                  onChange={(e) => setRegionTenantFilter(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-950 border border-white/5 rounded-lg text-[11px] font-mono text-white focus:outline-none focus:border-blue-500/40"
                >
                  <option value="ALL">ALL HOSTED REGIONS</option>
                  <option value="APAC">APAC (Singapore / Tokyo)</option>
                  <option value="EU">EU (Frankfurt)</option>
                  <option value="SA">SA (Brazil)</option>
                  <option value="US">US (Dallas / East-Backbone)</option>
                </select>
              </div>
            </div>

            {/* Render conditional list */}
            {(() => {
              const tenantsDb = [
                { name: 'Apex Esports Esports Ind.', region: 'APAC-SGP-CENTRAL #01', resellers: 124, dailyVolume: 12240, healthRate: 99.98, activeWebhook: 'https://api.apexindo.id/callback' },
                { name: 'GamerVoucher European Hub', region: 'EU-FRANK-EDGE #04', resellers: 842, dailyVolume: 49120, healthRate: 99.99, activeWebhook: 'https://payout.gamervoucher.de/webhook' },
                { name: 'Sumatra Diamond Stores Alliance', region: 'APAC-SGP-CENTRAL #12', resellers: 88, dailyVolume: 8400, healthRate: 99.85, activeWebhook: 'https://sumatra.id/gateways/hook' },
                { name: 'Rio de Janeiro Arena Coins', region: 'SA-BRAZIL-EDGE #02', resellers: 219, dailyVolume: 14890, healthRate: 99.92, activeWebhook: 'https://rio-coins.com.br/api/callback' },
                { name: 'Tokyo Apex Wholesaler Alliance', region: 'APAC-TOKYO-EDGE #01', resellers: 482, dailyVolume: 110430, healthRate: 100.00, activeWebhook: 'https://apex-wholesale.co.jp/callback' },
                { name: 'Dallas Gaming Network Corp', region: 'US-EAST-BACKBONE #05', resellers: 1084, dailyVolume: 242000, healthRate: 99.98, activeWebhook: 'https://dallas-gaming.net/hooks/orders' }
              ];

              const filteredTenants = tenantsDb.filter(node => {
                const query = searchTenantQuery.toLowerCase();
                const matchesSearch = node.name.toLowerCase().includes(query) || 
                                      node.activeWebhook.toLowerCase().includes(query);
                
                let matchesRegion = true;
                if (regionTenantFilter !== "ALL") {
                  matchesRegion = node.region.includes(regionTenantFilter);
                }
                return matchesSearch && matchesRegion;
              });

              if (filteredTenants.length === 0) {
                return (
                  <div className="py-14 border border-white/[0.02] bg-[#020305]/40 rounded-xl flex flex-col items-center justify-center text-center max-w-lg mx-auto p-6 space-y-4 my-2">
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 shadow-sm animate-pulse">
                      <Users className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white tracking-tight font-sans">No Tenant Clusters Match Filters</h4>
                      <p className="text-[11px] text-slate-400 max-w-sm leading-relaxed">
                        The virtual network clusters are active, but no micro-instances match the active query profiles or region selectors.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <button 
                        onClick={() => { setSearchTenantQuery(""); setRegionTenantFilter("ALL"); }}
                        className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[10px] font-mono font-bold uppercase text-white flex items-center gap-1.5 transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                        Clear Filter Profile
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-white/[0.04] text-[10px] uppercase text-slate-500 tracking-wider font-mono">
                        <th className="pb-3 px-3">Ecosystem Tenant Name</th>
                        <th className="pb-3 px-3">Anchor Sub-Node</th>
                        <th className="pb-3 px-3">Active Account Groups</th>
                        <th className="pb-3 px-3">Accumulated Payout GMV</th>
                        <th className="pb-3 px-3">Webhook Status</th>
                        <th className="pb-3 px-3 text-right">Cluster Health</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02] text-xs font-mono text-slate-300">
                      {filteredTenants.map((nodeObj, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.01] transition-colors group">
                          <td className="py-3.5 px-3">
                            <span className="text-white font-sans font-bold block">{nodeObj.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono mt-0.5">{nodeObj.activeWebhook}</span>
                          </td>
                          <td className="py-3.5 px-3 text-slate-400 font-semibold text-[11px]">
                            {nodeObj.region}
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="text-white font-bold">{nodeObj.resellers} Resellers</span>
                            <span className="text-[9px] text-slate-500 block">Tier-assigned groups</span>
                          </td>
                          <td className="py-3.5 px-3 font-mono text-emerald-400 font-bold text-[11px]">
                            ${nodeObj.dailyVolume.toLocaleString()}.00
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="text-emerald-400 text-[10px] flex items-center gap-1 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                              24ms Average
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans font-bold uppercase">
                              {nodeObj.healthRate}% OPTIMAL
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
            
            <div className="mt-4 pt-4 border-t border-white/[0.04] text-center">
              <button className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center justify-center gap-2 mx-auto transition-colors">
                Configure Global Sub-Domain Provisioning Templates
                <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
              </button>
            </div>
          </div>

        </div>
      )}
      
      {/* 5. IMMERSIVE COMPLIANCE INFRASTRUCTURE FOOTER */}
      <div className="bg-[#04060c] border border-white/[0.04] rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 font-mono">
        <div className="flex items-center gap-2">
          <span>OPERATIONAL SYSTEM SECURE ARCHITECTURE v4.12_</span>
          <span className="w-1 h-3 bg-slate-800" />
          <span className="text-blue-400">SOVEREIGN LEDGER POOL TRUST</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span>Active Session Clear: </span>
          <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase select-none">
            ENCRYPTED (AES-256-GCM)
          </span>
        </div>
      </div>

    </div>
  );
};
