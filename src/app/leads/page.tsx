'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Filter, 
  RefreshCw, 
  Search,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { cn } from '@/lib/utils';

interface Lead {
  id: string;
  title: string;
  service: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  location: string;
  score: number;
  time: string;
  status: 'new' | 'matched' | 'contacted' | 'approved' | 'rejected';
  matches: number;
  phone?: string;
  email?: string;
}

export default function LeadsPage() {
  const [mounted, setMounted] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leadId: string) => {
    try {
      await fetch(`/api/leads/${leadId}/approve`, { method: 'POST' });
      fetchLeads();
    } catch (error) {
      console.error('Failed to approve lead:', error);
    }
  };

  const handleReject = async (leadId: string) => {
    try {
      await fetch(`/api/leads/${leadId}/reject`, { method: 'POST' });
      fetchLeads();
    } catch (error) {
      console.error('Failed to reject lead:', error);
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (filter !== 'all' && lead.status !== filter) return false;
    if (searchQuery && !lead.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] grid-bg">
      <Header />
      
      <main className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Target className="w-7 h-7 text-cyan-400" />
              Target Acquisition
            </h1>
            <p className="text-sm text-white/40 mt-1">Manage detected leads and opportunities</p>
          </div>
          
          <button 
            onClick={fetchLeads}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Lead
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/30 border border-white/[0.08] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          
          <div className="flex items-center gap-2">
            {['all', 'new', 'matched', 'contacted', 'approved'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm capitalize transition-colors',
                  filter === status
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-white/[0.05] text-white/60 border border-white/[0.08] hover:bg-white/[0.08]'
                )}
              >
                {status}
              </button>
            ))}
          </div>
          
          <button 
            onClick={fetchLeads}
            className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/60 hover:bg-white/[0.08] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Leads Table */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-20 text-white/40">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No leads found</p>
            </div>
          ) : (
            filteredLeads.map((lead, index) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'group relative p-5 rounded-xl border transition-all',
                  lead.urgency === 'critical' 
                    ? 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40'
                    : 'bg-white/[0.03] border-white/[0.06] hover:border-white/[0.1]'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-mono text-white/40">{lead.id}</span>
                      {lead.urgency === 'critical' && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-semibold uppercase flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Critical
                        </span>
                      )}
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase',
                        lead.status === 'new' && 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
                        lead.status === 'matched' && 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
                        lead.status === 'contacted' && 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
                        lead.status === 'approved' && 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
                        lead.status === 'rejected' && 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
                      )}>
                        {lead.status}
                      </span>
                    </div>
                    
                    <h3 className={cn(
                      'text-lg font-medium mb-2',
                      lead.urgency === 'critical' ? 'text-rose-400' : 'text-white'
                    )}>
                      {lead.title}
                    </h3>
                    
                    <div className="flex items-center gap-6 text-sm text-white/40">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {lead.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {lead.time}
                      </span>
                      <span className="capitalize">{lead.service}</span>
                      {lead.phone && <span>{lead.phone}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 ml-4">
                    <div className="text-center">
                      <div className={cn(
                        'text-3xl font-bold font-mono',
                        lead.score >= 80 ? 'text-emerald-400' : 
                        lead.score >= 60 ? 'text-cyan-400' : 'text-amber-400'
                      )}>
                        {lead.score}
                      </div>
                      <div className="text-[10px] text-white/30 uppercase">Score</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold font-mono text-white">
                        {lead.matches}
                      </div>
                      <div className="text-[10px] text-white/30 uppercase">Matches</div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {lead.status === 'new' && (
                        <>
                          <button 
                            onClick={() => handleApprove(lead.id)}
                            className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleReject(lead.id)}
                            className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
