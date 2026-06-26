'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Handshake, 
  Filter, 
  Search, 
  MapPin, 
  TrendingUp,
  RefreshCw,
  Play,
  MessageSquare,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Bot,
  ChevronRight
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { cn } from '@/lib/utils';

interface DealMatch {
  id: string;
  intent_lead_id: string;
  provider_id: string;
  match_score: number;
  match_reasons: string[];
  distance_miles?: number;
  estimated_job_value?: number;
  proposed_commission_type: 'percentage' | 'fixed' | 'unknown';
  proposed_commission_value?: number;
  status: string;
  created_at: string;
  provider_name?: string;
  provider_rating?: number;
  client_need?: string;
  client_location?: string;
  service_category?: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  new_match: { label: 'NEW MATCH', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  notified_admin: { label: 'NOTIFIED', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  provider_contacted: { label: 'PROVIDER CONTACTED', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  client_contacted: { label: 'CLIENT CONTACTED', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  provider_accepted: { label: 'PROVIDER ACCEPTED', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  client_accepted: { label: 'CLIENT ACCEPTED', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  agreement_needed: { label: 'AGREEMENT NEEDED', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  introduced: { label: 'INTRODUCED', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  won: { label: 'WON', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  lost: { label: 'LOST', color: 'bg-white/5 text-white/30 border-white/10' },
  dismissed: { label: 'DISMISSED', color: 'bg-white/5 text-white/30 border-white/10' },
};

export default function DealMatchesPage() {
  const [mounted, setMounted] = useState(false);
  const [matches, setMatches] = useState<DealMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isRunningMatchmaker, setIsRunningMatchmaker] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/deal-matches');
      const data = await res.json();
      if (data.success) {
        setMatches(data.matches);
      }
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunMatchmaker = async () => {
    setIsRunningMatchmaker(true);
    try {
      const res = await fetch('/api/matchmaker/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'all' })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Matchmaker completed: ${data.results.map((r: any) => `${r.loop_type}: ${r.items_created} created`).join(', ')}`);
        fetchMatches();
      }
    } catch (error) {
      console.error('Failed to run matchmaker:', error);
    } finally {
      setIsRunningMatchmaker(false);
    }
  };

  const handleUpdateStatus = async (matchId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/deal-matches/${matchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchMatches();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const filteredMatches = matches.filter(match => {
    if (filterStatus === 'all') return true;
    return match.status === filterStatus;
  });

  const stats = {
    total: matches.length,
    new: matches.filter(m => m.status === 'new_match').length,
    inProgress: matches.filter(m => ['provider_contacted', 'client_contacted', 'provider_accepted', 'client_accepted'].includes(m.status)).length,
    won: matches.filter(m => m.status === 'won').length,
    totalValue: matches.reduce((sum, m) => sum + (m.estimated_job_value || 0), 0),
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
              <Handshake className="w-7 h-7 text-cyan-400" />
              Deal Matches
            </h1>
            <p className="text-sm text-white/40 mt-1">Matched opportunities between intent leads and providers</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={fetchMatches}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/[0.08] text-white/70 hover:bg-white/[0.06] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
              Refresh
            </button>
            
            <button
              onClick={handleRunMatchmaker}
              disabled={isRunningMatchmaker}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-colors disabled:opacity-50"
            >
              <Play className={cn('w-4 h-4', isRunningMatchmaker && 'animate-pulse')} />
              Run Matchmaker
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="p-4 bg-[#0f0f14] border border-white/[0.06]">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-white/40 uppercase">Total Matches</div>
          </div>
          <div className="p-4 bg-[#0f0f14] border border-white/[0.06]">
            <div className="text-2xl font-bold text-cyan-400">{stats.new}</div>
            <div className="text-xs text-white/40 uppercase">New</div>
          </div>
          <div className="p-4 bg-[#0f0f14] border border-white/[0.06]">
            <div className="text-2xl font-bold text-amber-400">{stats.inProgress}</div>
            <div className="text-xs text-white/40 uppercase">In Progress</div>
          </div>
          <div className="p-4 bg-[#0f0f14] border border-white/[0.06]">
            <div className="text-2xl font-bold text-emerald-400">{stats.won}</div>
            <div className="text-xs text-white/40 uppercase">Won</div>
          </div>
          <div className="p-4 bg-[#0f0f14] border border-white/[0.06]">
            <div className="text-2xl font-bold text-purple-400">
              £{stats.totalValue.toLocaleString()}
            </div>
            <div className="text-xs text-white/40 uppercase">Total Value</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#0f0f14] border border-white/[0.06] px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
          >
            <option value="all">All Status</option>
            <option value="new_match">New Match</option>
            <option value="notified_admin">Notified</option>
            <option value="provider_contacted">Provider Contacted</option>
            <option value="client_contacted">Client Contacted</option>
            <option value="provider_accepted">Provider Accepted</option>
            <option value="client_accepted">Client Accepted</option>
            <option value="agreement_needed">Agreement Needed</option>
            <option value="introduced">Introduced</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        {/* Matches Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="text-center py-20">
            <Handshake className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Deal Matches</h3>
            <p className="text-white/40 mb-4">Run the matchmaker to find opportunities.</p>
            <button
              onClick={handleRunMatchmaker}
              disabled={isRunningMatchmaker}
              className="flex items-center gap-2 px-6 py-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-colors mx-auto"
            >
              <Play className="w-4 h-4" />
              Run Matchmaker Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMatches.map((match) => {
              const status = statusConfig[match.status] || statusConfig.new_match;
              
              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#0f0f14] border border-white/[0.06] p-5"
                >
                  <div className="flex items-start justify-between">
                    {/* Left: Match Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={cn('px-2 py-0.5 text-[10px] font-bold border rounded-sm', status.color)}>
                          {status.label}
                        </span>
                        <span className="text-xs text-white/30">
                          {new Date(match.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-6 mb-4">
                        {/* Client Need */}
                        <div>
                          <div className="text-[10px] text-white/30 uppercase mb-1">Client Need</div>
                          <div className="text-white font-medium">{match.client_need || 'Unknown need'}</div>
                          <div className="text-sm text-cyan-400">{match.service_category}</div>
                          {match.client_location && (
                            <div className="flex items-center gap-1 text-sm text-white/50 mt-1">
                              <MapPin className="w-3 h-3" />
                              {match.client_location}
                            </div>
                          )}
                        </div>

                        {/* Provider */}
                        <div>
                          <div className="text-[10px] text-white/30 uppercase mb-1">Matched Provider</div>
                          <div className="text-white font-medium">{match.provider_name || 'Unknown provider'}</div>
                          {match.provider_rating && (
                            <div className="flex items-center gap-1 text-sm text-amber-400 mt-1">
                              <TrendingUp className="w-3 h-3" />
                              {match.provider_rating}★
                            </div>
                          )}
                          {match.distance_miles && (
                            <div className="text-sm text-white/50 mt-1">
                              {match.distance_miles.toFixed(1)} miles away
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Match Score & Value */}
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/40">Match Score</span>
                          <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                'h-full rounded-full',
                                match.match_score >= 80 ? 'bg-emerald-400' :
                                match.match_score >= 60 ? 'bg-cyan-400' :
                                'bg-amber-400'
                              )}
                              style={{ width: `${match.match_score}%` }}
                            />
                          </div>
                          <span className={cn(
                            'text-sm font-bold',
                            match.match_score >= 80 ? 'text-emerald-400' :
                            match.match_score >= 60 ? 'text-cyan-400' :
                            'text-amber-400'
                          )}>
                            {match.match_score}%
                          </span>
                        </div>

                        {match.estimated_job_value && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm text-white/60">Est. Value:</span>
                            <span className="text-sm text-emerald-400 font-medium">
                              £{match.estimated_job_value.toLocaleString()}
                            </span>
                          </div>
                        )}

                        {match.proposed_commission_value && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white/60">Commission:</span>
                            <span className="text-sm text-purple-400 font-medium">
                              {match.proposed_commission_type === 'percentage' 
                                ? `${match.proposed_commission_value}%`
                                : `£${match.proposed_commission_value}`}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Match Reasons */}
                      {match.match_reasons && match.match_reasons.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {match.match_reasons.map((reason, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-1 bg-white/[0.03] text-white/50 text-xs border border-white/[0.06]"
                            >
                              {reason}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      <a
                        href={`/deal-matches/${match.id}/scripts`}
                        className="flex items-center gap-2 px-3 py-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs hover:bg-cyan-500/20 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Scripts
                      </a>
                      
                      {match.status === 'new_match' && (
                        <button
                          onClick={() => handleUpdateStatus(match.id, 'provider_contacted')}
                          className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] border border-white/[0.08] text-white/70 text-xs hover:bg-white/[0.06] transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Mark Contacted
                        </button>
                      )}
                      
                      {match.status === 'provider_contacted' && (
                        <button
                          onClick={() => handleUpdateStatus(match.id, 'provider_accepted')}
                          className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/20 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Provider Accept
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleUpdateStatus(match.id, 'dismissed')}
                        className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] border border-white/[0.08] text-white/40 text-xs hover:bg-white/[0.06] transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Dismiss
                      </button>
                    </div>
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
