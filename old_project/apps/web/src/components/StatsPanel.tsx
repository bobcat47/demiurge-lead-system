'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Users, Zap } from 'lucide-react';

export function StatsPanel() {
  const [stats, setStats] = useState({ totalLeads: 0, activeProviders: 0, activeSources: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-200">Analytics</h2>
      
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Zap} label="Total Leads" value={stats.totalLeads} />
        <StatCard icon={Users} label="Active Providers" value={stats.activeProviders} />
        <StatCard icon={TrendingUp} label="Active Sources" value={stats.activeSources} />
      </div>

      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
        <h3 className="text-lg font-semibold text-slate-300 mb-4">System Overview</h3>
        <p className="text-slate-400">
          The Demiurge Lead Matcher is actively monitoring for service intent signals across configured sources.
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
      <Icon className="w-5 h-5 text-slate-500 mb-2" />
      <div className="text-2xl font-bold text-slate-200">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
