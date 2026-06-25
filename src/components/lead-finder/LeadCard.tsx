'use client';

import { Lead } from '@/lib/lead-finder/types';
import { cn } from '@/lib/utils';
import { 
  MapPin, 
  Phone, 
  Globe, 
  Star, 
  ExternalLink,
  Bot,
  PhoneCall,
  Bookmark,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  onViewDetails: (lead: Lead) => void;
  onGenerateProposal: (lead: Lead) => void;
  onSendToVapi: (lead: Lead) => void;
  onSaveLead: (lead: Lead) => void;
  isGenerating?: boolean;
  isSendingToVapi?: boolean;
}

const statusConfig = {
  new: { label: 'NEW', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  reviewed: { label: 'REVIEWED', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  proposal_generated: { label: 'PROPOSAL READY', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  contacted: { label: 'CONTACTED', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  saved: { label: 'SAVED', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
};

export function LeadCard({ 
  lead, 
  onViewDetails, 
  onGenerateProposal, 
  onSendToVapi, 
  onSaveLead,
  isGenerating,
  isSendingToVapi
}: LeadCardProps) {
  const status = statusConfig[lead.status];
  
  return (
    <div className="group relative bg-[#0f0f14] border border-white/[0.06] hover:border-cyan-500/30 transition-all duration-200 overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-white/30">{lead.id.split('-')[0]}</span>
              <span className={cn('px-2 py-0.5 text-[10px] font-bold border rounded-sm', status.color)}>
                {status.label}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
              {lead.businessName}
            </h3>
            <p className="text-sm text-white/50">{lead.category}</p>
          </div>
          
          {/* Lead Score */}
          <div className="text-right ml-4">
            <div className={cn(
              'text-2xl font-bold font-mono',
              lead.leadScore >= 80 ? 'text-emerald-400' :
              lead.leadScore >= 60 ? 'text-cyan-400' :
              lead.leadScore >= 40 ? 'text-amber-400' : 'text-rose-400'
            )}>
              {lead.leadScore}
            </div>
            <div className="text-[10px] text-white/30 uppercase">Score</div>
          </div>
        </div>
        
        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <MapPin className="w-4 h-4 text-white/30 flex-shrink-0" />
            <span className="truncate">{lead.location}</span>
          </div>
          
          {lead.phone && (
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Phone className="w-4 h-4 text-white/30 flex-shrink-0" />
              <span className="truncate">{lead.phone}</span>
            </div>
          )}
          
          {lead.website && (
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Globe className="w-4 h-4 text-white/30 flex-shrink-0" />
              <span className="truncate">{lead.website.replace(/^https?:\/\//, '')}</span>
            </div>
          )}
          
          {lead.rating && (
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
              <span className="text-white/60">{lead.rating}</span>
              {lead.reviewCount && (
                <span className="text-white/30">({lead.reviewCount} reviews)</span>
              )}
            </div>
          )}
        </div>
        
        {/* Services Tags */}
        {lead.services && lead.services.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {lead.services.slice(0, 3).map((service, idx) => (
              <span 
                key={idx}
                className="px-2 py-1 bg-white/[0.03] text-white/40 text-xs border border-white/[0.06]"
              >
                {service}
              </span>
            ))}
            {lead.services.length > 3 && (
              <span className="px-2 py-1 text-white/30 text-xs">
                +{lead.services.length - 3}
              </span>
            )}
          </div>
        )}
        
        {/* Source & AI Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-white/30">Source: {lead.source}</span>
          {lead.aiAnalysis && (
            <span className="flex items-center gap-1 text-xs text-amber-400">
              <Sparkles className="w-3 h-3" />
              AI Analysis Ready
            </span>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => onViewDetails(lead)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white/[0.03] border border-white/[0.08] text-white/70 text-xs hover:bg-white/[0.06] hover:text-white hover:border-white/[0.12] transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Details
          </button>
          
          <button
            onClick={() => onGenerateProposal(lead)}
            disabled={isGenerating}
            className={cn(
              'flex items-center justify-center gap-1.5 px-3 py-2 text-xs transition-all border',
              lead.aiAnalysis 
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20',
              isGenerating && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isGenerating ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Bot className="w-3.5 h-3.5" />
            )}
            {lead.aiAnalysis ? 'Regenerate' : 'AI Generate'}
          </button>
          
          <button
            onClick={() => onSendToVapi(lead)}
            disabled={isSendingToVapi || !lead.phone}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs hover:bg-purple-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isSendingToVapi ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <PhoneCall className="w-3.5 h-3.5" />
            )}
            Vapi
          </button>
          
          <button
            onClick={() => onSaveLead(lead)}
            className={cn(
              'flex items-center justify-center gap-1.5 px-3 py-2 text-xs transition-all border',
              lead.status === 'saved'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-white/[0.03] border-white/[0.08] text-white/70 hover:bg-white/[0.06] hover:text-white'
            )}
          >
            <Bookmark className={cn('w-3.5 h-3.5', lead.status === 'saved' && 'fill-current')} />
            {lead.status === 'saved' ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
