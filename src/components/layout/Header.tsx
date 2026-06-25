'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, 
  Bell, 
  Search, 
  Command,
  Shield,
  AlertTriangle,
  Wifi
} from 'lucide-react';

export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState('operational');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left: Breadcrumb & Search */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white/40">DEMIURGE</span>
            <span className="text-white/20">/</span>
            <span className="text-cyan-400 font-medium">COMMAND_CENTER</span>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search intelligence..."
              className="w-64 bg-black/30 border border-white/[0.08] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-white/20 font-mono">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </div>
        </div>

        {/* Right: Status, Time, Actions */}
        <div className="flex items-center gap-4">
          {/* System Status */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-white/60 font-mono uppercase">
                {systemStatus}
              </span>
            </div>
            <div className="w-px h-4 bg-white/[0.1]" />
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] text-cyan-400 font-mono">ONLINE</span>
            </div>
            <div className="w-px h-4 bg-white/[0.1]" />
            <div className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] text-emerald-500 font-mono">SECURE</span>
            </div>
          </div>

          {/* Time */}
          <div className="text-right">
            <div className="text-sm font-mono text-white">
              {currentTime.toLocaleTimeString('en-US', { hour12: false })}
            </div>
            <div className="text-[10px] text-white/40 font-mono uppercase">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] text-white font-bold flex items-center justify-center">
              3
            </span>
          </button>

          {/* Alert */}
          <button className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-colors">
            <AlertTriangle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
