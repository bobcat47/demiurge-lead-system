'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Radar, 
  Target, 
  Globe, 
  Users, 
  BarChart3, 
  Settings,
  Zap,
  Shield,
  Radio,
  Terminal,
  Plus,
  Database,
  Search,
  Crosshair
} from 'lucide-react';

const navItems = [
  { 
    id: 'dashboard', 
    label: 'Command Center', 
    icon: Radar, 
    href: '/',
    description: 'Live intelligence feed'
  },
  { 
    id: 'leads', 
    label: 'Target Acquisition', 
    icon: Target, 
    href: '/leads',
    description: 'Detected leads & matches'
  },
  { 
    id: 'lead-finder', 
    label: 'Lead Finder', 
    icon: Crosshair, 
    href: '/lead-finder',
    description: 'Manual business search'
  },
  { 
    id: 'sources', 
    label: 'Signal Sources', 
    icon: Globe, 
    href: '/sources',
    description: 'Monitor & control sources'
  },
  { 
    id: 'providers', 
    label: 'Asset Database', 
    icon: Users, 
    href: '/providers',
    description: 'Provider intelligence'
  },
  { 
    id: 'discovery', 
    label: 'Field Ops', 
    icon: Radio, 
    href: '/discovery',
    description: 'Provider discovery'
  },
  { 
    id: 'analytics', 
    label: 'Intelligence', 
    icon: BarChart3, 
    href: '/analytics',
    description: 'Analysis & reports'
  },
  { 
    id: 'system-logs', 
    label: 'System Logs', 
    icon: Terminal, 
    href: '/system-logs',
    description: 'Audit & monitoring'
  },
  { 
    id: 'settings', 
    label: 'Configuration', 
    icon: Settings, 
    href: '/settings',
    description: 'System settings'
  },
];

export function Sidebar() {
  const pathname = usePathname();

  // Check if current path matches or starts with the href
  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="fixed left-0 top-0 w-72 h-screen bg-[#0a0a0f] border-r border-white/[0.06] flex flex-col z-50">
      {/* Header */}
      <div className="p-6 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-shadow">
              <Radar className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">DEMIURGE</h1>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider">OS v2.4.1</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = isActiveRoute(item.href);
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'group flex items-start gap-3 px-3 py-3 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-cyan-500/10 border border-cyan-500/20'
                  : 'hover:bg-white/[0.03] border border-transparent'
              )}
            >
              <div className={cn(
                'mt-0.5 transition-colors',
                isActive ? 'text-cyan-400' : 'text-white/40 group-hover:text-white/60'
              )}>
                <item.icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    'text-sm font-medium transition-colors',
                    isActive ? 'text-cyan-400' : 'text-white/70 group-hover:text-white'
                  )}>
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  )}
                </div>
                <p className="text-[10px] text-white/30 mt-0.5 font-mono uppercase tracking-wider">
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-white/[0.06] space-y-2">
        <div className="text-[10px] text-white/30 font-mono uppercase tracking-wider mb-2 px-2">
          Quick Deploy
        </div>
        
        <Link
          href="/providers/new"
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/20 transition-colors group"
        >
          <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="font-medium">New Asset</span>
        </Link>
        
        <Link
          href="/discovery"
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/60 text-sm hover:bg-white/[0.05] hover:text-white transition-colors group"
        >
          <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>Deploy Scout</span>
        </Link>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/[0.06]">
        <div className="flex items-center justify-between text-[10px] text-white/30 font-mono">
          <div className="flex items-center gap-2">
            <Database className="w-3 h-3" />
            <span>12 providers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-emerald-500" />
            <span className="text-emerald-500">SECURE</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
