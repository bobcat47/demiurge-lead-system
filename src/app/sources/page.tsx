'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Plus,
  Play,
  Pause,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Settings2
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { cn } from '@/lib/utils';

interface Source {
  id: string;
  name: string;
  type: 'reddit' | 'google_maps' | 'facebook' | 'yellow_pages' | 'custom';
  status: 'active' | 'paused' | 'error';
  health: number;
  lastPing: string;
  leadsToday: number;
  config: any;
}

export default function SourcesPage() {
  const [mounted, setMounted] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const res = await fetch('/api/sources');
      const data = await res.json();
      setSources(data.sources || []);
    } catch (error) {
      console.error('Failed to fetch sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSource = async (sourceId: string, currentStatus: string) => {
    // Implementation would toggle source status
    console.log('Toggle source:', sourceId);
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
              <Globe className="w-7 h-7 text-cyan-400" />
              Signal Sources
            </h1>
            <p className="text-sm text-white/40 mt-1">Monitor and control data sources</p>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/20 transition-colors">
            <Plus className="w-4 h-4" />
            Add Source
          </button>
        </div>

        {/* Sources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
            </div>
          ) : sources.length === 0 ? (
            <>
              {/* Default Sources */}
              {[
                { name: 'Reddit r/HomeImprovement', type: 'reddit', status: 'active', health: 98, leadsToday: 12 },
                { name: 'Google Maps Scraper', type: 'google_maps', status: 'active', health: 94, leadsToday: 45 },
                { name: 'Yellow Pages', type: 'yellow_pages', status: 'paused', health: 76, leadsToday: 0 },
                { name: 'Facebook Groups', type: 'facebook', status: 'active', health: 99, leadsToday: 8 },
              ].map((source, index) => (
                <motion.div
                  key={source.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-5 rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      source.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                      source.status === 'error' ? 'bg-rose-500/10 text-rose-400' :
                      'bg-amber-500/10 text-amber-400'
                    )}>
                      {source.status === 'active' ? <CheckCircle2 className="w-5 h-5" /> :
                       source.status === 'error' ? <XCircle className="w-5 h-5" /> :
                       <Pause className="w-5 h-5" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg bg-white/[0.05] text-white/40 hover:text-white transition-colors">
                        <Settings2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => toggleSource(source.name, source.status)}
                        className="p-2 rounded-lg bg-white/[0.05] text-white/40 hover:text-white transition-colors"
                      >
                        {source.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-white mb-1">{source.name}</h3>
                  <p className="text-xs text-white/40 uppercase mb-4">{source.type}</p>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/[0.06]">
                    <div>
                      <div className="text-2xl font-bold font-mono text-white">{source.health}%</div>
                      <div className="text-[10px] text-white/30 uppercase">Health</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold font-mono text-cyan-400">{source.leadsToday}</div>
                      <div className="text-[10px] text-white/30 uppercase">Today</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </>
          ) : (
            sources.map((source, index) => (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-5 rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.06]"
              >
                {/* Source card content */}
              </motion.div>
            ))
          )}
        </div>

        {/* Source Configuration Panel */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.06]">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-cyan-400" />
            Global Configuration
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm text-white/60 mb-2">Scan Interval (minutes)</label>
              <input 
                type="number" 
                defaultValue={15}
                className="w-full bg-black/30 border border-white/[0.08] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Max Results per Source</label>
              <input 
                type="number" 
                defaultValue={100}
                className="w-full bg-black/30 border border-white/[0.08] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Retry Attempts</label>
              <input 
                type="number" 
                defaultValue={3}
                className="w-full bg-black/30 border border-white/[0.08] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
