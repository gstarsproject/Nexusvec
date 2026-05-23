import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  OperationalIncident, 
  ProviderTrustScore, 
  TenantIntel, 
  HistoricalMetricPoint, 
  EcosystemTimelineEntry, 
  ExecutiveInsight 
} from '../modules/Intelligence/types';

interface OperationalIntelligenceContextType {
  systemHealth: number;
  rollingGmv: number;
  rollingRevenue: number;
  activeNodes: number;
  wholesaleSla: number;
  routingVelocity: number;
  queueLatencyMs: number;
  isHighLoadActive: boolean;
  isPingingUpstreams: boolean;
  
  historicalMetrics: HistoricalMetricPoint[];
  incidents: OperationalIncident[];
  providerTrust: ProviderTrustScore[];
  tenantIntel: TenantIntel[];
  timelineEntries: EcosystemTimelineEntry[];
  executiveInsights: ExecutiveInsight[];
  
  // Simulation & Trigger Actions (Ecosystem Interconnectivity)
  triggerSimulationIncident: (type: 'FIBER_CUT' | 'GATEWAY_DEGRADATION' | 'ROUTING_RETRY_STORM' | 'AUDIT_MISMATCH') => void;
  resolveActiveIncident: (id: string, notes?: string) => void;
  injectManualTransaction: (tenantName?: string, itemVolume?: number) => void;
  triggerHighLoadState: () => void;
  pingUpstreamNodes: () => Promise<void>;
  updateSupplierSlaOverride: (supplierId: string, isHealthy: boolean) => void;
  updateEscrowBalances: (digiflazz: number, codashop: number) => void;
  resetTelemetryEcosystem: () => void;
  dismissInsight: (id: string) => void;
}

const STORAGE_KEY = 'NEXUSCORE_INTELLIGENCE_LAYER_V2';

// 1. Pristine baseline seed data for financial, infrastructure, and node history
const INITIAL_HISTORICAL_METRICS: HistoricalMetricPoint[] = [
  { date: 'May 15', systemHealth: 99.99, routingPerformance: 235, fulfillmentStability: 99.98, settlementVelocitySec: 1.12, supplierSla: 99.99, marginSpread: 4.82, operationalCostUSD: 1420, totalThroughput: 338400 },
  { date: 'May 16', systemHealth: 99.98, routingPerformance: 240, fulfillmentStability: 99.99, settlementVelocitySec: 1.08, supplierSla: 99.98, marginSpread: 4.90, operationalCostUSD: 1530, totalThroughput: 345600 },
  { date: 'May 17', systemHealth: 99.95, routingPerformance: 228, fulfillmentStability: 99.94, settlementVelocitySec: 1.45, supplierSla: 99.92, marginSpread: 4.75, operationalCostUSD: 1610, totalThroughput: 328000 },
  { date: 'May 18', systemHealth: 99.99, routingPerformance: 245, fulfillmentStability: 99.98, settlementVelocitySec: 1.10, supplierSla: 99.99, marginSpread: 5.12, operationalCostUSD: 1490, totalThroughput: 352800 },
  { date: 'May 19', systemHealth: 99.92, routingPerformance: 260, fulfillmentStability: 99.88, settlementVelocitySec: 1.82, supplierSla: 99.85, marginSpread: 4.60, operationalCostUSD: 1820, totalThroughput: 374000 },
  { date: 'May 20', systemHealth: 99.98, routingPerformance: 251, fulfillmentStability: 99.97, settlementVelocitySec: 1.21, supplierSla: 99.96, marginSpread: 4.88, operationalCostUSD: 1510, totalThroughput: 361400 },
  { date: 'May 21', systemHealth: 99.99, routingPerformance: 242, fulfillmentStability: 99.99, settlementVelocitySec: 1.18, supplierSla: 99.98, marginSpread: 4.92, operationalCostUSD: 1430, totalThroughput: 368000 },
];

const INITIAL_PROVIDERS_TRUST: ProviderTrustScore[] = [
  { 
    id: 'digiflazz', 
    name: 'Digiflazz Core', 
    trustScore: 99.7, 
    grade: 'A+', 
    slaCompliance: 99.98, 
    latencyConsistency: 98.4, 
    fulfillmentReliability: 99.98, 
    failureFrequency30d: 1, 
    recoveryEfficiencyMinutes: 4, 
    status: 'OPTIMAL',
    recommendation: 'Allocated as primary APAC clearing partner. Retain 55% liquidity distribution.' 
  },
  { 
    id: 'codashop', 
    name: 'Codashop APAC', 
    trustScore: 98.9, 
    grade: 'A', 
    slaCompliance: 99.95, 
    latencyConsistency: 96.2, 
    fulfillmentReliability: 99.92, 
    failureFrequency30d: 2, 
    recoveryEfficiencyMinutes: 8, 
    status: 'OPTIMAL',
    recommendation: 'Allocated as secondary regional failover. Retain 35% fallback liquidity allocation.' 
  },
  { 
    id: 'razer', 
    name: 'Razer Gold Network', 
    trustScore: 95.2, 
    grade: 'B', 
    slaCompliance: 99.82, 
    latencyConsistency: 92.8, 
    fulfillmentReliability: 99.78, 
    failureFrequency30d: 5, 
    recoveryEfficiencyMinutes: 14, 
    status: 'STEADY',
    recommendation: 'High-cost alternative with stable global latency. Maintain escrow floor above $10,000 for standard SKU support.' 
  },
  { 
    id: 'unipin', 
    name: 'UniPin Global Node', 
    trustScore: 82.4, 
    grade: 'C', 
    slaCompliance: 98.45, 
    latencyConsistency: 81.1, 
    fulfillmentReliability: 98.88, 
    failureFrequency30d: 12, 
    recoveryEfficiencyMinutes: 28, 
    status: 'OPTIMAL',
    recommendation: 'Undergoing periodic route degradation. Prioritize intelligent autonomous bypass filters.' 
  }
];

const INITIAL_TENANT_INTEL: TenantIntel[] = [
  { id: 't-1', name: 'GamerVoucher European Hub', region: 'EU-FRANK-EDGE #04', resellersCount: 842, accumulatedGmv: 49120, churnProbability: 3.2, onboardingVelocityDays: 4.5, infrastructureUsageScore: 84, operationalHealthScore: 99.99, growthProjection: 18.5, riskIndicator: 'NONE', riskNotes: 'Top performer. Perfect ledger compliance. Seamless multi-currency payouts configured.', efficiencyMetric: 99.2 },
  { id: 't-2', name: 'Dallas Gaming Network Corp', region: 'US-EAST-BACKBONE #05', resellersCount: 1084, accumulatedGmv: 24200, churnProbability: 4.8, onboardingVelocityDays: 6.2, infrastructureUsageScore: 91, operationalHealthScore: 99.98, growthProjection: 24.1, riskIndicator: 'NONE', riskNotes: 'Primary enterprise volume consumer. High cache hit ratio (94.2%).', efficiencyMetric: 98.8 },
  { id: 't-3', name: 'Apex Esports Esports Ind.', region: 'APAC-SGP-CENTRAL #01', resellersCount: 124, accumulatedGmv: 12240, churnProbability: 8.5, onboardingVelocityDays: 3.1, infrastructureUsageScore: 42, operationalHealthScore: 99.94, growthProjection: 12.8, riskIndicator: 'LOW', riskNotes: 'Stable. Reseller pool expanded by 12% in last 14 days.', efficiencyMetric: 94.5 },
  { id: 't-4', name: 'Rio de Janeiro Arena Coins', region: 'SA-BRAZIL-EDGE #02', resellersCount: 219, accumulatedGmv: 14890, churnProbability: 14.2, onboardingVelocityDays: 8.4, infrastructureUsageScore: 68, operationalHealthScore: 99.92, growthProjection: 8.2, riskIndicator: 'LOW', riskNotes: 'Slight latency issues on local webhook callbacks. Check node B2 edge routing.', efficiencyMetric: 88.4 },
  { id: 't-5', name: 'Sumatra Diamond Stores Alliance', region: 'APAC-SGP-CENTRAL #12', resellersCount: 88, accumulatedGmv: 8400, churnProbability: 28.6, onboardingVelocityDays: 12.0, infrastructureUsageScore: 35, operationalHealthScore: 98.85, growthProjection: -4.5, riskIndicator: 'MEDIUM', riskNotes: 'Affected by UniPin uplink outages. 4 incident manual fallbacks required this month.', efficiencyMetric: 76.2 },
  { id: 't-6', name: 'GamerX Southeast Reseller Inc.', region: 'APAC-TOKYO-EDGE #01', resellersCount: 240, accumulatedGmv: 19800, churnProbability: 35.1, onboardingVelocityDays: 14.5, infrastructureUsageScore: 78, operationalHealthScore: 94.20, growthProjection: -12.2, riskIndicator: 'HIGH', riskNotes: 'High failure rates tracked on instant settlement triggers. Accounts flagged for compliance audit.', efficiencyMetric: 61.8 }
];

const INITIAL_TIMELINE_ENTRIES: EcosystemTimelineEntry[] = [
  { id: 'time-1', timestamp: '12:50:11 GMT', type: 'ROUTING', title: 'Autonomous Path Clearance Shift', description: 'Steam-20 and Valorant SKUs rerouted from UniPin to Codashop APAC following latency variance.', severity: 'success', operator: 'NexusCore Autopilot' },
  { id: 'time-2', timestamp: '12:44:35 GMT', type: 'DEPLOYMENT', title: 'Dynamic Sub-Instance Spanned', description: 'Deployed EU-FRANK-EDGE micro-instances #89 to handle traffic burst from downstream resellers.', severity: 'info', operator: 'SysOps Warden' },
  { id: 'time-3', timestamp: '12:35:10 GMT', type: 'AUDIT', title: 'Zero-Knowledge Ledger Synchronization', description: 'Reconciled escrow assets of $481k. Multi-party digital signatures matched perfectly.', severity: 'success', operator: 'Ledger Guard' },
  { id: 'time-4', timestamp: '11:58:22 GMT', type: 'UPGRADE', title: 'Mutual TLS Keys Rotated', description: 'Automated 84 tenant micro-instances TLS cryptographic certificate re-key. Duration: 142ms.', severity: 'info', operator: 'Security Sentinel' },
  { id: 'time-5', timestamp: '11:12:05 GMT', type: 'SYNC', title: 'SLA Gateway Probe Completed', description: 'Multi-region supplier endpoint latency verified under 100ms benchmark parameters.', severity: 'success', operator: 'Global Overseer' }
];

const INITIAL_EXECUTIVE_INSIGHTS: ExecutiveInsight[] = [
  { id: 'ins-1', type: 'PERFORMANCE', severity: 'OPTIMAL', text: 'Regional traffic patterns confirm high cash reserve efficiency. Overall routing velocity is maintained within normal SLAs.', timestamp: '10m ago' },
  { id: 'ins-2', type: 'ANOMALY', severity: 'SUGGESTION', text: 'Supplier UniPin latency consistency degraded by 8.4% in the last 24h. Autopilot has pre-emptively reduced its routing weight in Singapore Core by 15%.', timestamp: '30m ago' },
  { id: 'ins-3', type: 'FINANCIAL', severity: 'OPTIMAL', text: 'Settlement velocity achieved historic high of 1.08s average matching rate, bolstering intra-day credit line clearance.', timestamp: '1h ago' },
  { id: 'ins-4', type: 'GROWTH', severity: 'SUGGESTION', text: 'Tenant expansion in Dallas Gaming Network represents 42% of US-East backbone consumption. Recommend expanding node bandwidth allotments by 200MB/s.', timestamp: '3h ago' }
];

const INITIAL_HISTORICAL_INCIDENTS: OperationalIncident[] = [
  {
    id: 'inc-old-1',
    title: 'Tokyo Fiber Link Backhaul Interruption',
    description: 'A physical fiber cut on the regional undersea cable caused high transit loss between Frankfurt and APAC hubs.',
    severity: 'SEV_1_CRITICAL',
    affectedSystems: ['Tokyo Hub Route Router', 'Frankfurt Edge Tunnel'],
    status: 'RESOLVED',
    timestamp: '2026-05-20T08:12:00Z',
    resolvedAt: '2026-05-20T10:48:00Z',
    recoveryDurationMinutes: 156,
    operationalNotes: 'Upstream backup routing enabled via Trans-West backup trunk. Dynamic route tables updated. Physical transits repaired.'
  },
  {
    id: 'inc-old-2',
    title: 'Upstream Razer Gateway Timeout Sync Storm',
    description: 'Internal payment verification timeout at Razer network resulted in 8% order delays.',
    severity: 'SEV_3_DEGRADED',
    affectedSystems: ['Razer Gold Clearing Network'],
    status: 'RESOLVED',
    timestamp: '2026-05-19T22:15:00Z',
    resolvedAt: '2026-05-19T22:52:00Z',
    recoveryDurationMinutes: 37,
    operationalNotes: 'Codashop endpoint fallback acted as buffer. Razer resolved its queue storm. System is stable.'
  }
];

const OperationalIntelligenceContext = createContext<OperationalIntelligenceContextType | undefined>(undefined);

export const OperationalIntelligenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- CORE LIVING STATE ---
  const [systemHealth, setSystemHealth] = useState(99.98);
  const [rollingGmv, setRollingGmv] = useState(4812490.22);
  const [rollingRevenue, setRollingRevenue] = useState(187424.55);
  const [activeNodes, setActiveNodes] = useState(2842);
  const [wholesaleSla, setWholesaleSla] = useState(99.986);
  const [routingVelocity, setRoutingVelocity] = useState(242);
  const [queueLatencyMs, setQueueLatencyMs] = useState(1.18);
  const [isHighLoadActive, setIsHighLoadActive] = useState(false);
  const [isPingingUpstreams, setIsPingingUpstreams] = useState(false);

  // --- PERSISTENT DATA TABLES ---
  const [historicalMetrics, setHistoricalMetrics] = useState<HistoricalMetricPoint[]>(INITIAL_HISTORICAL_METRICS);
  const [incidents, setIncidents] = useState<OperationalIncident[]>(INITIAL_HISTORICAL_INCIDENTS);
  const [providerTrust, setProviderTrust] = useState<ProviderTrustScore[]>(INITIAL_PROVIDERS_TRUST);
  const [tenantIntel, setTenantIntel] = useState<TenantIntel[]>(INITIAL_TENANT_INTEL);
  const [timelineEntries, setTimelineEntries] = useState<EcosystemTimelineEntry[]>(INITIAL_TIMELINE_ENTRIES);
  const [executiveInsights, setExecutiveInsights] = useState<ExecutiveInsight[]>(INITIAL_EXECUTIVE_INSIGHTS);

  // --- SAVE & LOAD FROM STORAGE ---
  useEffect(() => {
    try {
      const persisted = localStorage.getItem(STORAGE_KEY);
      if (persisted) {
        const parsed = JSON.parse(persisted);
        if (parsed.systemHealth !== undefined) setSystemHealth(parsed.systemHealth);
        if (parsed.rollingGmv !== undefined) setRollingGmv(parsed.rollingGmv);
        if (parsed.rollingRevenue !== undefined) setRollingRevenue(parsed.rollingRevenue);
        if (parsed.activeNodes !== undefined) setActiveNodes(parsed.activeNodes);
        if (parsed.wholesaleSla !== undefined) setWholesaleSla(parsed.wholesaleSla);
        if (parsed.routingVelocity !== undefined) setRoutingVelocity(parsed.routingVelocity);
        if (parsed.queueLatencyMs !== undefined) setQueueLatencyMs(parsed.queueLatencyMs);
        if (parsed.historicalMetrics) setHistoricalMetrics(parsed.historicalMetrics);
        if (parsed.incidents) setIncidents(parsed.incidents);
        if (parsed.providerTrust) setProviderTrust(parsed.providerTrust);
        if (parsed.tenantIntel) setTenantIntel(parsed.tenantIntel);
        if (parsed.timelineEntries) setTimelineEntries(parsed.timelineEntries);
        if (parsed.executiveInsights) setExecutiveInsights(parsed.executiveInsights);
      }
    } catch (e) {
      console.warn("Could not read intelligence store from localStorage", e);
    }
  }, []);

  const saveToStorage = useCallback((updates: any) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const current = raw ? JSON.parse(raw) : {};
      const next = { ...current, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn("Could not write operational memory to localStorage", e);
    }
  }, []);

  // Sync core numbers state changes immediately to local storage wrapper
  useEffect(() => {
    saveToStorage({
      systemHealth,
      rollingGmv,
      rollingRevenue,
      activeNodes,
      wholesaleSla,
      routingVelocity,
      queueLatencyMs,
      historicalMetrics,
      incidents,
      providerTrust,
      tenantIntel,
      timelineEntries,
      executiveInsights
    });
  }, [
    systemHealth,
    rollingGmv,
    rollingRevenue,
    activeNodes,
    wholesaleSla,
    routingVelocity,
    queueLatencyMs,
    historicalMetrics,
    incidents,
    providerTrust,
    tenantIntel,
    timelineEntries,
    executiveInsights,
    saveToStorage
  ]);

  // Helper timeline logger
  const logToTimeline = useCallback((
    type: EcosystemTimelineEntry['type'], 
    title: string, 
    description: string, 
    severity: EcosystemTimelineEntry['severity']
  ) => {
    const timeStr = new Date().toTimeString().split(' ')[0] + ' GMT';
    const nextItem: EcosystemTimelineEntry = {
      id: `time-${Date.now()}`,
      timestamp: timeStr,
      type,
      title,
      description,
      severity,
      operator: 'NexusCore Autopilot'
    };
    setTimelineEntries(prev => [nextItem, ...prev.slice(0, 24)]);
  }, []);

  // --- INTERACTION FLOW: TRIGGER AN ECOSYSTEM INCIDENT (Stateful Interconnectivity) ---
  const triggerSimulationIncident = useCallback((type: 'FIBER_CUT' | 'GATEWAY_DEGRADATION' | 'ROUTING_RETRY_STORM' | 'AUDIT_MISMATCH') => {
    // Generate incident data object
    const id = `inc-${Date.now()}`;
    let incidentTitle = "";
    let incidentDesc = "";
    let affected: string[] = [];
    let severityLevel: OperationalIncident['severity'] = 'SEV_2_WARNING';
    
    switch(type) {
      case 'FIBER_CUT':
        incidentTitle = "Tokyo-Singapore Trans-Pacific Undersea Underlink Disruption";
        incidentDesc = "Dynamic fiber trace metrics show a physical laser refraction loss. Packet drops spike over 12% across primary routes.";
        affected = ["Tokyo Gateway Sub-Node #01", "UniPin Hub Route Aggregator"];
        severityLevel = 'SEV_1_CRITICAL';
        break;
      case 'GATEWAY_DEGRADATION':
        incidentTitle = "Codashop Clearing Core Outage / Timeout Spike";
        incidentDesc = "Upstream provider handshakes are timing out at a rate of 11.4%. Automatic routing latency buffer triggered.";
        affected = ["Codashop Singapore Edge Tunnel", "Fulfillment Ledger Broker"];
        severityLevel = 'SEV_2_WARNING';
        break;
      case 'ROUTING_RETRY_STORM':
        incidentTitle = "SLA Queue Accumulation / Settlement Retry Storm";
        incidentDesc = "Anomalously high volume from reseller Gamervoucher Europe caused micro-queue locks, escalating average latency.";
        affected = ["Mutual Multi-Tenant Queue Dispatcher", "API Gatekeeper Throttle"];
        severityLevel = 'SEV_3_DEGRADED';
        break;
      case 'AUDIT_MISMATCH':
        incidentTitle = "Intra-Day Sovereign Ledger Audit Signature Interrupt";
        incidentDesc = "Daily escrow clearance triggered an automatic hold. Cryptographical hash mismatches resolved by holding pending payouts.";
        affected = ["Sovereign Reserve Wallet Ledger", "ZKP Verification Agent"];
        severityLevel = 'SEV_3_DEGRADED';
        break;
    }

    const newIncident: OperationalIncident = {
      id,
      title: incidentTitle,
      description: incidentDesc,
      severity: severityLevel,
      affectedSystems: affected,
      status: 'ACTIVE',
      timestamp: new Date().toISOString(),
      resolvedAt: null,
      recoveryDurationMinutes: null,
      operationalNotes: "Autopilot is monitoring telemetry patterns. Traffic shifts actively bypassing affected node clusters."
    };

    setIncidents(prev => [newIncident, ...prev]);

    // -- Interconnectivity effects --
    // 1. Lower global system health
    const healthPen = severityLevel === 'SEV_1_CRITICAL' ? 12.82 : severityLevel === 'SEV_2_WARNING' ? 4.50 : 2.15;
    setSystemHealth(prev => Math.max(82.5, Number((prev - healthPen).toFixed(2))));
    
    // 2. Degrade corresponding suppliers
    setProviderTrust(prev => prev.map(p => {
      if (type === 'FIBER_CUT' && p.id === 'unipin') {
        return {
          ...p,
          trustScore: Math.max(45, Number((p.trustScore - 24.5).toFixed(1))),
          status: 'OFFLINE',
          failureFrequency30d: p.failureFrequency30d + 1,
          recommendation: 'CRITICAL WARNING: Undersea fiber link cut active. Reroute 100% of APAC traffic.'
        };
      }
      if (type === 'GATEWAY_DEGRADATION' && p.id === 'codashop') {
        return {
          ...p,
          trustScore: Math.max(65, Number((p.trustScore - 14.2).toFixed(1))),
          status: 'DEGRADED',
          failureFrequency30d: p.failureFrequency30d + 1,
          recommendation: 'WARNING: Transaction handshakes degrading. Prioritize Digiflazz for current batch clearances.'
        };
      }
      return p;
    }));

    // 3. Degrade specific regional tenant scores
    setTenantIntel(prev => prev.map(t => {
      if (type === 'FIBER_CUT' && t.id === 't-5') {
        // Sumatra Store suffers from UniPin cut
        return {
          ...t,
          operationalHealthScore: Number((t.operationalHealthScore - 12.4).toFixed(2)),
          riskIndicator: 'HIGH',
          riskNotes: 'Impacted heavily by active UniPin backbone fiber cut.'
        };
      }
      if (type === 'GATEWAY_DEGRADATION' && t.id === 't-1') {
        // GamerVoucher European Hub
        return {
          ...t,
          operationalHealthScore: Number((t.operationalHealthScore - 4.1).toFixed(2)),
          riskIndicator: 'LOW'
        };
      }
      return t;
    }));

    // 4. Update core metrics of interest
    setWholesaleSla(prev => Math.max(99.12, prev - (healthPen * 0.05)));
    setQueueLatencyMs(prev => Number((prev + (healthPen * 0.35)).toFixed(2)));

    // 5. Emit dynamic timeline logs
    logToTimeline(
      'INCIDENT', 
      `SEV EVENT DETECTED: [${severityLevel.replace(/_/g, " ")}]`, 
      incidentTitle, 
      severityLevel === 'SEV_1_CRITICAL' ? 'critical' : 'warn'
    );

    // 6. Generate dynamic executive warnings
    const nextInsight: ExecutiveInsight = {
      id: `ins-${Date.now()}`,
      type: 'ANOMALY',
      severity: severityLevel === 'SEV_1_CRITICAL' ? 'WARNING' : 'SUGGESTION',
      text: `ACTIVE INCIDENT: ${incidentTitle}. System health impacted by -${healthPen}%. Autonomous bypass engaged.`,
      timestamp: 'Just now'
    };
    setExecutiveInsights(prev => [nextInsight, ...prev.slice(0, 10)]);

  }, [logToTimeline]);

  // --- RESOLVE INCIDENT (Interconnected recovery loop) ---
  const resolveActiveIncident = useCallback((id: string, notes = "") => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        const resolvedStamp = new Date().toISOString();
        const start = new Date(inc.timestamp).getTime();
        const end = new Date(resolvedStamp).getTime();
        const durationMin = Math.round((end - start) / 60000) || 1; // round to minutes, min 1m
        return {
          ...inc,
          status: 'RESOLVED',
          resolvedAt: resolvedStamp,
          recoveryDurationMinutes: durationMin,
          operationalNotes: notes || `Manual resolve request initiated by System Operator. Affected clusters verified healthy. Recovered in ${durationMin}m.`
        };
      }
      return inc;
    }));

    // Fetch the resolved incident to apply state recovery rules
    const target = incidents.find(i => i.id === id);
    if (!target) return;

    // Bring health back up
    setSystemHealth(prev => Math.min(99.99, Number((prev + (99.98 - prev) * 0.75 + 1.5).toFixed(2))));
    setWholesaleSla(prev => Math.min(99.992, prev + 0.03));
    setQueueLatencyMs(prev => Math.max(1.10, Number((prev * 0.5 + 0.5).toFixed(2))));

    // Recover suppliers trust scores slightly
    setProviderTrust(prev => prev.map(p => {
      if (p.status === 'OFFLINE' || p.status === 'DEGRADED') {
        const prevTrust = p.trustScore;
        const newTrust = Math.min(99.9, Number((prevTrust + (99.0 - prevTrust) * 0.8 + 2).toFixed(1)));
        return {
          ...p,
          trustScore: newTrust,
          status: 'OPTIMAL',
          recommendation: `Node fully cleared and re-verified. Resuming standard auto-routing weights.`
        };
      }
      return p;
    }));

    // Reset tenant indicators
    setTenantIntel(prev => prev.map(t => {
      if (t.riskIndicator === 'HIGH' || t.riskIndicator === 'MEDIUM') {
        return {
          ...t,
          operationalHealthScore: Math.min(99.99, Number((t.operationalHealthScore + 5).toFixed(2))),
          riskIndicator: 'LOW',
          riskNotes: 'System recovered. Minor local packet sync lags being re-evaluated.'
        };
      }
      return t;
    }));

    // Log recovery
    logToTimeline('RECOVERY', `INCIDENT RECOVERED: ${target.title}`, `Systems restored and verified under standard SLA bounds in ${notes ? 'manual mode' : 'autopilot mode'}.`, 'success');

    // Add active informational alert
    const recoveryTip: ExecutiveInsight = {
      id: `ins-${Date.now()}`,
      type: 'STABILITY',
      severity: 'OPTIMAL',
      text: `RECOVERY SECURED: Undersea tunnels and dispatch protocols stabilized. System latency metrics successfully dropped back to normal levels.`,
      timestamp: 'A moment ago'
    };
    setExecutiveInsights(prev => [recoveryTip, ...prev.slice(0, 10)]);

  }, [incidents, logToTimeline]);

  // --- MANUAL TRANSACTION INJECTION: Feeds financial records and increments GMV ---
  const injectManualTransaction = useCallback((tenantName?: string, itemVolume?: number) => {
    const defaultTenants = ["GamerVoucher European Hub", "Dallas Gaming Network Corp", "Apex Esports Esports Ind.", "Rio de Janeiro Arena Coins", "Sumatra Diamond Stores Alliance"];
    const luckyTenant = tenantName || defaultTenants[Math.floor(Math.random() * defaultTenants.length)];
    const price = itemVolume || Number((5 + Math.random() * 95).toFixed(2));
    const profitRate = 3.5 + Math.random() * 3; // 3.5% - 6.5% margin
    const addedProfit = price * (profitRate / 100);

    // Shift metrics
    setRollingGmv(prev => Number((prev + price).toFixed(2)));
    setRollingRevenue(prev => Number((prev + addedProfit).toFixed(2)));
    setRoutingVelocity(prev => Math.min(480, prev + 1));

    // Update 30 day accumulation of affected tenant intel
    setTenantIntel(prev => prev.map(t => {
      if (t.name === luckyTenant) {
        return {
          ...t,
          accumulatedGmv: Number((t.accumulatedGmv + price).toFixed(2)),
          efficiencyMetric: Math.min(100, Number((t.efficiencyMetric + 0.05).toFixed(1)))
        };
      }
      return t;
    }));

    // Trigger timeline verification audit every once in a while
    if (Math.random() > 0.8) {
      logToTimeline(
        'AUDIT', 
        `Voucher Batch Clearance Audit`, 
        `Secured standard cryptographic clearance sequence for voucher item transacted by ${luckyTenant}. Hash verified: MATCHED.`, 
        'success'
      );
    }
  }, [logToTimeline]);

  // --- HIGH LOAD STATE BURST SIMULATOR ---
  const triggerHighLoadState = useCallback(() => {
    if (isHighLoadActive) return;
    setIsHighLoadActive(true);

    // Temporarily elevate traffic stats
    setRoutingVelocity(492);
    setQueueLatencyMs(2.78);
    
    // Reroute specific metrics
    logToTimeline(
      'TRAFFIC',
      'Dynamic Regional Traffic Burst Detected',
      'Fulfillment queues experienced sudden SLA load escalation (+140% surge). Direct routing nodes successfully balancing workloads across global edges.',
      'warn'
    );

    // Interconnect with temporary supplier saturation
    setProviderTrust(prev => prev.map(p => {
      if (p.id === 'unipin') {
        return { ...p, status: 'DEGRADED', latencyConsistency: 74.2 };
      }
      return p;
    }));

    setTimeout(() => {
      setIsHighLoadActive(false);
      setRoutingVelocity(244);
      setQueueLatencyMs(1.18);
      
      logToTimeline(
        'SYNC',
        'Load Balancing Buffer Cleared',
        'Burst queues processed successfully. System telemetry returned to standard baseline performance parameters.',
        'success'
      );

      setProviderTrust(prev => prev.map(p => {
        if (p.id === 'unipin') {
          return { ...p, status: 'OPTIMAL', latencyConsistency: 81.1 };
        }
        return p;
      }));

    }, 12000);

  }, [isHighLoadActive, logToTimeline]);

  // --- SLA CONNECTION ENDPOINT GATEWAY PROBE PINGER ---
  const pingUpstreamNodes = useCallback(async () => {
    setIsPingingUpstreams(true);
    
    // Wait for mock network response
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Minor variance in metrics
    setProviderTrust(prev => prev.map(p => {
      const delta = (Math.random() - 0.5) * 1.5;
      const nextScore = Math.max(70, Math.min(100, Number((p.trustScore + delta).toFixed(1))));
      return {
        ...p,
        trustScore: nextScore,
        slaCompliance: Math.max(98, Math.min(100, Number((p.slaCompliance + (Math.random() - 0.5) * 0.05).toFixed(4))))
      };
    }));

    logToTimeline(
      'SYNC', 
      'Multi-Region Endpoint Probe Synchronized', 
      'Mutual TLS connections established. Active ping queries cleared across Digiflazz, Codashop, Razer, and UniPin pipelines.', 
      'info'
    );
    
    setIsPingingUpstreams(false);
  }, [logToTimeline]);

  // --- DYNAMIC ESCROW ALLOCATION CONTROLS ---
  const updateEscrowBalances = useCallback((digiflazz: number, codashop: number) => {
    setProviderTrust(prev => prev.map(p => {
      if (p.id === 'digiflazz') {
        return {
          ...p,
          recommendation: `Allocated capital pool at $${digiflazz.toLocaleString()}. Autonomous routing verified standard headroom thresholds.`
        };
      }
      if (p.id === 'codashop') {
        return {
          ...p,
          recommendation: `Allocated capital pool at $${codashop.toLocaleString()}. Overload thresholds secured at 110ms limit bounds.`
        };
      }
      return p;
    }));

    logToTimeline(
      'AUDIT', 
      'Capital Escrow Distribution Rebalanced', 
      `Liquid pools adjusted dynamically: Digiflazz ($${digiflazz.toLocaleString()}) | Codashop ($${codashop.toLocaleString()}). Autonomous routing rules updated.`, 
      'info'
    );
  }, [logToTimeline]);

  // --- FORCE OVERRIDE MANUAL SUPPLIER STATUS ---
  const updateSupplierSlaOverride = useCallback((supplierId: string, isHealthy: boolean) => {
    setProviderTrust(prev => prev.map(p => {
      if (p.id === supplierId) {
        return {
          ...p,
          status: isHealthy ? 'OPTIMAL' : 'DEGRADED',
          trustScore: isHealthy ? Math.min(100, p.trustScore + 5) : Math.max(60, p.trustScore - 15)
        };
      }
      return p;
    }));

    logToTimeline(
      'ROUTING',
      `Manual Supplier override initiated`,
      `Supplier ${supplierId} status set manually to ${isHealthy ? 'OPTIMAL' : 'DEGRADED'} by administrative console rules.`,
      isHealthy ? 'success' : 'warn'
    );

  }, [logToTimeline]);

  // --- DISMISS EXECUTIVE WEAK TIPS ---
  const dismissInsight = useCallback((id: string) => {
    setExecutiveInsights(prev => prev.filter(ins => ins.id !== id));
  }, []);

  // --- SYSTEM RESET TO SEED RE-INITIALIZATION ---
  const resetTelemetryEcosystem = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSystemHealth(99.98);
    setRollingGmv(4812490.22);
    setRollingRevenue(187424.55);
    setActiveNodes(2842);
    setWholesaleSla(99.986);
    setRoutingVelocity(242);
    setQueueLatencyMs(1.18);
    setHistoricalMetrics(INITIAL_HISTORICAL_METRICS);
    setIncidents(INITIAL_HISTORICAL_INCIDENTS);
    setProviderTrust(INITIAL_PROVIDERS_TRUST);
    setTenantIntel(INITIAL_TENANT_INTEL);
    setTimelineEntries(INITIAL_TIMELINE_ENTRIES);
    setExecutiveInsights(INITIAL_EXECUTIVE_INSIGHTS);
    
    logToTimeline('SYNC', 'Ecosystem Refreshed', 'Operational memory has been successfully restored to the standard seed enterprise baseline config.', 'info');
  }, [logToTimeline]);

  return (
    <OperationalIntelligenceContext.Provider value={{
      systemHealth,
      rollingGmv,
      rollingRevenue,
      activeNodes,
      wholesaleSla,
      routingVelocity,
      queueLatencyMs,
      isHighLoadActive,
      isPingingUpstreams,
      historicalMetrics,
      incidents,
      providerTrust,
      tenantIntel,
      timelineEntries,
      executiveInsights,
      triggerSimulationIncident,
      resolveActiveIncident,
      injectManualTransaction,
      triggerHighLoadState,
      pingUpstreamNodes,
      updateSupplierSlaOverride,
      updateEscrowBalances,
      resetTelemetryEcosystem,
      dismissInsight
    }}>
      {children}
    </OperationalIntelligenceContext.Provider>
  );
};

export const useOperationalIntelligence = () => {
  const context = useContext(OperationalIntelligenceContext);
  if (context === undefined) {
    throw new Error('useOperationalIntelligence must be used within an OperationalIntelligenceProvider');
  }
  return context;
};
