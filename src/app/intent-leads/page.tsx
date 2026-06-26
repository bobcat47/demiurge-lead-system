'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Megaphone, 
  Filter, 
  Search, 
  MapPin, 
  Clock, 
  Target,
  ExternalLink,
  Bot,
  User,
  AlertCircle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  RefreshCw,
  Plus,
  Sparkles,
  ChevronRight,
  MoreHorizontal,
  MessageSquare,
  Phone,
  Handshake
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { cn } from '@/lib/utils';

interface IntentLead {
  id: string;
  source_type: string;
  source_name?: string;
  source_url?: string;
  detected_need: string;
  service_category: string;
  location_text?: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  confidence_score: number;
  contact_name?: string;
  status: 'new' | 'reviewed' | 'matched' | 'proposal_generated' | 'contacted' | 'deal_created' | 'dismissed';
  created_at: string;
}

const statusConfig = {
  new: { label: 'NEW', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  reviewed: { label: 'REVIEWED', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  matched: { label: 'MATCHED', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  proposal_generated: { label: 'PROPOSAL READY', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  contacted: { label: 'CONTACTED', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  deal_created: { label: 'DEAL CREATED', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  dismissed: { label: 'DISMISSED', color: 'bg-white/5 text-white/30 border-white/10' },
};

const urgencyConfig = {
  low: { color: 'text-white/40', icon: Clock },
  medium: { color: 'text-amber-400', icon: Clock },
  high: { color: 'text-orange-400', icon: AlertCircle },
  emergency: { color: 'text-rose-400', icon: AlertCircle },
};

export default function IntentLeadsPage() {
  const [mounted, setMounted] = useState(false);
  const [leads, setLeads] = useState<IntentLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<IntentLead | null>(null);
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/intent-leads');
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFindMatches = async (leadId: string) => {
    setIsMatching(true);
    try {
      const res = await fetch(`/api/intent-leads/${leadId}/match-provider`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minScore: 70, maxResults: 5 })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Found ${data.matchesFound} matches, created ${data.matchesCreated} deal matches`);
        fetchLeads();
      }
    } catch (error) {
      console.error('Failed to find matches:', error);
    } finally {
      setIsMatching(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (filterStatus !== 'all' && lead.status !== filterStatus) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        lead.detected_need.toLowerCase().includes(query) ||
        lead.service_category.toLowerCase().includes(query) ||
        lead.location_text?.toLowerCase().includes(query) ||
        lead.source_name?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    matched: leads.filter(l => l.status === 'matched' || l.status === 'deal_created').length,
    highConfidence: leads.filter(l => l.confidence_score >= 80).length,
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] grid-bg">
      <Header />
      
      <main className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Megaphone className="w-7 h-7 text-cyan-400" />
              Intent Leads
            </h1>
            <p className="text-sm text-white/40 mt-1">Detected demand signals from monitored sources</p>
          </div>
          
          <button
            onClick={fetchLeads}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-[#0f0f14] border border-white/[0.06]">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-white/40 uppercase">Total Leads</div>
          </div>
          <div className="p-4 bg-[#0f0f14] border border-white/[0.06]">
            <div className="text-2xl font-bold text-cyan-400">{stats.new}</div>
            <div className="text-xs text-white/40 uppercase">New</div>
          </div>
          <div className="p-4 bg-[#0f0f14] border border-white/[0.06]">
            <div className="text-2xl font-bold text-amber-400">{stats.matched}</div>
            <div className="text-xs text-white/40 uppercase">Matched</div>
          </div>
          <div className="p-4 bg-[#0f0f14] border border-white/[0.06]">
            <div className="text-2xl font-bold text-emerald-400">{stats.highConfidence}</div>
            <div className="text-xs text-white/40 uppercase">High Confidence</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0f0f14] border border-white/[0.06] pl-10 pr-4 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#0f0f14] border border-white/[0.06] px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="matched">Matched</option>
            <option value="deal_created">Deal Created</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>

        {/* Leads Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-20">
            <Megaphone className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Intent Leads</h3>
            <p className="text-white/40">Add and scan a source to detect demand signals.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredLeads.map((lead) => {
              const status = statusConfig[lead.status];
              const urgency = urgencyConfig[lead.urgency];
              const UrgencyIcon = urgency.icon;
              
              return (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group bg-[#0f0f14] border border-white/[0.06] hover:border-cyan-500/30 transition-all p-5"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className={cn('px-2 py-0.5 text-[10px] font-bold border rounded-sm', status.color)}>
                        {status.label}
                      </span>
                      <span className={cn('flex items-center gap-1 text-xs', urgency.color)}>
                        <UrgencyIcon className="w-3 h-3" />
                        {lead.urgency}
                      </span>
                    </div>
                    <div className="text-xs text-white/30">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">
                      {lead.detected_need}
                    </h3>
                    <p className="text-sm text-cyan-400">{lead.service_category}</p>
                  </div>

                  {/* Meta */}
                  <div className="space-y-2 mb-4">
                    {lead.location_text && (
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <MapPin className="w-4 h-4 text-white/30" />
                        {lead.location_text}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Target className="w-4 h-4 text-white/30" />
                      Source: {lead.source_type}
                      {lead.source_name && ` / ${lead.source_name}`}
                    </div>
                    {lead.contact_name && (
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <User className="w-4 h-4 text-white/30" />
                        {lead.contact_name}
                      </div>
                    )}
                  </div>

                  {/* Confidence */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/40">Confidence</span>
                      <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            'h-full rounded-full',
                            lead.confidence_score >= 80 ? 'bg-emerald-400' :
                            lead.confidence_score >= 60 ? 'bg-cyan-400' :
                            'bg-amber-400'
                          )}
                          style={{ width: `${lead.confidence_score}%` }}
                        />
                      </div>
                      <span className={cn(
                        'text-xs font-medium',
                        lead.confidence_score >= 80 ? 'text-emerald-400' :
                        lead.confidence_score >= 60 ? 'text-cyan-400' :
                        'text-amber-400'
                      )}>
                        {lead.confidence_score}%
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleFindMatches(lead.id)}
                      disabled={isMatching || lead.status === 'deal_created'}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs hover:bg-cyan-500/20 transition-colors disabled:opacity-50"
                    >
                      <Handshake className="w-3.5 h-3.5" />
                      Find Matches
                    </button>
                    
                    {lead.source_url && (
                      <a
                        href={lead.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white/[0.03] border border-white/[0.08] text-white/60 text-xs hover:bg-white/[0.06] transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Source
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
