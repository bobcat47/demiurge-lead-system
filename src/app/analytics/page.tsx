'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Clock,
  MapPin
} from 'lucide-react';
import { Header } from '@/components/layout/Header';

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const stats = [
    { label: 'Total Leads', value: '1,247', change: '+23%', trend: 'up', icon: Target },
    { label: 'Conversion Rate', value: '34.2%', change: '+5.1%', trend: 'up', icon: TrendingUp },
    { label: 'Avg Response Time', value: '2.4h', change: '-0.5h', trend: 'up', icon: Clock },
    { label: 'Active Providers', value: '156', change: '+12', trend: 'up', icon: Users },
  ];

  const topServices = [
    { name: 'Plumbing', leads: 342, conversion: '38%' },
    { name: 'Electrical', leads: 289, conversion: '31%' },
    { name: 'HVAC', leads: 198, conversion: '29%' },
    { name: 'Roofing', leads: 167, conversion: '42%' },
    { name: 'Locksmith', leads: 134, conversion: '35%' },
  ];

  const topLocations = [
    { name: 'Downtown', leads: 456, growth: '+18%' },
    { name: 'Brooklyn', leads: 312, growth: '+24%' },
    { name: 'Queens', leads: 289, growth: '+12%' },
    { name: 'Bronx', leads: 190, growth: '+31%' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] grid-bg">
      <Header />
      
      <main className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-cyan-400" />
            Intelligence
          </h1>
          <p className="text-sm text-white/40 mt-1">Analytics and performance metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-5 rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.06]"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-white/[0.05] text-cyan-400">
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-mono flex items-center gap-1 ${
                  stat.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
              
              <div className="text-3xl font-bold text-white font-mono mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-white/40 uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Services */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.06]">
            <h2 className="text-lg font-semibold text-white mb-6">Top Services</h2>
            
            <div className="space-y-4">
              {topServices.map((service, index) => (
                <div key={service.name} className="flex items-center gap-4">
                  <div className="w-8 text-center text-white/40 font-mono">{index + 1}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium">{service.name}</span>
                      <span className="text-cyan-400 font-mono">{service.leads}</span>
                    </div>
                    <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                        style={{ width: `${(service.leads / 400) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-emerald-400 font-mono">{service.conversion}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Locations */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.06]">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              Top Locations
            </h2>
            
            <div className="space-y-4">
              {topLocations.map((location) => (
                <div key={location.name} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03]">
                  <div>
                    <div className="text-white font-medium">{location.name}</div>
                    <div className="text-sm text-white/40">{location.leads} leads</div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 font-mono text-sm">{location.growth}</div>
                    <div className="text-xs text-white/30">vs last month</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.06]">
          <h2 className="text-lg font-semibold text-white mb-6">Conversion Funnel</h2>
          
          <div className="flex items-center gap-4">
            {[
              { stage: 'Detected', count: 1247, color: 'bg-cyan-500' },
              { stage: 'Matched', count: 892, color: 'bg-purple-500' },
              { stage: 'Contacted', count: 456, color: 'bg-amber-500' },
              { stage: 'Approved', count: 234, color: 'bg-emerald-500' },
            ].map((step, index, arr) => (
              <div key={step.stage} className="flex items-center flex-1">
                <div className="flex-1">
                  <div 
                    className={`h-16 ${step.color} rounded-lg flex items-center justify-center text-white font-bold text-xl`}
                    style={{ opacity: 1 - (index * 0.15) }}
                  >
                    {step.count}
                  </div>
                  <div className="text-center mt-2 text-sm text-white/60">{step.stage}</div>
                </div>
                {index < arr.length - 1 && (
                  <div className="w-8 h-0.5 bg-white/[0.1] mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
