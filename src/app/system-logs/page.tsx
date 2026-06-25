'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Terminal, 
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { cn } from '@/lib/utils';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  source: string;
  details?: string;
}

export default function LogsPage() {
  const [mounted, setMounted] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
    // Generate sample logs
    setLogs([
      { id: '1', timestamp: '2026-06-25 07:15:23', level: 'success', message: 'Lead approved and contacted', source: 'LeadMatcher' },
      { id: '2', timestamp: '2026-06-25 07:14:15', level: 'info', message: 'Scraping job completed: 47 providers found', source: 'Scraper' },
      { id: '3', timestamp: '2026-06-25 07:12:08', level: 'warning', message: 'Source connection timeout: Nextdoor API', source: 'SourceManager' },
      { id: '4', timestamp: '2026-06-25 07:10:45', level: 'info', message: 'New provider registered: Quick Fix Plumbing', source: 'ProviderDB' },
      { id: '5', timestamp: '2026-06-25 07:08:33', level: 'error', message: 'Failed to send notification: SMTP error', source: 'Notifier' },
      { id: '6', timestamp: '2026-06-25 07:05:12', level: 'success', message: 'Match created: LD-2847 → PlumbPro', source: 'LeadMatcher' },
      { id: '7', timestamp: '2026-06-25 07:02:59', level: 'info', message: 'Daily stats generated: 234 leads processed', source: 'Analytics' },
      { id: '8', timestamp: '2026-06-25 07:00:00', level: 'info', message: 'System backup completed', source: 'System' },
    ]);
  }, []);

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.level !== filter) return false;
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (!mounted) return null;

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'error': return <XCircle className="w-4 h-4 text-rose-400" />;
      default: return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success': return 'border-emerald-500/20 bg-emerald-500/5';
      case 'warning': return 'border-amber-500/20 bg-amber-500/5';
      case 'error': return 'border-rose-500/20 bg-rose-500/5';
      default: return 'border-cyan-500/20 bg-cyan-500/5';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] grid-bg">
      <Header />
      
      <main className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Terminal className="w-7 h-7 text-cyan-400" />
            System Logs
          </h1>
          <p className="text-sm text-white/40 mt-1">Audit trail and system monitoring</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/30 border border-white/[0.08] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          
          <div className="flex items-center gap-2">
            {['all', 'info', 'success', 'warning', 'error'].map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm capitalize transition-colors',
                  filter === level
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-white/[0.05] text-white/60 border border-white/[0.08] hover:bg-white/[0.08]'
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Table */}
        <div className="space-y-2">
          {filteredLogs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'p-4 rounded-xl border transition-all',
                getLevelColor(log.level)
              )}
            >
              <div className="flex items-start gap-4">
                {getLevelIcon(log.level)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-mono text-white/40">{log.timestamp}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/[0.05] text-white/40 text-xs">
                      {log.source}
                    </span>
                  </div>
                  <p className="text-white">{log.message}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
