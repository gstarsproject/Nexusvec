import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PLATFORM_BRANDING } from '../config/branding';
import {
  ArrowRight,
  Layers,
  Database,
  Activity,
  Box,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Terminal,
  Zap,
  Cpu,
  RefreshCw,
  Globe,
  Bot,
  Sparkles,
  TrendingUp,
  Sliders,
  Play,
  Lock,
  Workflow,
  Plus
} from "lucide-react";
import { Link } from "react-router-dom";

// Standard components for the Landing Page
const FeatureCard = ({
  icon: Icon,
  title,
  desc,
  glowColor = "blue",
}: {
  icon: any;
  title: string;
  desc: string;
  glowColor?: "yellow" | "blue" | "cyan";
}) => {
  const glowClasses = {
    yellow: "hover:border-neon-yellow/50 hover:shadow-[0_0_25px_rgba(250,204,21,0.15)]",
    blue: "hover:border-neon-blue/50 hover:shadow-[0_0_25px_rgba(59,130,246,0.15)]",
    cyan: "hover:border-neon-cyan/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]",
  };

  const badgeColors = {
    yellow: "bg-neon-yellow/10 border-neon-yellow/30 text-neon-yellow",
    blue: "bg-neon-blue/10 border-neon-blue/30 text-neon-blue",
    cyan: "bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan",
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={`bg-[#050508]/90 backdrop-blur-xl border border-white/[0.05] p-8 rounded-2xl relative overflow-hidden group transition-all duration-300 ${glowClasses[glowColor]}`}
    >
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:via-white/20 transition-all" />
      
      <div className="w-12 h-12 bg-cyber-black rounded-xl border border-white/[0.06] flex items-center justify-center mb-6 relative">
        <Icon className={`w-5 h-5 ${
          glowColor === 'yellow' ? 'text-neon-yellow' : 
          glowColor === 'cyan' ? 'text-neon-cyan' : 'text-neon-blue'
        }`} />
        <div className="absolute inset-0 bg-white/[0.01] rounded-xl" />
      </div>

      <h3 className="text-xl font-bold text-white mb-3 font-display tracking-tight flex items-center gap-2">
        {title}
      </h3>
      <p className="text-slate-400 leading-relaxed text-sm font-sans">{desc}</p>
    </motion.div>
  );
};

export const LandingPage = () => {
  // System interactive states
  const [activeTab, setActiveTab] = useState<'analytics' | 'uptime' | 'ai-insights'>('analytics');
  const [isOverclocked, setIsOverclocked] = useState(false);
  const [activeUsers, setActiveUsers] = useState(42054);
  const [transactionVolume, setTransactionVolume] = useState(1834128.40);
  const [uptimePercent, setUptimePercent] = useState(99.997);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState(false);
  const [nodeDomain, setNodeDomain] = useState("");
  const [aiPrompts, setAiPrompts] = useState<{role: 'user' | 'system', text: string}[]>([
    { role: 'system', text: "[SYS_BOOT] Nexus AI Sentinel v4.0 is active. Standing by for telemetry parsing..." }
  ]);
  const [interactiveInput, setInteractiveInput] = useState("");
  const [typing, setTyping] = useState(false);

  // Counter simulators based on overclocking
  useEffect(() => {
    const interval = setInterval(() => {
      const multiplier = isOverclocked ? 5 : 1;
      setActiveUsers(prev => prev + Math.floor(Math.random() * 4) * multiplier);
      setTransactionVolume(prev => prev + (Math.random() * 25.50) * multiplier);
      
      // Slight uptime variance
      if (Math.random() > 0.95) {
        setUptimePercent(prev => Math.min(100, Math.max(99.991, prev + (Math.random() * 0.002 - 0.001))));
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [isOverclocked]);

  // Handle Connecting to Node (SaaS launcher test run)
  const handleConnectNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeDomain) return;
    setIsConnecting(true);
    setConnectionSuccess(false);

    setTimeout(() => {
      setIsConnecting(false);
      setConnectionSuccess(true);
      // Append AI log
      setAiPrompts(prev => [
        ...prev,
        { role: 'user', text: `Spin up white-label tenant instance for domain ${nodeDomain}` },
        { role: 'system', text: `[PROV_SUCCESS] Created tenant with 256-bit encryption on APAC mainnet edge.` },
        { role: 'system', text: `[INFO] Routing is operational. SSL certificates issued dynamically.` }
      ]);
    }, 2200);
  };

  // AI Prompt interactions
  const triggerAiResponse = (userText: string, sysReply: string) => {
    if (typing) return;
    setTyping(true);
    setAiPrompts(prev => [...prev, { role: 'user', text: userText }]);
    
    setTimeout(() => {
      setAiPrompts(prev => [...prev, { role: 'system', text: sysReply }]);
      setTyping(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-cyber-black text-slate-300 font-sans selection:bg-neon-yellow/20 selection:text-neon-yellow overflow-x-hidden relative">
      
      {/* Background Neon ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-neon-blue/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[800px] right-1/4 w-[600px] h-[600px] bg-neon-yellow/[0.02] rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[400px] left-10 w-[700px] h-[700px] bg-neon-cyan/[0.04] rounded-full blur-[200px] pointer-events-none" />

      {/* Grid line background and scanlines */}
      <div className="absolute inset-0 cyber-grid pointer-events-none opacity-[0.25]" />
      <div className="absolute inset-0 scanline pointer-events-none opacity-[0.03]" />

      {/* Top Banner indicating status */}
      <div className="w-full bg-[#09090c] border-b border-white/[0.04] py-2 px-6 flex items-center justify-between text-[10px] font-mono font-bold tracking-[0.2em] relative z-50">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-slate-500 uppercase">ALL_SYSTEMS_OPERATIONAL</span>
        </div>
        <div className="flex items-center gap-6 text-slate-400">
          <span>LATENCY // <span className="text-neon-cyan">8MS</span></span>
          <span className="hidden md:inline">SECURITY LEVEL // <span className="text-neon-yellow">MAXIMUM</span></span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 w-full z-40 bg-cyber-black/75 backdrop-blur-xl border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-9 h-9 bg-cyber-black border border-white/10 rounded-xl flex items-center justify-center relative shadow-[0_0_15px_rgba(250,204,21,0.1)] group-hover:border-neon-yellow/30 transition-all duration-300">
              <div className="absolute inset-0.5 rounded-lg bg-gradient-to-br from-neon-yellow to-neon-blue opacity-20 group-hover:opacity-40 transition-opacity" />
              <Layers className="w-4 h-4 text-neon-yellow relative z-10 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white tracking-widest font-display flex items-center gap-1">
                NEXUS<span className="text-neon-yellow">CORE</span>
              </span>
              <span className="text-[8.5px] font-mono tracking-[0.3em] text-slate-500 font-bold uppercase mt-0.5">AI SaaS Core Platform</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-mono font-bold uppercase tracking-wider">
            <a href="#core-metrics" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-neon-cyan" />
              Realtime Telemetry
            </a>
            <a href="#sandbox-dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-neon-yellow" />
              Sentinel AI Engine
            </a>
            <a href="#premium-features" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-neon-blue" />
              Features
            </a>
            <a href="#pricing-matrix" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Licensing
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent rounded-xl transition-all"
            >
              Console_Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-neon-yellow text-black rounded-lg text-xs font-mono font-bold uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(250,204,21,0.25)] flex items-center gap-1.5 active:scale-95"
            >
              Initialize Node <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* SECTION 1: HERO SECTION */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          
          {/* Cyberpunk Launch Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900/50 border border-blue-500/20 backdrop-blur-md rounded-full mb-8 shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:border-blue-500/50 transition-all duration-300 backdrop-blur-xl group cursor-pointer"
          >
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-blue-400 flex items-center gap-1 group-hover:text-blue-300 transition-colors">
              NEXUS WHITE-LABEL ENGINE v5.0 LIVE
            </span>
          </motion.div>

          {/* Epic Cyber Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter mb-8 max-w-6xl mx-auto leading-[0.95]"
          >
            Launch Your Own <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 relative group">
               Top-Up Empire
              <span className="absolute bottom-1 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded opacity-30 group-hover:opacity-75 transition-opacity blur-[2px]" />
            </span>
          </motion.h1>

          {/* Subtext explaining full capability */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-sans px-2"
          >
            The absolute pinnacle of digital goods distribution. Get a complete, fully branded premium game top-up platform out of the box. Fully automated pricing, QRIS/Virtual Account processing, and sub-reseller management. Start monetizing in nanoseconds.
          </motion.p>

          {/* Call-to-actions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
          >
            <Link
              to="/register"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold font-mono text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] transition-all flex items-center justify-center w-full group active:scale-95 border border-white/10"
            >
              LAUNCH PLATFORM NOW
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="https://wa.me/628123456789" // WhatsApp CTA Dummy
              target="_blank"
              rel="noreferrer"
              className="px-8 py-4 bg-slate-900/50 text-slate-300 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400 rounded-xl font-bold font-mono text-xs uppercase tracking-widest transition-all flex items-center justify-center w-full active:scale-95"
            >
              CONTACT SALES / DEMO
            </a>
          </motion.div>

        </div>
      </section>

      {/* SECTION 2: ANIMATED INTERACTIVE DASHBOARD PREVIEW */}
      <section id="sandbox-dashboard" className="max-w-7xl mx-auto px-6 py-12 relative z-20">
        <div className="absolute inset-0 bg-neon-blue/2 opacity-[0.015] blur-3xl pointer-events-none" />

        <div className="text-center mb-12">
          <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-neon-yellow uppercase block mb-3">TELEMETRY_TERMINAL_V4</span>
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">Interactive Cyber Control</h2>
          <p className="text-xs text-slate-400 mt-2 max-w-lg mx-auto">Toggle operational telemetry diagnostics, prompt our sentinel AI model, or simulate a global workload overclock.</p>
        </div>

        {/* Dashboard Box */}
        <div className="bg-[#050508]/95 border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden backdrop-blur-2xl">
          
          {/* Header Chrome Bar */}
          <div className="h-14 bg-cyber-dark/90 border-b border-white/5 flex items-center justify-between px-6">
            <div className="flex items-center gap-1.5">
              <div className="flex gap-1.5 mr-4">
                <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-400" />
              </div>
              <span className="px-2.5 py-1 bg-white/[0.03] rounded border border-white/[0.05] text-[10px] font-mono font-semibold tracking-wider text-slate-400">
                ACTIVE_NODE // <span className="text-neon-cyan">APAC_NET_SINGAPORE</span>
              </span>
            </div>

            {/* Overclock Switcher Component */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 text-[9px] font-mono text-slate-500 font-bold uppercase mr-2">
                <Sliders className="w-3 h-3 text-neon-yellow" />
                Pipeline status:
              </div>
              <button
                onClick={() => setIsOverclocked(!isOverclocked)}
                className={`px-3 py-1.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all outline-none ${
                  isOverclocked 
                    ? "bg-neon-yellow text-black shadow-[0_0_15px_rgba(250,204,21,0.3)] animate-pulse" 
                    : "bg-cyber-gray border border-white/10 text-slate-400 hover:text-white hover:border-white/25"
                }`}
              >
                <Zap className={`w-3.5 h-3.5 ${isOverclocked ? "fill-current animate-bounce" : ""}`} />
                {isOverclocked ? "OVERCLOCKED // 5.0x" : "STABLE // 1.0x"}
              </button>
            </div>
          </div>

          {/* Split Dashboard Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-6 lg:gap-y-0 text-left">
            
            {/* 1. Sidebar Panel Column */}
            <div className="lg:col-span-3 border-r border-white/5 bg-cyber-black/30 p-6 space-y-6">
              
              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold text-slate-500 tracking-widest uppercase block mb-1">
                  CORE_MODULES
                </span>
                
                {[
                  { id: 'analytics', label: 'WORKFLOW METRICS', icon: Activity, glow: 'text-neon-cyan' },
                  { id: 'ai-insights', label: 'AI SENTINAL TERM', icon: Bot, glow: 'text-neon-yellow' },
                  { id: 'uptime', label: 'SUPPLIER BRIDGE SLA', icon: ShieldCheck, glow: 'text-neon-blue' }
                ].map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full px-4 py-3 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-between transition-all outline-none ${
                        active 
                          ? "bg-white/[0.02] border-white/15 text-white shadow-inner" 
                          : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/[0.01]"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${active ? item.glow : 'text-slate-500'}`} />
                        {item.label}
                      </span>
                      {active && (
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          item.id === 'analytics' ? 'bg-neon-cyan' :
                          item.id === 'ai-insights' ? 'bg-neon-yellow' : 'bg-neon-blue'
                        }`} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Node Setup Preview tool inside dashboard mock */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                <span className="text-[10px] font-mono font-bold text-slate-500 tracking-widest uppercase block">
                  INSTANCE_GENERATOR
                </span>
                
                <form onSubmit={handleConnectNode} className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={nodeDomain}
                      onChange={(e) => setNodeDomain(e.target.value)}
                      placeholder="mysaas-brand.com"
                      className="w-full px-3 py-2 bg-cyber-black border border-white/15 rounded-xl font-mono text-[10px] text-white focus:outline-none focus:border-neon-cyan/50 transition-all placeholder:text-slate-600"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isConnecting}
                    className="w-full py-2 bg-cyber-gray hover:bg-white hover:text-black border border-white/10 rounded-xl font-mono text-[9px] font-bold uppercase tracking-wider transition-all disabled:opacity-55 flex items-center justify-center gap-1.5"
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin text-neon-yellow" />
                        PROVISIONING_NODE...
                      </>
                    ) : (
                      <>
                        <Play className="w-2.5 h-2.5 text-neon-yellow" />
                        PROVISION_TENANT
                      </>
                    )}
                  </button>
                </form>

                {connectionSuccess && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-[9px] font-mono text-emerald-400 font-bold uppercase leading-relaxed"
                  >
                    ✓ SUCCESSFUL INSTANCE DEPLOYMENT FOR: {nodeDomain} Live on port 443.
                  </motion.div>
                )}
              </div>

              {/* Operational Speed HUD */}
              <div className="pt-4 border-t border-white/5 space-y-2">
                <span className="text-[10px] font-mono font-bold text-slate-500 tracking-widest uppercase block mb-1">
                  LEDGER_OVERHEAD
                </span>
                <div className="space-y-1.5 text-[10px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ENGINE LOAD</span>
                    <span className={`font-bold ${isOverclocked ? 'text-neon-yellow' : 'text-slate-400'}`}>
                      {isOverclocked ? '94%' : '21%'}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-cyber-gray rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${isOverclocked ? 'bg-neon-yellow w-[94%]' : 'bg-neon-cyan w-[21%]'}`} 
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* 2. Interactive Area Screen */}
            <div className="lg:col-span-6 p-6 space-y-6">

              <AnimatePresence mode="wait">
                {/* SUB TAB: METRICS ANALYTICS */}
                {activeTab === 'analytics' && (
                  <motion.div
                    key="tab-analytics"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-between items-center bg-white/[0.01] p-3 border border-white/[0.03] rounded-xl font-mono text-[10px] font-bold text-slate-400">
                      <span>TELEMETRY GRAPH // CONSOLIDATED REVENUES</span>
                      <span className="text-neon-cyan font-mono font-bold animate-pulse">● FEEDING_LIVE</span>
                    </div>

                    {/* Glowing Interactive Visual Chart */}
                    <div className="h-64 border border-white/10 rounded-2xl relative bg-cyber-black overflow-hidden flex flex-col justify-between p-4 bg-radial from-slate-950 to-cyber-black">
                      
                      {/* Grid background on Chart */}
                      <div className="absolute inset-x-0 top-0 h-full bg-linear-to-b from-white/[0.01] to-transparent pointer-events-none" />
                      
                      {/* Interactive Visual Graph Path representation */}
                      <div className="w-full flex-1 relative flex items-end">
                        <svg className="absolute inset-0 w-full h-full" overflow="visible">
                          <defs>
                            <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3"/>
                              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0"/>
                            </linearGradient>
                          </defs>
                          
                          {/* Animated paths via dasharray or custom draw */}
                          <motion.path
                            d={`M 0 160 Q 60 ${isOverclocked ? '70' : '150'} 120 ${isOverclocked ? '40' : '120'} T 240 ${isOverclocked ? '20' : '90'} T 360 ${isOverclocked ? '10' : '110'} T 480 ${isOverclocked ? '5' : '70'} T 600 ${isOverclocked ? '2' : '40'}`}
                            fill="none"
                            stroke="#06b6d4"
                            strokeWidth="3.5"
                            className="drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5 }}
                          />

                          <path
                            d={`M 0 160 Q 60 ${isOverclocked ? '70' : '150'} 120 ${isOverclocked ? '40' : '120'} T 240 ${isOverclocked ? '20' : '90'} T 360 ${isOverclocked ? '10' : '110'} T 480 ${isOverclocked ? '5' : '70'} T 600 ${isOverclocked ? '2' : '40'} L 600 240 L 0 240 Z`}
                            fill="url(#chart-glow)"
                          />

                          {/* Pulsing focal dots */}
                          <circle cx="240" cy={isOverclocked ? 20 : 90} r="6" fill="#06b6d4" className="animate-ping" />
                          <circle cx="240" cy={isOverclocked ? 20 : 90} r="4" fill="#fbbf24" />
                        </svg>

                        {/* Chart label tags */}
                        <div className="absolute top-10 right-10 p-3 bg-cyber-dark border border-white/10 rounded-xl font-mono text-[9px]">
                          <span className="text-slate-500 uppercase block">VOLUME SPIKE</span>
                          <span className="text-neon-yellow font-bold text-[11px] block mt-1">
                            {isOverclocked ? '+423% CRITICAL MAX' : '+18.4% STABLE'}
                          </span>
                        </div>
                      </div>

                      {/* Timestamps */}
                      <div className="flex justify-between font-mono text-[9px] text-slate-500 border-t border-white/5 pt-2 z-10">
                        <span>NODE_ID: 18C</span>
                        <span>SEC_TRANS: 44,028 OPS</span>
                        <span>06:00 UTC</span>
                        <span>08:00 UTC</span>
                        <span>10:33 UTC (NOW)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-cyber-dark/50 p-4 border border-white/5 rounded-2xl">
                        <span className="text-[10px] font-mono text-slate-500 tracking-wider block">CONCUR_CHANNELS</span>
                        <div className="text-xl font-bold text-white tracking-tight mt-1 font-display">
                          {isOverclocked ? '1,500 / 1,500 MAX' : '420 / 1,500 OPEN'}
                        </div>
                      </div>
                      <div className="bg-cyber-dark/50 p-4 border border-white/5 rounded-2xl">
                        <span className="text-[10px] font-mono text-slate-500 tracking-wider block">YIELD METRIC SLA</span>
                        <div className="text-xl font-bold text-neon-cyan tracking-tight mt-1 font-display">
                          {isOverclocked ? '99.999% STEADY' : '99.988% STABLE'}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* SUB TAB: AI INSIGHTS TERMINAL */}
                {activeTab === 'ai-insights' && (
                  <motion.div
                    key="tab-ai-insights"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-between items-center bg-white/[0.01] p-3 border border-white/[0.03] rounded-xl font-mono text-[10px] text-slate-400">
                      <span>NEXUS SENTINEL V4.0 CONTROL PLANE</span>
                      <span className="text-neon-yellow font-bold animate-pulse">● COGNITIVE_THREAD_LIVE</span>
                    </div>

                    {/* AI Prompt Screen log stream */}
                    <div className="h-64 border border-white/10 rounded-2xl bg-cyber-black p-4 font-mono text-[11px] overflow-y-auto space-y-3 relative select-none">
                      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-[0.4] scale-90">
                        <Bot className="w-3.5 h-3.5 text-neon-yellow" />
                        <span className="text-[8px] tracking-wider uppercase font-bold text-slate-400">SENTINEL_AI</span>
                      </div>

                      {aiPrompts.map((p, index) => (
                        <div key={index} className="space-y-1">
                          <span className={p.role === 'user' ? 'text-neon-cyan font-bold block' : 'text-neon-yellow font-bold block'}>
                            {p.role === 'user' ? '$ root@user_query:' : '// sentinel_nlp:'}
                          </span>
                          <p className="text-slate-300 leading-relaxed pl-3 font-mono">
                            {p.text}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Suggested preset queries */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-slate-500 tracking-wider uppercase block">
                        CHOOSE OPERATIONAL DIRECTIVE:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => triggerAiResponse(
                            "Audit active supplier routing tiers for yield maximization",
                            "[AUDIT_REP] Sentinel recommends routing 75% of APAC recharges to Digiflazz Router due to a 0.22% fees deduction threshold event."
                          )}
                          className="px-3 py-1.5 bg-cyber-dark hover:bg-neon-yellow/10 border border-white/10 hover:border-neon-yellow/40 rounded-xl text-[10px] font-mono text-slate-300 hover:text-white transition-all outline-none"
                        >
                          → Smart Route Optimizer
                        </button>
                        <button
                          onClick={() => triggerAiResponse(
                            "Scan for fraud anomalies on wallet settlement pipelines",
                            "[SECURITY_OK] Inspected 8,201 active ledger settlements. Anomalous patterns: 0. IP score checks: 100% compliant."
                          )}
                          className="px-3 py-1.5 bg-cyber-dark hover:bg-neon-yellow/10 border border-white/10 hover:border-neon-yellow/40 rounded-xl text-[10px] font-mono text-slate-300 hover:text-white transition-all outline-none"
                        >
                          → Security Audit
                        </button>
                        <button
                          onClick={() => triggerAiResponse(
                            "Generate market markup index pricing benchmark query",
                            "[MARKUP_EST] Competitor margins adjusted. Generated safe markup matrix of +1.8% to maintain absolute premium yield capture."
                          )}
                          className="px-3 py-1.5 bg-cyber-dark hover:bg-neon-yellow/10 border border-white/10 hover:border-neon-yellow/40 rounded-xl text-[10px] font-mono text-slate-300 hover:text-white transition-all outline-none"
                        >
                          → Yield Benchmark
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* SUB TAB: SUPPLIER UPTIME MATRIX */}
                {activeTab === 'uptime' && (
                  <motion.div
                    key="tab-uptime"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-between items-center bg-white/[0.01] p-3 border border-white/[0.03] rounded-xl font-mono text-[10px] text-slate-400">
                      <span>SUPPLIER INTER-SOCIATE INTEGRITY MATRIX</span>
                      <span className="text-neon-blue font-bold tracking-widest uppercase">9 ROUTING BRIDGES</span>
                    </div>

                    <div className="h-64 border border-white/10 rounded-2xl bg-cyber-black p-6 flex flex-col justify-between">
                      
                      <div className="space-y-4">
                        {[
                          { name: 'VIP RESELLER (MIDDLE-ROUTE-1)', ping: '14ms', status: 'ACTIVE', uptime: '99.99%', indicator: 'bg-emerald-500' },
                          { name: 'DIGIFLAZZ BROADCAST LEDGER (APAC)', ping: '8ms', status: 'ACTIVE', uptime: '99.99%', indicator: 'bg-emerald-500' },
                          { name: 'XENDIT COMPLIANCE ENDPOINT', ping: '24ms', status: 'WARN', uptime: '99.96%', indicator: 'bg-amber-500' },
                          { name: 'MIDTRANS MAINNET SETTLEMENT (LIVE)', ping: '12ms', status: 'ACTIVE', uptime: '100.00%', indicator: 'bg-neon-yellow' },
                        ].map((sup, idx) => (
                          <div key={idx} className="flex items-center justify-between border-b border-white/[0.03] pb-2 text-xs font-mono">
                            <div className="flex items-center gap-2.5">
                              <span className={`w-2 h-2 rounded-full ${sup.indicator} animate-pulse`} />
                              <span className="text-white font-bold tracking-tight uppercase">{sup.name}</span>
                            </div>
                            <div className="flex items-center gap-4 text-slate-400">
                              <span className="text-[10px]">PING / <span className="text-neon-cyan">{sup.ping}</span></span>
                              <span className="text-[10px]">SLA / <span className="text-white font-bold">{sup.uptime}</span></span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 bg-neon-blue/5 border border-neon-blue/15 rounded-xl flex items-center gap-3">
                        <Workflow className="w-5 h-5 text-neon-blue shrink-0" />
                        <p className="text-[9px] font-mono text-slate-400 leading-normal uppercase">
                          Adaptive failover circuit triggers automatically if any gateway route registers 3 consecutive latency degradation peaks beyond 200ms limit parameters.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* 3. Live Active Ledger Feed Column */}
            <div className="lg:col-span-3 border-l border-white/5 bg-cyber-black/30 p-6 space-y-6">
              
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold text-slate-500 tracking-widest uppercase">
                  LEDGER_FEED
                </span>
                <span className="text-[9px] font-mono text-neon-yellow font-bold uppercase animate-pulse">
                  AUTO_DECIDE
                </span>
              </div>

              {/* Transaction Stream Container */}
              <div className="h-[345px] overflow-y-hidden space-y-3 font-mono relative select-none">
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#050508] to-transparent pointer-events-none z-10" />

                {[
                  { tx: 'A-21893', action: 'RECHARGE GAME_SKU', amt: '$120.00', status: 'SETTLED', delay: '0.1s' },
                  { tx: 'W-99021', action: 'TOPUP RESELLER_01', amt: '$1,500.00', status: 'SETTLED', delay: '0.6s' },
                  { tx: 'T-84201', action: 'CONVERT USD // IDR', amt: '$4,285.10', status: 'SETTLED', delay: '1.2s' },
                  { tx: 'A-22049', action: 'AI ROUTE CALC', amt: '$12.42', status: 'SETTLED', delay: '1.8s' },
                  { tx: 'W-99103', action: 'TOPUP AGENCY_99', amt: '$850.00', status: 'SETTLED', delay: '2.5s' },
                ].map((feed, fIdx) => (
                  <motion.div
                    key={fIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: fIdx * 0.1 }}
                    className="p-3 bg-cyber-gray/40 border border-white/[0.04] rounded-xl hover:border-white/10 transition-all text-[10px]"
                  >
                    <div className="flex justify-between text-slate-500 font-bold mb-1">
                      <span>TX // {feed.tx}</span>
                      <span className="text-neon-cyan">{feed.delay} AGO</span>
                    </div>
                    <div className="font-sans font-bold text-white text-[11px] truncate uppercase mb-1">
                      {feed.action}
                    </div>
                    <div className="flex justify-between items-center font-mono text-[9px]">
                      <span className="text-neon-yellow font-bold text-xs">{feed.amt}</span>
                      <span className="px-1.5 py-0.5 bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 font-bold rounded">
                        {feed.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* SECTION 4: LIVE STATISTICS COUNTERS */}
      <section id="core-metrics" className="bg-[#050508] border-y border-white/5 py-16 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {[
              {
                label: "ECOSYSTEM ACTIVE USERS",
                value: activeUsers.toLocaleString(),
                extra: "Global Active Node Terminals",
                glow: "text-neon-cyan animate-pulse",
                borderGlow: "hover:border-neon-cyan/30"
              },
              {
                label: "TRANSACTION VALUE SECURED",
                value: `$${transactionVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                extra: "Atomic double-entry ledger flowed",
                glow: "text-neon-yellow",
                borderGlow: "hover:border-neon-yellow/30"
              },
              {
                label: "EDGE UPTIME PERFORMANCE",
                value: `${uptimePercent.toFixed(3)}%`,
                extra: "Cascading 9 region SLA compliance",
                glow: "text-emerald-400",
                borderGlow: "hover:border-emerald-500/30"
              },
              {
                label: "INTEGRATED APIS & ROUTERS",
                value: "256 Active",
                extra: "Digiflazz, Midtrans, custom SDKs",
                glow: "text-neon-blue",
                borderGlow: "hover:border-neon-blue/30"
              }
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`bg-cyber-black/50 border border-white/[0.04] p-6 rounded-2xl relative overflow-hidden transition-all duration-300 ${stat.borderGlow}`}
              >
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                
                <span className="text-[10px] font-mono font-bold text-slate-500 tracking-[0.2em] uppercase block">
                  {stat.label}
                </span>
                
                <div className={`text-2xl sm:text-3xl font-black mt-3 font-display tracking-tight ${stat.glow}`}>
                  {stat.value}
                </div>
                
                <span className="text-[11px] text-slate-400 font-sans block mt-1.5 font-medium">
                  {stat.extra}
                </span>

                <div className="absolute bottom-2 right-2 opacity-[0.03]">
                  <Database className="w-12 h-12" />
                </div>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* SECTION 3: FEATURES SECTION */}
      <section id="premium-features" className="max-w-7xl mx-auto px-6 py-24 relative">
        <div className="text-center mb-16">
          <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-neon-yellow uppercase block mb-3">INFRASTRUCTURE_SUITE</span>
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">Enterprise Digital Weaponry</h2>
          <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">Engineered without compromise. Outpace standard merchant limitations with our microsecond-optimized financial pipelines.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <FeatureCard
            icon={Workflow}
            title="Multi Supplier API"
            desc="Expose unified endpoint structures aggregating digital goods directly from top international brokers, including Digiflazz, VIP Reseller, and beyond."
            glowColor="yellow"
          />

          <FeatureCard
            icon={Layers}
            title="White Label SaaS"
            desc="Deploy customizable developer portals, public product catalogs, custom sub-agencies, structures, and independent domains with a single toggle."
            glowColor="blue"
          />

          <FeatureCard
            icon={Bot}
            title="AI Analytics"
            desc="Leverage our Sentinel Core module to automatically forecast inventory runtimes, optimize multi-tenant security limits, and detect market spikes."
            glowColor="cyan"
          />

          <FeatureCard
            icon={Sliders}
            title="Smart Pricing Engine"
            desc="Define highly intricate margin formulas, cascading tier markup rules, client-specific discounts, and merchant channel micro-incentives."
            glowColor="cyan"
          />

          <FeatureCard
            icon={Activity}
            title="Realtime Transactions"
            desc="Every buy, top-up, payout, or ledger conversion maps instantly onto optimized database shards, completing with 100% atomicity."
            glowColor="yellow"
          />

          <FeatureCard
            icon={Cpu}
            title="Auto Scaling Infrastructure"
            desc="Worry-free cloud cluster orchestrators immediately allocate elastic hardware shards to insulate your traffic during massive product drops."
            glowColor="blue"
          />

        </div>
      </section>

      {/* SECTION 5: PRICING SECTION */}
      <section id="pricing-matrix" className="py-24 bg-[#050508] border-t border-white/5 relative">
        <div className="absolute inset-0 bg-neon-yellow/[0.01] blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center mb-16">
            <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-neon-cyan uppercase block mb-3">LICENSING_MATRIX</span>
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">Flexible Monetization Plans</h2>
            <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">Select the node authorization that aligns with your transaction throughput requirements.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Plan 1: Starter */}
            <div className="bg-cyber-black/70 border border-white/10 p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between hover:border-white/20 transition-all duration-300">
              <div className="space-y-6">
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-mono text-slate-400 tracking-wider inline-block">
                  NODE_AUTHORIZATION_01
                </span>
                
                <div>
                  <h3 className="text-2xl font-bold text-white uppercase tracking-tight">Starter Core</h3>
                  <p className="text-xs text-slate-400 mt-1">Perfect for local product networks</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white font-display">$49</span>
                  <span className="text-slate-500 font-mono text-xs">/ MONTH</span>
                </div>

                <div className="h-px bg-white/5" />

                <ul className="space-y-3 font-mono text-xs text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-cyan" />
                    Up to 5 API Supplier Bridges
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-cyan" />
                    White-label sub-domain
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-cyan" />
                    1.2% Platform commission cap
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-cyan" />
                    Standard ledger settlement rails
                  </li>
                </ul>
              </div>

              <Link
                to="/register"
                className="w-full py-3 bg-white/5 hover:bg-white text-slate-400 hover:text-black hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider transition-all text-center mt-10"
              >
                PROVISION_STARTER
              </Link>
            </div>

            {/* Plan 2: Pro */}
            <div className="bg-cyber-black/90 border border-neon-yellow/40 p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-[0_0_40px_rgba(250,204,21,0.15)] hover:border-neon-yellow transition-all duration-300 transform lg:-translate-y-2">
              <div className="absolute top-0 right-0 bg-neon-yellow text-black font-mono font-bold text-[9px] tracking-wider uppercase px-4 py-1.5 rounded-bl-xl shadow-lg">
                ★ POPULAR CHOSEN NODE
              </div>

              <div className="space-y-6">
                <span className="px-3 py-1 bg-neon-yellow/10 border border-neon-yellow/30 rounded-full text-[9px] font-mono text-neon-yellow tracking-wider inline-block">
                  NODE_AUTHORIZATION_02
                </span>
                
                <div>
                  <h3 className="text-2xl font-bold text-white uppercase tracking-tight">Sovereign Pro</h3>
                  <p className="text-xs text-slate-400 mt-1">Engineered for growing SaaS agencies</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-neon-yellow font-display">$149</span>
                  <span className="text-slate-500 font-mono text-xs">/ MONTH</span>
                </div>

                <div className="h-px bg-white/5" />

                <ul className="space-y-3 font-mono text-xs text-white">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-yellow" />
                    Unlimited API Supplier Bridges
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-yellow" />
                    Custom white-label domain mapping
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-yellow" />
                    0.6% Platform commission ceiling
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-yellow" />
                    Sentinel AI pricing margin copilot
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-yellow" />
                    Priority latency dynamic failovers
                  </li>
                </ul>
              </div>

              <Link
                to="/register"
                className="w-full py-3.5 bg-neon-yellow hover:bg-white text-black hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider transition-all text-center mt-10"
              >
                PROVISION_PRO_NODE
              </Link>
            </div>

            {/* Plan 3: Enterprise */}
            <div className="bg-cyber-black/70 border border-neon-blue/40 p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between hover:border-neon-blue transition-all duration-300">
              <div className="space-y-6">
                <span className="px-3 py-1 bg-neon-blue/10 border border-neon-blue/30 rounded-full text-[9px] font-mono text-neon-blue tracking-wider inline-block">
                  NODE_AUTHORIZATION_03
                </span>
                
                <div>
                  <h3 className="text-2xl font-bold text-white uppercase tracking-tight">Enterprise Max</h3>
                  <p className="text-xs text-slate-400 mt-1">For global distribution syndicates</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white font-display">$499</span>
                  <span className="text-slate-500 font-mono text-xs">/ MONTH</span>
                </div>

                <div className="h-px bg-white/5" />

                <ul className="space-y-3 font-mono text-xs text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-blue" />
                    Dedicated independent cluster shards
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-blue" />
                    Zero commission (0% platform fee)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-blue" />
                    Direct-connect custom routing scripts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-blue" />
                    24/7 Redundant SLA circuit engineers
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-blue" />
                    Hardware-isolated sandbox clusters
                  </li>
                </ul>
              </div>

              <Link
                to="/register"
                className="w-full py-3 bg-neon-blue hover:bg-white text-white hover:text-black hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider transition-all text-center mt-10"
              >
                PROVISION_ENTERPRISE
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 6: THE FINAL CTA SECTION */}
      <section className="py-28 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-neon-yellow/10 to-neon-blue/10 rounded-full blur-[200px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-8">
          
          <span className="text-[10px] font-mono font-bold tracking-[0.3em] text-neon-yellow uppercase block">INITIALIZE_YOUR_ECOSYSTEM</span>
          
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-[0.95]">
            Launch Your SaaS <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-yellow to-neon-blue">
              Ecosystem Today
            </span>
          </h2>
          
          <p className="text-slate-400 mb-10 text-base max-w-xl mx-auto font-sans leading-relaxed">
            Mount your digital recharges, game-keys, global payment settlement gates, and white label partner portals atop the most robust cyber architecture built for pure yield.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link
              to="/register"
              className="px-8 py-4 bg-neon-yellow hover:bg-white text-black rounded-xl font-bold font-mono text-sm uppercase tracking-wider hover:shadow-[0_0_25px_rgba(250,204,21,0.35)] transition-all flex items-center justify-center w-full group active:scale-95"
            >
              DEPLOY FIRST EDGE NODE 
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#030303] py-16 relative z-30 font-mono text-xs">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-8 mb-16 text-left">
          
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-cyber-black border border-white/10 rounded-lg flex items-center justify-center">
                <Layers className="w-4 h-4 text-neon-yellow" />
              </div>
              <span className="font-bold text-lg text-white tracking-wider">
                NEXUS<span className="text-neon-yellow">CORE</span>
              </span>
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px] max-w-xs">
              Next-generation white label digital goods, dynamic currency conversions, and automated payout SaaS rails. Secure double-entry compliance architecture by default.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 uppercase tracking-widest text-slate-400">Platform</h4>
            <ul className="space-y-3 text-slate-500">
              <li>
                <a href="#core-metrics" className="hover:text-neon-cyan transition-colors">
                  Live Telemetry
                </a>
              </li>
              <li>
                <a href="#sandbox-dashboard" className="hover:text-neon-yellow transition-colors">
                  AI Sentinel
                </a>
              </li>
              <li>
                <a href="#premium-features" className="hover:text-neon-blue transition-colors">
                  API Connectors
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 uppercase tracking-widest text-slate-400">Handshakes</h4>
            <ul className="space-y-3 text-slate-500">
              <li>
                <span className="block opacity-65">Digiflazz Bridge // Active</span>
              </li>
              <li>
                <span className="block opacity-65">Midtrans API // Live</span>
              </li>
              <li>
                <span className="block opacity-65">Xendit Unified // Operational</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 uppercase tracking-widest text-slate-400">Jurisdictions</h4>
            <ul className="space-y-3 text-slate-500">
              <li>
                <span className="block opacity-75">APAC Host Node</span>
              </li>
              <li>
                <span className="block opacity-75">EU West Router</span>
              </li>
              <li>
                <span className="block opacity-75">USA East Subnet</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-600 text-[10px]">
          <p>© 2026 {PLATFORM_BRANDING.companyName}. All rights reserved. SHA256_HASH_VERIFIED.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">
              Node Cryptography Specs
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Protocol usage
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
};
