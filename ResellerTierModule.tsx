import React, { useState } from 'react';
import { 
  Trophy, 
  Plus, 
  Trash2, 
  Settings2, 
  TrendingUp, 
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useResellerTiers } from '../../hooks/useResellerTiers';
import { cn } from '../../utils/cn';
import { ResellerTier } from '../../types/index';

export const ResellerTierModule = () => {
  const { tiers, loading, addTier, updateTier, deleteTier } = useResellerTiers();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTier, setEditingTier] = useState<ResellerTier | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    markupPercentage: 0,
    description: '',
    minMonthlyVolume: 0,
    color: '#3b82f6',
    benefits: [] as string[]
  });

  const [newBenefit, setNewBenefit] = useState('');

  const resetForm = () => {
    setFormData({
      name: '',
      markupPercentage: 0,
      description: '',
      minMonthlyVolume: 0,
      color: '#3b82f6',
      benefits: []
    });
    setEditingTier(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTier) {
        await updateTier(editingTier.id, formData);
      } else {
        await addTier(formData);
      }
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (tier: ResellerTier) => {
    setEditingTier(tier);
    setFormData({
      name: tier.name,
      markupPercentage: tier.markupPercentage,
      description: tier.description || '',
      minMonthlyVolume: tier.minMonthlyVolume || 0,
      color: tier.color || '#3b82f6',
      benefits: tier.benefits || []
    });
    setShowAddForm(true);
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setFormData({ ...formData, benefits: [...formData.benefits, newBenefit.trim()] });
      setNewBenefit('');
    }
  };

  const removeBenefit = (index: number) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight flex items-center gap-3">
            <Trophy className="w-5 h-5 text-blue-600" />
            Reseller Tiers
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Configure partner progression tiers and automate yields.
          </p>
        </div>
        
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create Tier
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-950 border border-white/[0.04] rounded-2xl animate-pulse shadow-sm" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={tier.id}
              className="bg-slate-950 p-6 border border-white/[0.04] rounded-2xl relative overflow-hidden group shadow-sm hover:shadow-md transition-all"
            >
              <div 
                className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-[0.15] pointer-events-none transition-opacity group-hover:opacity-[0.25]"
                style={{ backgroundColor: tier.color }}
              />
              
              <div className="flex justify-between items-start mb-6 z-10 relative">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ring-1 ring-inset ring-black/5"
                  style={{ backgroundColor: `${tier.color}10`, color: tier.color, borderColor: `${tier.color}20` }}
                >
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEdit(tier)}
                    className="p-2 bg-slate-900 border border-white/[0.04] rounded-lg hover:bg-slate-800 text-slate-400"
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteTier(tier.id)}
                    className="p-2 bg-slate-900 border border-white/[0.04] rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4 z-10 relative">
                <div>
                  <h3 className="text-lg font-semibold text-white tracking-tight">{tier.name}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mt-1">{tier.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 rounded-xl p-3 border border-white/[0.04]">
                    <div className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3" />
                      Markup Margin
                    </div>
                    <div className="text-lg font-semibold text-white">+{tier.markupPercentage}%</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-3 border border-white/[0.04]">
                    <div className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3" />
                      Min Volume
                    </div>
                    <div className="text-lg font-semibold text-white">${tier.minMonthlyVolume?.toLocaleString()}</div>
                  </div>
                </div>

                {tier.benefits && tier.benefits.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Tier Benefits</div>
                    <div className="space-y-1">
                      {tier.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-400">
                          <ChevronRight className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="truncate">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          <button 
            onClick={() => setShowAddForm(true)}
            className="p-6 border-2 border-dashed border-white/[0.04] rounded-2xl bg-slate-900/50 flex flex-col items-center justify-center gap-4 hover:border-blue-500/30 hover:bg-blue-500/5 group transition-all min-h-[280px]"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-950 border border-white/[0.04] shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-white group-hover:text-blue-700">Add New Tier</div>
              <div className="text-sm text-slate-500 mt-1">Define progression rules</div>
            </div>
          </button>
        </div>
      )}

      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetForm}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-slate-950 border border-white/[0.04] rounded-2xl p-8 max-h-[90vh] overflow-y-auto shadow-xl"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-xl font-semibold text-white tracking-tight">
                    {editingTier ? 'Adjust Tier Parameters' : 'Provision New Tier'}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Configure node-level distribution benefits.</p>
                </div>
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm ring-1 ring-inset ring-black/5"
                  style={{ backgroundColor: `${formData.color}10`, color: formData.color, borderColor: `${formData.color}20` }}
                >
                  <Trophy className="w-6 h-6" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Tier Designation</label>
                    <input 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Platinum Distribution"
                      className="w-full bg-slate-950 border border-white/[0.04] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Protocol Color</label>
                    <div className="flex gap-3">
                      {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setFormData({...formData, color: c})}
                          className={cn(
                            "w-8 h-8 rounded-lg border-2 transition-all",
                            formData.color === c ? "border-white/[0.04] scale-110 shadow-sm" : "border-transparent opacity-80 hover:opacity-100"
                          )}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Yield Markup (%)</label>
                    <div className="relative">
                      <input 
                        required
                        type="number"
                        step="0.1"
                        value={formData.markupPercentage}
                        onChange={e => setFormData({...formData, markupPercentage: Number(e.target.value)})}
                        className="w-full bg-slate-950 border border-white/[0.04] rounded-lg pl-4 pr-10 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Min Monthly Volume ($)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                      <input 
                        required
                        type="number"
                        value={formData.minMonthlyVolume}
                        onChange={e => setFormData({...formData, minMonthlyVolume: Number(e.target.value)})}
                        className="w-full bg-slate-950 border border-white/[0.04] rounded-lg pl-8 pr-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe the tier's positioning in your infrastructure..."
                    className="w-full bg-slate-950 border border-white/[0.04] rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium h-24 resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium text-slate-300">Incentives & Benefits</label>
                  <div className="flex gap-2">
                    <input 
                      value={newBenefit}
                      onChange={e => setNewBenefit(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                      placeholder="e.g. Priority Fulfillment, API v2 Access"
                      className="flex-grow bg-slate-950 border border-white/[0.04] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    />
                    <button 
                      type="button" 
                      onClick={addBenefit}
                      className="bg-slate-800 hover:bg-white/[0.04] text-slate-300 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.benefits.map((benefit, i) => (
                      <div key={i} className="bg-slate-900 border border-white/[0.04] rounded-lg px-3 py-1.5 flex items-center gap-2 group/ben">
                        <span className="text-sm text-slate-300 font-medium">{benefit}</span>
                        <button 
                          type="button"
                          onClick={() => removeBenefit(i)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {formData.benefits.length === 0 && (
                      <div className="text-sm text-slate-500 italic px-2 py-1 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        No specific benefits defined for this protocol.
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button 
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-slate-950 border border-white/[0.04] text-slate-300 hover:bg-slate-900 hover:text-white transition-colors py-2.5 rounded-lg text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700 transition-colors py-2.5 rounded-lg text-sm font-medium shadow-sm"
                  >
                    {editingTier ? 'Update Protocol' : 'Execute Provision'}
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
