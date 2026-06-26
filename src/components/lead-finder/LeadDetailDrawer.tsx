'use client';

import { Lead, AIAnalysis } from '@/lib/lead-finder/types';
import { useAIStatus } from '@/hooks/useAIStatus';
import { cn } from '@/lib/utils';
import { 
  X, 
  MapPin, 
  Phone, 
  Globe, 
  Mail, 
  Star, 
  Clock,
  ExternalLink,
  Bot,
  PhoneCall,
  Bookmark,
  Sparkles,
  AlertTriangle,
  Target,
  FileText,
  MessageSquare,
  Zap,
  CheckCircle2,
  Settings
} from 'lucide-react';
import { useState } from 'react';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onGenerateProposal: (lead: Lead) => void;
  onSendToVapi: (lead: Lead) => void;
  onSaveLead: (lead: Lead) => void;
  isGenerating?: boolean;
  isSendingToVapi?: boolean;
}

export function LeadDetailDrawer({ 
  lead, 
  isOpen, 
  onClose,
  onGenerateProposal,
  onSendToVapi,
  onSaveLead,
  isGenerating,
  isSendingToVapi
}: LeadDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'ai-analysis'>('overview');
  const aiStatus = useAIStatus();
  
  if (!lead) return null;

  const hasAIAnalysis = !!lead.aiAnalysis;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div className={cn(
        'fixed top-0 right-0 h-full w-full max-w-2xl bg-[#0a0a0f] border-l border-white/[0.06] z-50 transform transition-transform duration-300 ease-out overflow-hidden',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-white/30">TARGET DOSSIER</span>
              <span className="text-[10px] font-mono text-cyan-400">{lead.id}</span>
            </div>
            <h2 className="text-xl font-bold text-white">{lead.businessName}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg bg-white/[0.03] text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-white/[0.06]">
          <button
            onClick={() => setActiveTab('overview')}
            className={cn(
              'flex-1 px-6 py-3 text-sm font-medium transition-colors border-b-2',
              activeTab === 'overview' 
                ? 'text-cyan-400 border-cyan-400' 
                : 'text-white/40 border-transparent hover:text-white/60'
            )}
          >
            Intelligence Overview
          </button>
          <button
            onClick={() => setActiveTab('ai-analysis')}
            className={cn(
              'flex-1 px-6 py-3 text-sm font-medium transition-colors border-b-2 flex items-center justify-center gap-2',
              activeTab === 'ai-analysis' 
                ? 'text-amber-400 border-amber-400' 
                : 'text-white/40 border-transparent hover:text-white/60'
            )}
          >
            <Sparkles className="w-4 h-4" />
            AI Analysis
            {hasAIAnalysis && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
        </div>
        
        {/* Content */}
        <div className="h-[calc(100%-140px)] overflow-y-auto">
          {activeTab === 'overview' ? (
            <div className="p-6 space-y-6">
              {/* Score & Status */}
              <div className="flex items-center gap-4">
                <div className={cn(
                  'px-4 py-3 border',
                  lead.leadScore >= 80 ? 'bg-emerald-500/5 border-emerald-500/20' :
                  lead.leadScore >= 60 ? 'bg-cyan-500/5 border-cyan-500/20' :
                  'bg-amber-500/5 border-amber-500/20'
                )}>
                  <div className={cn(
                    'text-3xl font-bold font-mono',
                    lead.leadScore >= 80 ? 'text-emerald-400' :
                    lead.leadScore >= 60 ? 'text-cyan-400' :
                    'text-amber-400'
                  )}>
                    {lead.leadScore}
                  </div>
                  <div className="text-[10px] text-white/30 uppercase">Lead Score</div>
                </div>
                
                <div className="flex-1 px-4 py-3 bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-white font-medium capitalize">{lead.status.replace('_', ' ')}</div>
                  <div className="text-[10px] text-white/30 uppercase">Status</div>
                </div>
                
                <div className="px-4 py-3 bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-white font-medium">{lead.source}</div>
                  <div className="text-[10px] text-white/30 uppercase">Source</div>
                </div>
              </div>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Contact Intelligence
                </h3>
                
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.06]">
                    <MapPin className="w-5 h-5 text-cyan-400" />
                    <div>
                      <div className="text-white">{lead.address}</div>
                      <div className="text-xs text-white/40">{lead.location}</div>
                    </div>
                  </div>
                  
                  {lead.phone && (
                    <div className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.06]">
                      <Phone className="w-5 h-5 text-emerald-400" />
                      <div className="text-white">{lead.phone}</div>
                    </div>
                  )}
                  
                  {lead.email && (
                    <div className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.06]">
                      <Mail className="w-5 h-5 text-amber-400" />
                      <div className="text-white">{lead.email}</div>
                    </div>
                  )}
                  
                  {lead.website && (
                    <a 
                      href={lead.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors group"
                    >
                      <Globe className="w-5 h-5 text-purple-400" />
                      <div className="flex-1 text-white group-hover:text-cyan-400 transition-colors">{lead.website}</div>
                      <ExternalLink className="w-4 h-4 text-white/30" />
                    </a>
                  )}
                </div>
              </div>
              
              {/* Rating & Reviews */}
              {lead.rating && (
                <div className="p-4 bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star}
                          className={cn(
                            'w-5 h-5',
                            star <= Math.round(lead.rating!) 
                              ? 'text-amber-400 fill-amber-400' 
                              : 'text-white/10'
                          )}
                        />
                      ))}
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-white">{lead.rating}</span>
                      {lead.reviewCount && (
                        <span className="text-white/40 ml-2">({lead.reviewCount} reviews)</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Services */}
              {lead.services && lead.services.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
                    Services Detected
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {lead.services.map((service, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1.5 bg-cyan-500/10 text-cyan-400 text-sm border border-cyan-500/20"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Opening Hours */}
              {lead.openingHours && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Operating Hours
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(lead.openingHours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between p-2 bg-white/[0.03] border border-white/[0.06]">
                        <span className="text-white/60">{day}</span>
                        <span className="text-white">{hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Social Links */}
              {lead.socialLinks && Object.keys(lead.socialLinks).length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
                    Social Presence
                  </h3>
                  <div className="flex gap-2">
                    {lead.socialLinks.facebook && (
                      <a href={lead.socialLinks.facebook} target="_blank" rel="noopener noreferrer" 
                         className="px-3 py-2 bg-blue-500/10 text-blue-400 text-sm border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                        Facebook
                      </a>
                    )}
                    {lead.socialLinks.instagram && (
                      <a href={lead.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                         className="px-3 py-2 bg-pink-500/10 text-pink-400 text-sm border border-pink-500/20 hover:bg-pink-500/20 transition-colors">
                        Instagram
                      </a>
                    )}
                    {lead.socialLinks.twitter && (
                      <a href={lead.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                         className="px-3 py-2 bg-sky-500/10 text-sky-400 text-sm border border-sky-500/20 hover:bg-sky-500/20 transition-colors">
                        Twitter
                      </a>
                    )}
                    {lead.socialLinks.linkedin && (
                      <a href={lead.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                         className="px-3 py-2 bg-indigo-500/10 text-indigo-400 text-sm border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors">
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {!hasAIAnalysis ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  {!aiStatus.available ? (
                    <>
                      <AlertTriangle className="w-16 h-16 text-amber-400/30 mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">AI Proposal Generation Unavailable</h3>
                      <p className="text-white/40 mb-4 max-w-sm">
                        Add a free AI provider key in Settings to enable AI-powered proposal generation.
                      </p>
                      <p className="text-sm text-amber-400/60 mb-6">
                        Supported: OpenRouter, Google Gemini, Groq (all have free tiers)
                      </p>
                      <a
                        href="/settings"
                        className="flex items-center gap-2 px-6 py-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Go to Settings
                      </a>
                    </>
                  ) : (
                    <>
                      <Bot className="w-16 h-16 text-white/10 mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">No AI Analysis Yet</h3>
                      <p className="text-white/40 mb-6 max-w-sm">
                        Generate an AI proposal and Vapi call script tailored for this lead.
                      </p>
                      <button
                        onClick={() => onGenerateProposal(lead)}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-6 py-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-colors disabled:opacity-50"
                      >
                        {isGenerating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Generate AI Proposal
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Generated Badge */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/20">
                    <CheckCircle2 className="w-5 h-5 text-amber-400" />
                    <span className="text-amber-400">AI Analysis Generated</span>
                    <span className="text-white/30 text-sm ml-auto">
                      {new Date(lead.aiAnalysis!.generatedAt).toLocaleString()}
                    </span>
                  </div>
                  
                  {/* Business Summary */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Business Summary
                    </h3>
                    <p className="text-white/80 leading-relaxed p-4 bg-white/[0.03] border border-white/[0.06]">
                      {lead.aiAnalysis!.businessSummary}
                    </p>
                  </div>
                  
                  {/* Why Good Lead */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Why This Is A Good Lead
                    </h3>
                    <p className="text-white/80 leading-relaxed p-4 bg-white/[0.03] border border-white/[0.06]">
                      {lead.aiAnalysis!.whyGoodLead}
                    </p>
                  </div>
                  
                  {/* Pain Points */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Pain Points Detected
                    </h3>
                    <ul className="space-y-2">
                      {lead.aiAnalysis!.painPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-white/70 p-3 bg-white/[0.03] border border-white/[0.06]">
                          <span className="text-rose-400 mt-0.5">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Opportunities */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Opportunities
                    </h3>
                    <ul className="space-y-2">
                      {lead.aiAnalysis!.problemsOpportunities.map((opp, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-white/70 p-3 bg-emerald-500/5 border border-emerald-500/10">
                          <span className="text-emerald-400 mt-0.5">→</span>
                          {opp}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Recommended Package */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
                      Recommended Package
                    </h3>
                    <div className="p-4 bg-cyan-500/10 border border-cyan-500/20">
                      <p className="text-cyan-400 font-medium">{lead.aiAnalysis!.recommendedPackage}</p>
                    </div>
                  </div>
                  
                  {/* Personalized Proposal */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Personalized Proposal
                    </h3>
                    <div className="p-4 bg-white/[0.03] border border-white/[0.06] whitespace-pre-wrap text-white/80 text-sm">
                      {lead.aiAnalysis!.personalizedProposal}
                    </div>
                  </div>
                  
                  {/* Vapi Call Prompt */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-purple-400 uppercase tracking-wider flex items-center gap-2">
                      <PhoneCall className="w-4 h-4" />
                      Vapi Agent Prompt
                    </h3>
                    <div className="p-4 bg-purple-500/5 border border-purple-500/10 whitespace-pre-wrap text-white/70 text-sm font-mono">
                      {lead.aiAnalysis!.vapiCallPrompt}
                    </div>
                  </div>
                  
                  {/* Opening Script */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
                      Opening Call Script
                    </h3>
                    <div className="p-4 bg-white/[0.03] border border-white/[0.06] whitespace-pre-wrap text-white/80 text-sm">
                      {lead.aiAnalysis!.openingCallScript}
                    </div>
                  </div>
                  
                  {/* Objection Handling */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
                      Objection Handling
                    </h3>
                    <div className="space-y-2">
                      {lead.aiAnalysis!.objectionHandling.map((obj, idx) => (
                        <div key={idx} className="p-3 bg-amber-500/5 border border-amber-500/10 text-white/70 text-sm">
                          {obj}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Follow-up Message */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
                      Follow-up Message
                    </h3>
                    <div className="p-4 bg-white/[0.03] border border-white/[0.06] whitespace-pre-wrap text-white/80 text-sm">
                      {lead.aiAnalysis!.followUpMessage}
                    </div>
                  </div>
                  
                  {/* Internal Notes */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-white/30 uppercase tracking-wider">
                      Internal Notes
                    </h3>
                    <div className="p-4 bg-white/[0.02] border border-white/[0.04] whitespace-pre-wrap text-white/50 text-sm">
                      {lead.aiAnalysis!.internalNotes}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/[0.06] bg-[#0a0a0f]">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => aiStatus.available && onGenerateProposal(lead)}
              disabled={isGenerating || !aiStatus.available}
              title={!aiStatus.available ? 'AI proposal generation unavailable — add a free AI provider key in Settings' : undefined}
              className={cn(
                'flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors border',
                !aiStatus.available
                  ? 'bg-white/[0.03] border-white/[0.08] text-white/30 cursor-not-allowed'
                  : hasAIAnalysis
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                    : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20',
                isGenerating && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : !aiStatus.available ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {!aiStatus.available ? 'AI Unavailable' : hasAIAnalysis ? 'Regenerate' : 'AI Generate'}
            </button>
            
            <button
              onClick={() => onSendToVapi(lead)}
              disabled={isSendingToVapi || !lead.phone}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium hover:bg-purple-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isSendingToVapi ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <PhoneCall className="w-4 h-4" />
              )}
              Send to Vapi
            </button>
            
            <button
              onClick={() => onSaveLead(lead)}
              className={cn(
                'flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors border',
                lead.status === 'saved'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-white/[0.05] border-white/[0.10] text-white/70 hover:bg-white/[0.08] hover:text-white'
              )}
            >
              <Bookmark className={cn('w-4 h-4', lead.status === 'saved' && 'fill-current')} />
              {lead.status === 'saved' ? 'Saved' : 'Save Lead'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
