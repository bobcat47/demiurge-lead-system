'use client';

import { useEffect, useState } from 'react';
import { 
  Activity, 
  Globe, 
  Zap, 
  Users, 
  TrendingUp, 
  Settings,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { LeadFeed } from '@/components/LeadFeed';
import { SourceManager } from '@/components/SourceManager';
import { ProviderPanel } from '@/components/ProviderPanel';
import { StatsPanel } from '@/components/StatsPanel';
import { ComplianceBadge } from '@/components/ComplianceBadge';

type Tab = 'leads' | 'sources' | 'providers' | 'stats' | 'settings';

interface SystemStatus {
  crawlerStatus: 'running' | 'paused' | 'error';
  lastCrawl: string | null;
  postsToday: number;
  leadsToday: number;
  activeSources: number;
  activeProviders: number;
  queueSize: number;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('leads');
  const [status, setStatus] = useState<SystemStatus>({
    crawlerStatus: 'running',
    lastCrawl: null,
    postsToday: 0,
    leadsToday: 0,
    activeSources: 0,
    activeProviders: 0,
    queueSize: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchStatus() {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const navItems: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'leads', label: 'Live Leads', icon: Zap },
    { id: 'sources', label: 'Sources', icon: Globe },
    { id: 'providers', label: 'Providers', icon: Users },
    { id: 'stats', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Demiurge Lead Matcher
                </h1>
                <p className="text-xs text-slate-500">Social Intent Detection System</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  status.crawlerStatus === 'running' ? 'bg-emerald-500' :
                  status.crawlerStatus === 'error' ? 'bg-red-500' : 'bg-amber-500'
                }`} />
                <span className="text-sm text-slate-400">
                  {status.crawlerStatus === 'running' ? 'System Active' : 'System Paused'}
                </span>
                <ComplianceBadge />
              </div>
              <button onClick={fetchStatus} className="p-2 rounded-lg hover:bg-slate-800">
                <RefreshCw className={`w-5 h-5 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="border-b border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <StatCard label="Posts Today" value={status.postsToday} icon={Activity} />
            <StatCard label="Leads Generated" value={status.leadsToday} icon={Zap} highlight />
            <StatCard label="Active Sources" value={status.activeSources} icon={Globe} />
            <StatCard label="Active Providers" value={status.activeProviders} icon={Users} />
            <StatCard label="Queue Size" value={status.queueSize} icon={Activity} />
            <StatCard label="Last Crawl" value={status.lastCrawl ? formatDistanceToNow(new Date(status.lastCrawl), { addSuffix: true }) : 'Never'} icon={Activity} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === item.id
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="mt-8 p-4 rounded-xl bg-slate-900 border border-slate-800">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full px-3 py-2 text-sm text-left rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white">
                  + Add Source
                </button>
                <button className="w-full px-3 py-2 text-sm text-left rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">
                  + Add Provider
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {activeTab === 'leads' && <LeadFeed />}
            {activeTab === 'sources' && <SourceManager />}
            {activeTab === 'providers' && <ProviderPanel />}
            {activeTab === 'stats' && <StatsPanel />}
            {activeTab === 'settings' && <div className="text-slate-400">Settings panel</div>}
          </main>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, highlight }: { label: string; value: string | number; icon: any; highlight?: boolean }) {
  return (
    <div className={`p-4 rounded-xl border ${highlight ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-slate-900/50 border-slate-800'}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${highlight ? 'text-indigo-400' : 'text-slate-200'}`}>{value}</p>
        </div>
        <Icon className={`w-5 h-5 ${highlight ? 'text-indigo-400' : 'text-slate-600'}`} />
      </div>
    </div>
  );
}
