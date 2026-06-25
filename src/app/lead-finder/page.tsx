'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crosshair, 
  Search,
  MapPin,
  Building2,
  Loader2,
  Filter,
  Grid3X3,
  List,
  AlertCircle,
  CheckCircle2,
  Database,
  Activity,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { LeadCard } from '@/components/lead-finder/LeadCard';
import { LeadDetailDrawer } from '@/components/lead-finder/LeadDetailDrawer';
import { Lead, LeadSearchParams } from '@/lib/lead-finder/types';
import { 
  searchLeads, 
  generateAIAnalysis, 
  sendToVapi, 
  saveLead,
  updateLeadStatus
} from '@/lib/lead-finder';
import { cn } from '@/lib/utils';

const businessTypeSuggestions = [
  'plumber', 'electrician', 'dentist', 'barber', 'pharmacy', 
  'restaurant', 'accountant', 'roofer', 'estate agent', 'mechanic',
  'cafe', 'gym', 'salon', 'lawyer', 'builder'
];

const locationSuggestions = [
  'London', 'Westminster', 'Manchester', 'Birmingham', 
  'Camden', 'Central London', 'Chelsea', 'Kensington',
  'Leeds', 'Liverpool', 'Bristol', 'Edinburgh',
  'New York', 'Los Angeles', 'Chicago', 'Houston'
];

export default function LeadFinderPage() {
  const [mounted, setMounted] = useState(false);
  const [businessType, setBusinessType] = useState('');
  const [location, setLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [usingRealData, setUsingRealData] = useState(false);
  const [providerName, setProviderName] = useState('mock');
  const [providerError, setProviderError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [sendingToVapiId, setSendingToVapiId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSearch = async () => {
    if (!businessType.trim() || !location.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    // Reset provider state before search (will be updated from API response)
    setUsingRealData(false);
    setProviderName('loading');
    setProviderError(null);
    
    try {
      const params: LeadSearchParams = {
        businessType: businessType.trim(),
        location: location.trim(),
        limit: 20,
      };
      
      const result = await searchLeads(params);
      setLeads(result.leads);
      
      // Update provider status based on actual API response (source of truth)
      if (result.provider) {
        setUsingRealData(result.provider !== 'mock');
        setProviderName(result.provider);
      }
      if (result.providerError) {
        setProviderError(result.providerError);
      } else {
        setProviderError(null);
      }
      
      // Show notification about data source
      if (result.provider && result.provider !== 'mock') {
        setNotification({ 
          message: `Found ${result.leads.length} leads using ${result.provider}`, 
          type: 'success' 
        });
      } else if (result.providerError) {
        setNotification({ 
          message: `API error - showing demo data`, 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Search failed:', error);
      setNotification({ message: 'Search failed. Please try again.', type: 'error' });
    } finally {
      setIsSearching(false);
    }
  };

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDrawerOpen(true);
    // Update status to reviewed
    if (lead.status === 'new') {
      updateLeadStatus(lead.id, 'reviewed');
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: 'reviewed' } : l));
    }
  };

  const handleGenerateProposal = async (lead: Lead) => {
    setGeneratingId(lead.id);
    
    try {
      const analysis = await generateAIAnalysis(lead);
      
      // Update lead in list
      setLeads(prev => prev.map(l => 
        l.id === lead.id 
          ? { ...l, aiAnalysis: analysis, status: 'proposal_generated' }
          : l
      ));
      
      // Update selected lead if open
      if (selectedLead?.id === lead.id) {
        setSelectedLead({ ...lead, aiAnalysis: analysis, status: 'proposal_generated' });
      }
      
      setNotification({ message: 'AI proposal generated successfully!', type: 'success' });
    } catch (error) {
      console.error('Generation failed:', error);
      setNotification({ message: 'Failed to generate proposal.', type: 'error' });
    } finally {
      setGeneratingId(null);
    }
  };

  const handleSendToVapi = async (lead: Lead) => {
    setSendingToVapiId(lead.id);
    
    try {
      const result = await sendToVapi(lead.id);
      
      if (result.success) {
        updateLeadStatus(lead.id, 'contacted');
        setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: 'contacted' } : l));
        setNotification({ message: result.message, type: 'success' });
      } else {
        setNotification({ message: result.message, type: 'error' });
      }
    } catch (error) {
      console.error('Vapi send failed:', error);
      setNotification({ message: 'Failed to queue Vapi call.', type: 'error' });
    } finally {
      setSendingToVapiId(null);
    }
  };

  const handleSaveLead = async (lead: Lead) => {
    try {
      const newStatus = lead.status === 'saved' ? 'reviewed' : 'saved';
      await saveLead({ ...lead, status: newStatus });
      
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: newStatus } : l));
      
      if (selectedLead?.id === lead.id) {
        setSelectedLead({ ...lead, status: newStatus });
      }
      
      setNotification({ 
        message: newStatus === 'saved' ? 'Lead saved!' : 'Lead unsaved.', 
        type: 'success' 
      });
    } catch (error) {
      console.error('Save failed:', error);
      setNotification({ message: 'Failed to save lead.', type: 'error' });
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] grid-bg">
      <Header />
      
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={cn(
              'fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 border shadow-lg',
              notification.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            )}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
      
      <main className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Crosshair className="w-7 h-7 text-cyan-400" />
            Lead Finder
          </h1>
          <p className="text-sm text-white/40 mt-1">Manually search for local business leads by type and location</p>
        </div>

        {/* Search Panel */}
        <div className="p-6 bg-[#0f0f14] border border-white/[0.06]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Business Type */}
            <div>
              <label className="block text-sm text-white/60 mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Business Type
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="e.g., plumber, dentist, barber"
                  className="w-full bg-black/30 border border-white/[0.08] rounded-none px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                  list="business-types"
                />
                <datalist id="business-types">
                  {businessTypeSuggestions.map(type => (
                    <option key={type} value={type} />
                  ))}
                </datalist>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['plumber', 'electrician', 'dentist', 'barber'].map(type => (
                  <button
                    key={type}
                    onClick={() => setBusinessType(type)}
                    className="px-2 py-1 text-xs bg-white/[0.03] text-white/40 border border-white/[0.06] hover:text-cyan-400 hover:border-cyan-500/20 transition-colors"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Location */}
            <div>
              <label className="block text-sm text-white/60 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="e.g., London, Manchester"
                  className="w-full bg-black/30 border border-white/[0.08] rounded-none px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                  list="locations"
                />
                <datalist id="locations">
                  {locationSuggestions.map(loc => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['London', 'Westminster', 'Manchester', 'Birmingham'].map(loc => (
                  <button
                    key={loc}
                    onClick={() => setLocation(loc)}
                    className="px-2 py-1 text-xs bg-white/[0.03] text-white/40 border border-white/[0.06] hover:text-cyan-400 hover:border-cyan-500/20 transition-colors"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Search Button */}
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={isSearching || !businessType.trim() || !location.trim()}
                className={cn(
                  'w-full flex items-center justify-center gap-2 px-6 py-3 font-medium transition-all border',
                  isSearching || !businessType.trim() || !location.trim()
                    ? 'bg-white/[0.03] border-white/[0.06] text-white/30 cursor-not-allowed'
                    : 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30'
                )}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Find Leads
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Data Source Note */}
          <div className={cn(
            "mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-2 text-xs",
            usingRealData ? "text-emerald-400" : providerError ? "text-rose-400" : "text-white/30"
          )}>
            <AlertCircle className="w-4 h-4" />
            {usingRealData ? (
              <span>
                Using LIVE DATA from <strong className="uppercase">{providerName}</strong>. 
                Results are from real business listings.
              </span>
            ) : providerError ? (
              <span>
                <strong>API Error:</strong> {providerError.includes('not activated') 
                  ? 'Google Places API not enabled in Google Cloud Console. Showing demo data.' 
                  : providerError}
              </span>
            ) : (
              <span>
                Using MOCK DATA for demonstration. 
                Add GOOGLE_PLACES_API_KEY, SERPAPI_KEY, or APIFY_TOKEN environment variable for live search.
              </span>
            )}
          </div>
        </div>

        {/* Results Section */}
        {hasSearched && (
          <div className="space-y-4">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-white">
                    {isSearching ? 'Searching...' : `${leads.length} Leads Found`}
                  </h2>
                  {hasSearched && !isSearching && (
                    <span className={cn(
                      "px-2 py-0.5 text-[10px] font-bold uppercase border rounded-sm",
                      usingRealData 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                        : providerError
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    )}>
                      {usingRealData ? `LIVE • ${providerName}` : providerError ? 'API ERROR' : 'MOCK DATA'}
                    </span>
                  )}
                </div>
                {!isSearching && (
                  <p className="text-sm text-white/40">
                    {businessType} in {location}
                  </p>
                )}
              </div>
              
              {!isSearching && leads.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-2 transition-colors',
                      viewMode === 'grid' ? 'text-cyan-400' : 'text-white/30 hover:text-white/60'
                    )}
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'p-2 transition-colors',
                      viewMode === 'list' ? 'text-cyan-400' : 'text-white/30 hover:text-white/60'
                    )}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Debug Info Panel */}
            {hasSearched && !isSearching && leads.length > 0 && (
              <div className={cn(
                "mb-4 p-3 border flex items-center justify-between",
                providerError 
                  ? "bg-rose-500/5 border-rose-500/20" 
                  : "bg-white/[0.02] border-white/[0.06]"
              )}>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Database className={cn(
                      "w-4 h-4",
                      providerError ? "text-rose-400/50" : "text-white/30"
                    )} />
                    <span className="text-xs text-white/40">Data Source:</span>
                    <span className={cn(
                      "text-xs font-bold uppercase",
                      usingRealData ? "text-emerald-400" : providerError ? "text-rose-400" : "text-amber-400"
                    )}>
                      {usingRealData ? `Live ${providerName}` : providerError ? `API Error - Mock Fallback` : 'Mock Data'}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-white/[0.1]" />
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-white/30" />
                    <span className="text-xs text-white/40">Results:</span>
                    <span className="text-xs text-white font-mono">{leads.length}</span>
                  </div>
                </div>
                {usingRealData ? (
                  <span className="text-[10px] text-emerald-400/60">
                    ✓ Real business data from API
                  </span>
                ) : providerError ? (
                  <span className="text-[10px] text-rose-400/80 truncate max-w-xs" title={providerError}>
                    ⚠ {providerError.includes('not activated') ? 'API not enabled in Google Cloud' : providerError.slice(0, 50)}
                  </span>
                ) : null}
              </div>
            )}

            {/* Results Grid */}
            {isSearching ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
                  <p className="text-white/60">Scanning business directories...</p>
                  {usingRealData && (
                    <p className="text-xs text-emerald-400 mt-2">
                      Connected to {providerName}...
                    </p>
                  )}
                </div>
              </div>
            ) : leads.length === 0 ? (
              <div className="text-center py-20">
                <Crosshair className="w-16 h-16 text-white/10 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No leads found</h3>
                <p className="text-white/40">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className={cn(
                'grid gap-4',
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1'
              )}>
                {leads.map((lead, index) => (
                  <motion.div
                    key={lead.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <LeadCard
                      lead={lead}
                      onViewDetails={handleViewDetails}
                      onGenerateProposal={handleGenerateProposal}
                      onSendToVapi={handleSendToVapi}
                      onSaveLead={handleSaveLead}
                      isGenerating={generatingId === lead.id}
                      isSendingToVapi={sendingToVapiId === lead.id}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty State - Before Search */}
        {!hasSearched && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative mb-6">
              <div className="w-24 h-24 border border-cyan-500/20 flex items-center justify-center">
                <Crosshair className="w-10 h-10 text-cyan-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 animate-pulse" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-purple-500 animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Start Your Search</h3>
            <p className="text-white/40 max-w-md">
              Enter a business type and location to discover potential leads. 
              Our system will scan multiple sources to find matching businesses.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-8 max-w-md">
              <div className="p-4 bg-white/[0.03] border border-white/[0.06] text-center">
                <div className="text-3xl font-bold text-cyan-400 mb-1">20+</div>
                <div className="text-xs text-white/40">Business Types</div>
              </div>
              <div className="p-4 bg-white/[0.03] border border-white/[0.06] text-center">
                <div className="text-3xl font-bold text-purple-400 mb-1">50+</div>
                <div className="text-xs text-white/40">Locations</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Lead Detail Drawer */}
      <LeadDetailDrawer
        lead={selectedLead}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onGenerateProposal={handleGenerateProposal}
        onSendToVapi={handleSendToVapi}
        onSaveLead={handleSaveLead}
        isGenerating={generatingId === selectedLead?.id}
        isSendingToVapi={sendingToVapiId === selectedLead?.id}
      />
    </div>
  );
}
