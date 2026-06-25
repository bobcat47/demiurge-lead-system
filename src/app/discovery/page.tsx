'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Radio, 
  Search,
  MapPin,
  Play,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { cn } from '@/lib/utils';

export default function DiscoveryPage() {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [jobStatus, setJobStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const startDiscovery = async () => {
    if (!query || !city) return;
    
    setIsRunning(true);
    setJobStatus('running');
    
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          city,
          sources: ['puppeteer', 'apify-maps'],
          maxResults: 50
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setJobStatus('completed');
        // Poll for results
        pollJobStatus(data.jobId);
      } else {
        setJobStatus('error');
      }
    } catch (error) {
      setJobStatus('error');
    } finally {
      setIsRunning(false);
    }
  };

  const pollJobStatus = async (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/scrape?jobId=${jobId}`);
        const data = await res.json();
        
        if (data.job?.status === 'completed') {
          setResults(data.job.results || []);
          clearInterval(interval);
        } else if (data.job?.status === 'failed') {
          setJobStatus('error');
          clearInterval(interval);
        }
      } catch (error) {
        clearInterval(interval);
      }
    }, 2000);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] grid-bg">
      <Header />
      
      <main className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Radio className="w-7 h-7 text-cyan-400" />
            Field Ops
          </h1>
          <p className="text-sm text-white/40 mt-1">Deploy scout missions to discover new providers</p>
        </div>

        {/* Mission Control */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.06]">
          <h2 className="text-lg font-semibold text-white mb-6">New Scout Mission</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm text-white/60 mb-2">Business Type</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  placeholder="e.g., plumber, electrician"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-black/30 border border-white/[0.08] rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-white/60 mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  placeholder="e.g., New York, NY"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-black/30 border border-white/[0.08] rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={startDiscovery}
                disabled={isRunning || !query || !city}
                className={cn(
                  'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all',
                  isRunning || !query || !city
                    ? 'bg-white/[0.05] text-white/40 cursor-not-allowed'
                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30'
                )}
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Deploy Scout
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Status */}
          {jobStatus !== 'idle' && (
            <div className={cn(
              'p-4 rounded-lg flex items-center gap-3',
              jobStatus === 'running' && 'bg-amber-500/10 border border-amber-500/20',
              jobStatus === 'completed' && 'bg-emerald-500/10 border border-emerald-500/20',
              jobStatus === 'error' && 'bg-rose-500/10 border border-rose-500/20'
            )}>
              {jobStatus === 'running' && <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />}
              {jobStatus === 'completed' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {jobStatus === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
              <span className={cn(
                jobStatus === 'running' && 'text-amber-400',
                jobStatus === 'completed' && 'text-emerald-400',
                jobStatus === 'error' && 'text-rose-400'
              )}>
                {jobStatus === 'running' && 'Scout mission in progress...'}
                {jobStatus === 'completed' && `Mission complete! Found ${results.length} providers.`}
                {jobStatus === 'error' && 'Mission failed. Please try again.'}
              </span>
            </div>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Discovery Results</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.06]"
                >
                  <h4 className="font-medium text-white mb-2">{result.name}</h4>
                  <p className="text-sm text-white/40 mb-3">{result.address}</p>
                  {result.phone && (
                    <p className="text-sm text-cyan-400">{result.phone}</p>
                  )}
                  {result.rating && (
                    <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center gap-2">
                      <span className="text-amber-400">★</span>
                      <span className="text-white/60">{result.rating}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
