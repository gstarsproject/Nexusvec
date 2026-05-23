import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreVertical, 
  Wallet, 
  ShieldAlert, 
  ShieldCheck, 
  Trash2,
  TrendingUp,
  CreditCard,
  Mail,
  Calendar,
  ArrowUpDown,
  Filter,
  Trophy,
  LayoutGrid,
  ChevronDown,
  Network,
  Pencil
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useResellers } from '../../hooks/useResellers';
import { useResellerTiers } from '../../hooks/useResellerTiers';
import { ResellerTierModule } from './ResellerTierModule';
import { ResellerTreeView } from './ResellerTreeView';
import { cn } from '../../utils/cn';
import { parseCreatedDate } from '../../utils/date';
import { Reseller } from '../../types/index';

type SortField = 'name' | 'balance' | 'createdAt';
type SortOrder = 'asc' | 'desc';
type ViewTab = 'fleet' | 'tiers' | 'hierarchy';

export const ResellerModule = () => {
  const { resellers, loading, addReseller, updateBalance, updateStatus, updateResellerParams, deleteReseller, assignTier } = useResellers();
  const { tiers } = useResellerTiers();
  
  const [activeTab, setActiveTab] = useState<ViewTab>('fleet');
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReseller, setEditingReseller] = useState<Reseller | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [assigningTierId, setAssigningTierId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    initialBalance: 0,
    parentId: '' as string | null
  });
  
  const parentReseller = resellers.find(r => r.id === currentParentId);
  const breadcrumbs = currentParentId ? (() => {
    const list = [];
    let curr = parentReseller;
    while(curr) {
      list.unshift(curr);
      curr = resellers.find(r => r.id === curr?.parentId);
    }
    return list;
  })() : [];

  const handleOpenAdd = () => {
    setEditingReseller(null);
    setFormData({ name: '', email: '', initialBalance: 0, parentId: currentParentId || null });
    setShowAddForm(true);
  };

  const handleOpenEdit = (reseller: Reseller) => {
    setEditingReseller(reseller);
    setFormData({ name: reseller.name, email: reseller.email, initialBalance: 0, parentId: reseller.parentId || null });
    setShowAddForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingReseller) {
        // Edit flow
        const newParent = resellers.find(r => r.id === formData.parentId);
        const hierarchyLevel = newParent ? (newParent.hierarchyLevel || 0) + 1 : 0;
        const parentPath = newParent?.path;

        await updateResellerParams(editingReseller.id, {
          name: formData.name,
          email: formData.email,
          parentId: formData.parentId || null,
          hierarchyLevel,
          path: parentPath ? `${parentPath}/${editingReseller.id}` : `${editingReseller.agencyId}/${editingReseller.id}`
        });
      } else {
        // Add flow
        const specificParentId = formData.parentId || currentParentId || undefined;
        const specificParent = resellers.find(r => r.id === specificParentId);
        const hierarchyLevel = specificParent ? (specificParent.hierarchyLevel || 0) + 1 : 0;
        const parentPath = specificParent?.path;
        
        await addReseller(
          formData.name, 
          formData.email, 
          Number(formData.initialBalance),
          specificParentId,
          hierarchyLevel,
          parentPath
        );
      }
      setShowAddForm(false);
      setFormData({ name: '', email: '', initialBalance: 0, parentId: null });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredResellers = resellers.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         r.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesParent = r.parentId === currentParentId || (!currentParentId && !r.parentId);
    return matchesSearch && matchesParent;
  });

  const sortedResellers = [...filteredResellers].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
    else if (sortBy === 'balance') comparison = a.balance - b.balance;
    else if (sortBy === 'createdAt') {
      const dateA = parseCreatedDate(a.createdAt)?.getTime() || 0;
      const dateB = parseCreatedDate(b.createdAt)?.getTime() || 0;
      comparison = dateA - dateB;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Stats calculation
  const stats = {
    totalBalance: resellers.reduce((acc, r) => acc + (r.balance || 0), 0),
    totalPending: resellers.reduce((acc, r) => acc + (r.pendingBalance || 0), 0),
    activeNodes: resellers.filter(r => r.status === 'ACTIVE').length,
    totalNodes: resellers.length,
    coverage: Math.round((resellers.filter(r => r.status === 'ACTIVE').length / (resellers.length || 1)) * 100)
  };

  return (
    <div className="space-y-6">
      {/* Network Intelligence Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Platform Liquidity', value: `$${stats.totalBalance.toLocaleString()}`, sub: 'Verified Credit Pool', icon: Wallet, color: 'text-blue-500' },
          { label: 'Active Partners', value: stats.activeNodes, sub: `Of ${stats.totalNodes} Total Partners`, icon: Users, color: 'text-slate-300' },
          { label: 'Network Health', value: `${stats.coverage}%`, sub: 'Operational Integrity', icon: ShieldCheck, color: 'text-indigo-500' },
          { label: 'Pending Settlement', value: `$${stats.totalPending.toLocaleString()}`, sub: 'Unsettled Ledger', icon: TrendingUp, color: 'text-amber-500' },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="bg-slate-950 border border-white/[0.04] rounded-2xl p-5 flex flex-col justify-between group hover:border-slate-700 transition-all overflow-hidden relative shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-100 flex items-center justify-center">
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">{stat.label}</div>
              <div className={cn("text-2xl font-semibold tracking-tight", "text-white")}>
                {stat.value}
              </div>
              <div className="text-sm text-slate-500 mt-1">{stat.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 p-1 bg-slate-800 border border-white/[0.04] rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab('fleet')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === 'fleet' ? "bg-slate-950 text-white shadow-sm" : "text-slate-500 hover:text-slate-300 hover:bg-slate-900"
          )}
        >
          <LayoutGrid className="w-4 h-4" />
          Resellers
        </button>
        <button 
          onClick={() => setActiveTab('hierarchy')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === 'hierarchy' ? "bg-slate-950 text-white shadow-sm" : "text-slate-500 hover:text-slate-300 hover:bg-slate-900"
          )}
        >
          <Network className="w-4 h-4" />
          Network Map
        </button>
        <button 
          onClick={() => setActiveTab('tiers')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === 'tiers' ? "bg-slate-950 text-white shadow-sm" : "text-slate-500 hover:text-slate-300 hover:bg-slate-900"
          )}
        >
          <Trophy className="w-4 h-4" />
          Reseller Tiers
        </button>
      </div>

      {activeTab === 'tiers' ? (
        <ResellerTierModule />
      ) : activeTab === 'hierarchy' ? (
        <ResellerTreeView resellers={resellers} tiers={tiers} />
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-semibold text-white tracking-tight flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  Resellers
                </h2>
                {breadcrumbs.length > 0 && (
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-slate-400">/</span>
                    <button 
                      onClick={() => setCurrentParentId(null)}
                      className="text-sm font-medium text-slate-500 hover:text-white transition-colors"
                    >
                      Top Level
                    </button>
                    {breadcrumbs.map((b, i) => (
                      <React.Fragment key={b.id}>
                        <span className="text-slate-400">/</span>
                        <button 
                          onClick={() => setCurrentParentId(b.id)}
                          className={cn(
                            "text-sm font-medium transition-colors",
                            i === breadcrumbs.length - 1 ? "text-white" : "text-slate-500 hover:text-white"
                          )}
                        >
                          {b.name}
                        </button>
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1">
                {currentParentId ? `Viewing partners under ${parentReseller?.name}` : 'Manage your direct partners and distribution network.'}
              </p>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-grow md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search resellers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-white/[0.04] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                />
              </div>

              <div className="relative">
                <button 
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className={cn(
                    "p-2 rounded-lg py-2 border flex items-center gap-2 transition-all active:scale-95 bg-slate-950",
                    showSortMenu ? "border-blue-500/50 text-blue-400 bg-blue-500/10" : "border-white/[0.04] text-slate-400 hover:text-white"
                  )}
                >
                  <ArrowUpDown className="w-4 h-4" />
                  <span className="text-sm font-medium tracking-tight hidden sm:inline">Sort</span>
                </button>

                <AnimatePresence>
                  {showSortMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowSortMenu(false)} 
                      />
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-slate-950 border border-white/[0.04] rounded-xl shadow-xl py-2 z-50 overflow-hidden"
                      >
                        {[
                          { id: 'name', label: 'Name' },
                          { id: 'balance', label: 'Balance' },
                          { id: 'createdAt', label: 'Join Date' }
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => {
                              toggleSort(opt.id as SortField);
                              setShowSortMenu(false);
                            }}
                            className={cn(
                              "w-full px-4 py-2 text-sm text-left flex items-center justify-between transition-colors font-medium",
                              sortBy === opt.id ? "bg-blue-500/10 text-blue-400" : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                            )}
                          >
                            {opt.label}
                            {sortBy === opt.id && (
                              <span className="text-xs font-bold text-blue-400">
                                {sortOrder === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <button 
                onClick={handleOpenAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-sm active:scale-95 whitespace-nowrap"
              >
                <UserPlus className="w-4 h-4" />
                Add Reseller
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-40 bg-slate-950 border border-white/[0.04] rounded-2xl animate-pulse shadow-sm" />
              ))}
            </div>
          ) : sortedResellers.length === 0 ? (
            <div className="bg-slate-950 border border-white/[0.04] rounded-2xl p-12 text-center shadow-sm">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-white font-semibold tracking-tight mb-1 text-sm">No Partners Found</h3>
              <p className="text-sm text-slate-500">You don't have any partners or sub-resellers matching this criteria yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedResellers.map((reseller) => {
                const currentTier = tiers.find(t => t.id === reseller.tierId);
                
                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={reseller.id}
                    className="bg-slate-950 border border-white/[0.04] rounded-2xl p-5 hover:border-slate-700 transition-all group relative overflow-hidden shadow-sm"
                  >
                    <div className="flex justify-between items-start relative z-10">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-100 font-semibold text-slate-300 text-sm">
                          {reseller.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-white tracking-tight">{reseller.name}</h3>
                            {resellers.some(r => r.parentId === reseller.id) && (
                              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] font-bold text-blue-400">
                                <LayoutGrid className="w-3 h-3" />
                                {resellers.filter(r => r.parentId === reseller.id).length} Nodes
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={cn(
                              "text-xs font-bold tracking-tight px-2 py-0.5 rounded-md border",
                              reseller.status === 'ACTIVE' 
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                : "bg-red-500/10 text-red-500 border-red-500/20"
                            )}>
                              {reseller.status}
                            </span>
                            {currentTier && (
                              <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-white/[0.04]">
                                <Trophy className="w-2.5 h-2.5" style={{ color: currentTier.color }} />
                                {currentTier.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenEdit(reseller)}
                          className="p-1.5 bg-slate-900 rounded-lg hover:bg-slate-800 text-slate-500"
                          title="Edit Reseller"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setCurrentParentId(reseller.id)}
                          className="p-1.5 bg-slate-900 rounded-lg hover:bg-slate-800 text-slate-500"
                          title="View Sub-Resellers"
                        >
                          <TrendingUp className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => updateStatus(reseller.id, reseller.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
                          className="p-1.5 bg-slate-900 rounded-lg hover:bg-slate-800 text-slate-500"
                          title="Toggle Status"
                        >
                          {reseller.status === 'ACTIVE' ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => deleteReseller(reseller.id)}
                          className="p-1.5 bg-slate-900 rounded-lg hover:bg-red-50 hover:text-red-500 text-slate-500"
                          title="Delete Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4 relative z-10">
                      <div className="bg-slate-900/50 rounded-xl p-3 border border-white/[0.04]">
                        <div className="flex items-center gap-2 mb-1">
                          <Wallet className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-xs text-slate-500 font-medium">Balance</span>
                        </div>
                        <div className="text-sm font-semibold text-white">${reseller.balance.toLocaleString()}</div>
                      </div>
                      <div className="bg-slate-900/50 rounded-xl p-3 border border-white/[0.04] relative group/balance">
                        <div className="flex items-center gap-2 mb-1">
                          <Trophy className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-xs text-slate-500 font-medium">Tier Level</span>
                        </div>
                        <div className="relative">
                          <select 
                            className="w-full bg-transparent text-sm font-semibold text-blue-600 outline-none cursor-pointer appearance-none pr-4"
                            value={reseller.tierId || ''}
                            onChange={(e) => assignTier(reseller.id, e.target.value || null)}
                          >
                            <option value="">No Tier</option>
                            {tiers.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-blue-500 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-slate-500">
                      <div className="text-xs font-medium">Frozen: ${reseller.frozenBalance || 0}</div>
                      <div className="text-xs font-medium text-right">Pending: ${reseller.pendingBalance || 0}</div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/[0.04] pt-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        <button 
                          onClick={() => {
                            const amount = prompt("Enter amount to adjust (positive to add, negative to subtract):");
                            if (amount && !isNaN(Number(amount))) {
                              updateBalance(reseller.id, Number(amount));
                            }
                          }}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          Manual Adjustment
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-400 font-mono">{reseller.id.slice(-8)}</span>
                      </div>
                    </div>

                    {/* Decorative side accent */}
                    <div className={cn(
                      "absolute top-0 right-0 bottom-0 w-1 transition-colors",
                      reseller.status === 'ACTIVE' ? "bg-emerald-500" : "bg-red-500"
                    )} />
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-slate-950 border border-white/[0.04] rounded-2xl p-8 shadow-xl"
            >
              <h3 className="text-xl font-semibold text-white tracking-tight mb-6">{editingReseller ? 'Edit Partner Details' : 'Add New Partner'}</h3>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Company / Partner Name</label>
                  <input 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Nexus Partners Ltd"
                    className="w-full bg-slate-950 border border-white/[0.04] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Email Address</label>
                  <input 
                    required
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="partner@nexus.global"
                    className="w-full bg-slate-950 border border-white/[0.04] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Parent Partner (Optional)</label>
                  <div className="relative">
                    <select
                      value={formData.parentId || ''}
                      onChange={e => setFormData({...formData, parentId: e.target.value || null})}
                      className="w-full bg-slate-950 border border-white/[0.04] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium appearance-none pr-10"
                    >
                      <option value="">Top Level (No Parent)</option>
                      {resellers
                        .filter(r => !editingReseller || (r.id !== editingReseller.id && r.parentId !== editingReseller.id)) // Prevent selecting self or direct children
                        .map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {!editingReseller && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-300">Initial Balance Allocation</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">$</span>
                      <input 
                        required
                        type="number"
                        value={formData.initialBalance}
                        onChange={e => setFormData({...formData, initialBalance: Number(e.target.value)})}
                        className="w-full bg-slate-950 border border-white/[0.04] rounded-lg pl-8 pr-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                      />
                    </div>
                  </div>
                )}
                
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-slate-950 border border-white/[0.04] text-slate-300 hover:bg-slate-900 hover:text-white transition-colors py-2.5 rounded-lg text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700 transition-colors py-2.5 rounded-lg text-sm font-medium shadow-sm"
                  >
                    {editingReseller ? 'Save Changes' : 'Add Partner'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
