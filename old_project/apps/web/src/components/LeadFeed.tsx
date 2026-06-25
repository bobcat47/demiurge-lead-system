'use client';

import { useEffect, useState } from 'react';
import { 
  Zap, MapPin, Clock, DollarSign, CheckCircle2, XCircle, 
  ChevronDown, ChevronUp, Send
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Lead {
  id: string;
  lead_number: number;
  title: string;
  summary: string;
  status: string;
  priority_score: number;
  match_count: number;
  detected_at: string;
  raw_post: { content: string; source_url: string; author_name: string | null };
  parsed_intent: {
    service_category: string | null;
    urgency: string;
    budget: string;
    locations: string[];
    lead_quality_score: number;
    signals: Record<string, boolean>;
  };
  matches?: LeadMatch[];
}

interface LeadMatch {
  id: string;
  match_score: number;
  match_reasons: string[];
  status: string;
  provider: {
    id: string;
    business_name: string;
    rating: number;
    response_time: string;
    emergency_available: boolean;
  };
}

export function LeadFeed() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchLeads();
  }, [filter]);

  async function fetchLeads() {
    try {
      const url = filter === 'all' ? '/api/leads' : `/api/leads?status=${filter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  }

  async function approveLead(leadId: string) {
    await fetch(`/api/leads/${leadId}/approve`, { method: 'POST' });
    fetchLeads();
  }

  async function rejectLead(leadId: string) {
    await fetch(`/api/leads/${leadId}/reject`, { method: 'POST' });
    fetchLeads();
  }

  if (loading) return <div className="text-slate-500">Loading leads...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-500">Filter:</span>
        {['all', 'new', 'matched', 'approved'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${
              filter === status ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {leads.length === 0 && (
          <div className="text-center py-16">
            <Zap className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">No leads found</p>
            <p className="text-sm text-slate-600 mt-1">New leads will appear here</p>
          </div>
        )}

        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            isExpanded={expandedLead === lead.id}
            onToggle={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
            onApprove={() => approveLead(lead.id)}
            onReject={() => rejectLead(lead.id)}
          />
        ))}
      </div>
    </div>
  );
}

function LeadCard({ lead, isExpanded, onToggle, onApprove, onReject }: {
  lead: Lead; isExpanded: boolean; onToggle: () => void;
  onApprove: () => void; onReject: () => void;
}) {
  const intent = lead.parsed_intent;
  const isUrgent = intent.urgency === 'urgent';

  return (
    <div className={`rounded-xl border ${isUrgent ? 'border-amber-500/30 bg-amber-500/5' : 'border-slate-800 bg-slate-900'}`}>
      <div onClick={onToggle} className="p-4 cursor-pointer hover:bg-slate-800/50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-xs font-medium border bg-blue-500/10 text-blue-400 border-blue-500/20">
                #{lead.lead_number}
              </span>
              {isUrgent && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                  🚨 {intent.urgency}
                </span>
              )}
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-500/10 text-indigo-400">
                {intent.service_category || 'Unknown'}
              </span>
            </div>
            <h3 className="font-semibold text-slate-200 truncate">{lead.title}</h3>
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{lead.summary}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-400">{intent.lead_quality_score}</div>
              <div className="text-xs text-slate-500">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{lead.match_count}</div>
              <div className="text-xs text-slate-500">Matches</div>
            </div>
            <button className="p-1 rounded-lg hover:bg-slate-700">
              {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDistanceToNow(new Date(lead.detected_at), { addSuffix: true })}</span>
          {intent.locations.length > 0 && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{intent.locations.join(', ')}</span>}
          <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{intent.budget}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-slate-800">
          <div className="p-4 bg-slate-950/50">
            <h4 className="text-sm font-medium text-slate-400 mb-2">Original Post</h4>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <p className="text-sm text-slate-300 whitespace-pre-wrap">{lead.raw_post.content}</p>
            </div>
          </div>

          {lead.matches && lead.matches.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-800">
              <h4 className="text-sm font-medium text-slate-400 mb-3">Recommended Providers ({lead.matches.length})</h4>
              <div className="space-y-2">
                {lead.matches.map((match) => (
                  <div key={match.id} className="p-3 rounded-lg border border-slate-700 bg-slate-800/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {match.match_score}%
                        </div>
                        <div>
                          <div className="font-medium text-slate-200">{match.provider.business_name}</div>
                          <div className="text-xs text-slate-500">
                            ⭐ {match.provider.rating} • ⏱ {match.provider.response_time}
                            {match.provider.emergency_available && ' • 🚨 24/7'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {match.match_reasons.map((reason, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs">{reason}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lead.status === 'new' && (
            <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button onClick={onReject} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800">
                <XCircle className="w-4 h-4 inline mr-2" />Reject
              </button>
              <button onClick={onApprove} className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white">
                <CheckCircle2 className="w-4 h-4 inline mr-2" />Approve
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
