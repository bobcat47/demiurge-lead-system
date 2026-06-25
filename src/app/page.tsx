'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Radar, 
  Target, 
  Zap, 
  Activity, 
  TrendingUp, 
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { cn } from '@/lib/utils';

// Mock data for demonstration
const stats = [
  { label: 'Active Targets', value: 47, change: '+12%', trend: 'up', icon: Target },
  { label: 'Signal Sources', value: 8, change: '+2', trend: 'up', icon: Radar },
  { label: 'Assets Deployed', value: 156, change: '+23', trend: 'up', icon: Zap },
  { label: 'Match Rate', value: '84%', change: '+5%', trend: 'up', icon: Activity },
];

const recentLeads = [
  {
    id: 'LD-2847',
    title: 'URGENT: Pipe burst in Downtown basement',
    service: 'plumbing',
    urgency: 'critical',
    location: 'Downtown, NY',
    score: 96,
    time: '2m ago',
    status: 'new',
    matches: 4
  },
  {
    id: 'LD-2846',
    title: 'Electrical panel upgrade needed',
    service: 'electrical',
    urgency: 'medium',
    location: 'Brooklyn, NY',
    score: 78,
    time: '15m ago',
    status: 'matched',
    matches: 2
  },
  {
    id: 'LD-2845',
    title: 'HVAC system replacement quote',
    service: 'hvac',
    urgency: 'low',
    location: 'Queens, NY',
    score: 65,
    time: '1h ago',
    status: 'contacted',
    matches: 3
  },
  {
    id: 'LD-2844',
    title: 'Roof leak after storm',
    service: 'roofing',
    urgency: 'high',
    location: 'Bronx, NY',
    score: 89,
    time: '2h ago',
    status: 'approved',
    matches: 5
  }
];

const activeSources = [
  { name: 'Reddit r/HomeImprovement', status: 'active', lastPing: '30s ago', health: 98 },
  { name: 'Local Services Forum', status: 'active', lastPing: '1m ago', health: 94 },
  { name: 'Nextdoor API', status: 'warning', lastPing: '5m ago', health: 76 },
  { name: 'Facebook Groups', status: 'active', lastPing: '45s ago', health: 99 },
];

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] grid-bg">
      <Header />
      
      <main className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative p-5 rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all group overflow-hidden"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-white/[0.05] text-cyan-400">
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {stat.change}
                  </span>
                </div>
                
                <div className="text-3xl font-bold text-white font-mono mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-white/40 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Recent Leads */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyan-400" />
                  Recent Targets
                </h2>
                <p className="text-sm text-white/40 mt-0.5">Live acquisition feed</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/60 text-sm hover:bg-white/[0.08] transition-colors">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <button className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/60 hover:bg-white/[0.08] transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {recentLeads.map((lead, index) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'group relative p-4 rounded-xl border transition-all cursor-pointer',
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
                        )}>
                          {lead.status}
                        </span>
                      </div>
                      
                      <h3 className={cn(
                        'font-medium mb-1',
                        lead.urgency === 'critical' ? 'text-rose-400' : 'text-white'
                      )}>
                        {lead.title}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-xs text-white/40">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {lead.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {lead.time}
                        </span>
                        <span className="capitalize">{lead.service}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 ml-4">
                      <div className="text-center">
                        <div className={cn(
                          'text-2xl font-bold font-mono',
                          lead.score >= 80 ? 'text-emerald-400' : 
                          lead.score >= 60 ? 'text-cyan-400' : 'text-amber-400'
                        )}>
                          {lead.score}
                        </div>
                        <div className="text-[10px] text-white/30 uppercase">Score</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold font-mono text-white">
                          {lead.matches}
                        </div>
                        <div className="text-[10px] text-white/30 uppercase">Matches</div>
                      </div>
                      
                      <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/40 transition-colors" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: System Status */}
          <div className="space-y-4">
            {/* Signal Sources */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Radar className="w-4 h-4 text-cyan-400" />
                  Signal Sources
                </h3>
                <span className="text-xs text-emerald-400 font-mono">4 ONLINE</span>
              </div>
              
              <div className="space-y-3">
                {activeSources.map((source, index) => (
                  <div key={source.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        source.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                      )} />
                      <div>
                        <div className="text-sm text-white/80">{source.name}</div>
                        <div className="text-[10px] text-white/30 font-mono">
                          Ping: {source.lastPing}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-mono text-white/40">
                      {source.health}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20">
              <h3 className="text-sm font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Quick Deploy
              </h3>
              
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/20 transition-colors group">
                  <span className="font-medium">New Scout Mission</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/70 text-sm hover:bg-white/[0.08] transition-colors group">
                  <span>Add Provider Asset</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/70 text-sm hover:bg-white/[0.08] transition-colors group">
                  <span>Export Intelligence</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white mb-4">System Activity</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                  <div>
                    <div className="text-sm text-white/70">Lead approved and contacted</div>
                    <div className="text-[10px] text-white/30 font-mono">2m ago</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-rose-500 mt-0.5" />
                  <div>
                    <div className="text-sm text-white/70">Source connection failed</div>
                    <div className="text-[10px] text-white/30 font-mono">5m ago</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Activity className="w-4 h-4 text-cyan-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-white/70">New provider discovered</div>
                    <div className="text-[10px] text-white/30 font-mono">12m ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
