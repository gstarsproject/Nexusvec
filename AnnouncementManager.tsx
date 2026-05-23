import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Info, 
  ShieldAlert, 
  CheckCircle,
  X
} from 'lucide-react';
import { Announcement, Role } from '../../types/index';
import { announcementService } from '../../services/system/announcementService';
import { cn } from '../../utils/cn';
import { motion, AnimatePresence } from 'motion/react';

export const AnnouncementManager = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'INFO' as Announcement['type'],
    priority: 'LOW' as Announcement['priority'],
    targetRoles: ['RESELLER', 'TENANT_OWNER'] as Role[]
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    // Admin can see everything essentially, but for simplicity we fetch a general list
    const data = await announcementService.getLatestAnnouncements('SUPER_OWNER' as Role, 20);
    setAnnouncements(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await announcementService.createAnnouncement({
        ...formData,
        createdBy: 'Admin', // In real app, get from Auth
      });
      setShowForm(false);
      setFormData({
        title: '',
        content: '',
        type: 'INFO',
        priority: 'LOW',
        targetRoles: ['RESELLER', 'TENANT_OWNER']
      });
      loadAnnouncements();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this broadcast?')) {
      await announcementService.deleteAnnouncement(id);
      loadAnnouncements();
    }
  };

  const toggleRole = (role: Role) => {
    if (formData.targetRoles.includes(role)) {
      setFormData({ ...formData, targetRoles: formData.targetRoles.filter(r => r !== role) });
    } else {
      setFormData({ ...formData, targetRoles: [...formData.targetRoles, role] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white tracking-tight flex items-center gap-3">
          <Megaphone className="w-5 h-5 text-blue-500" />
          Broadcast_System
        </h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel_Draft' : 'New_Broadcast'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-900/50 border border-white/[0.04] rounded-3xl p-6 backdrop-blur-xl overflow-hidden"
          >
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 tracking-tight ml-1">Message_Title</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Critical System Maintenance"
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-[11px] text-white font-mono outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 tracking-tight ml-1">Type</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                      className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-[11px] text-white font-mono outline-none"
                    >
                      <option value="INFO">Information</option>
                      <option value="WARNING">Warning</option>
                      <option value="CRITICAL">Critical</option>
                      <option value="SUCCESS">Success</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 tracking-tight ml-1">Priority</label>
                    <select 
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                      className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-[11px] text-white font-mono outline-none"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 tracking-tight ml-1">Content_Buffer</label>
                <textarea 
                  required
                  rows={3}
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Detailed explanation of the announcement..."
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-[11px] text-white font-mono outline-none focus:border-blue-500/50 resize-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 tracking-tight">Target_Nodes:</span>
                  {['SUPER_OWNER', 'TENANT_OWNER', 'RESELLER'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => toggleRole(r as Role)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all border",
                        formData.targetRoles.includes(r as Role)
                          ? "bg-white text-slate-900 border-white"
                          : "bg-slate-900 text-slate-500 border-white/[0.04] hover:text-white"
                      )}
                    >
                      {r.replace('_', ' ')}
                    </button>
                  ))}
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-white text-slate-900 px-8 py-3 rounded-2xl text-xs font-semibold tracking-tight hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  {loading ? 'Initializing...' : 'Transmit_Broadcast'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {announcements.map((msg) => (
          <div key={msg.id} className="bg-slate-900/40 border border-white/[0.04] rounded-3xl p-5 hover:border-white/10 transition-all group relative">
            <button 
              onClick={() => handleDelete(msg.id)}
              className="absolute top-4 right-4 p-1.5 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
            >
              <Trash2 className="w-3 h-3" />
            </button>

            <div className="flex items-start gap-4">
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border",
                msg.type === 'INFO' && "bg-blue-500/10 border-blue-500/20 text-blue-500",
                msg.type === 'WARNING' && "bg-amber-500/10 border-amber-500/20 text-amber-500",
                msg.type === 'CRITICAL' && "bg-red-500/10 border-red-500/20 text-red-500",
                msg.type === 'SUCCESS' && "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
              )}>
                {msg.type === 'INFO' && <Info className="w-5 h-5" />}
                {msg.type === 'WARNING' && <AlertTriangle className="w-5 h-5" />}
                {msg.type === 'CRITICAL' && <ShieldAlert className="w-5 h-5" />}
                {msg.type === 'SUCCESS' && <CheckCircle className="w-5 h-5" />}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider">{msg.title}</h4>
                  <span className={cn(
                    "text-[7px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-tighter",
                    msg.priority === 'HIGH' ? "bg-red-500 text-white" : "bg-slate-800 text-slate-400"
                  )}>
                    {msg.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono leading-relaxed line-clamp-2">
                  {msg.content}
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <span className="text-xs text-slate-300 font-semibold uppercase tracking-[0.2em]">
                    Sent: {new Date(msg.createdAt?.seconds * 1000).toLocaleDateString()}
                  </span>
                  <div className="flex gap-1">
                    {msg.targetRoles.map(role => (
                      <span key={role} className="text-[7px] text-slate-400 bg-slate-900 px-1 rounded uppercase font-semibold">
                        {role.charAt(0)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
