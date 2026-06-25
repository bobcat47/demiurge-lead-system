'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Save,
  Key,
  Bell,
  Shield,
  Database,
  Globe,
  Crosshair,
  MapPin,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Activity
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { cn } from '@/lib/utils';

interface ConfigStatus {
  googlePlaces: { configured: boolean; keyPreview: string | null };
  serpapi: { configured: boolean; keyPreview: string | null };
  apify: { configured: boolean; keyPreview: string | null };
  activeProvider: string;
}

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    setMounted(true);
    testConfiguration();
  }, []);

  const testConfiguration = async () => {
    setIsTesting(true);
    try {
      const res = await fetch('/api/config/test');
      const data = await res.json();
      if (data.success) {
        setConfigStatus(data.config);
      }
    } catch (error) {
      console.error('Failed to test configuration:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    // Re-test after "save" to show updated status
    setTimeout(() => testConfiguration(), 500);
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
              <Settings className="w-7 h-7 text-cyan-400" />
              Configuration
            </h1>
            <p className="text-sm text-white/40 mt-1">System settings and integrations</p>
          </div>
          
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/20 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lead Finder Data Providers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.06]"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Crosshair className="w-5 h-5 text-cyan-400" />
                Lead Finder Data Providers
              </h2>
              <button
                onClick={testConfiguration}
                disabled={isTesting}
                className="flex items-center gap-2 px-3 py-1.5 text-xs bg-white/[0.05] text-white/60 border border-white/[0.08] hover:bg-white/[0.08] transition-colors disabled:opacity-50"
              >
                {isTesting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Activity className="w-3.5 h-3.5" />
                )}
                Test Config
              </button>
            </div>

            {/* Configuration Status */}
            {configStatus && (
              <div className="mb-6 space-y-3">
                {/* Active Provider Badge */}
                <div className={cn(
                  "p-4 border rounded-lg flex items-center gap-3",
                  configStatus.activeProvider !== 'mock'
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : "bg-amber-500/5 border-amber-500/20"
                )}>
                  {configStatus.activeProvider !== 'mock' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  )}
                  <div>
                    <p className={cn(
                      "font-medium",
                      configStatus.activeProvider !== 'mock' ? "text-emerald-400" : "text-amber-400"
                    )}>
                      {configStatus.activeProvider !== 'mock' 
                        ? `✅ LIVE DATA ACTIVE: ${configStatus.activeProvider.toUpperCase()}`
                        : "⚠️ USING MOCK DATA"
                      }
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {configStatus.activeProvider !== 'mock'
                        ? "Your Lead Finder searches will use real business data from this provider."
                        : "Add an API key below to enable live business data from real sources."
                      }
                    </p>
                  </div>
                </div>

                {/* Individual Status */}
                <div className="grid grid-cols-3 gap-2">
                  <div className={cn(
                    "p-3 border text-center",
                    configStatus.googlePlaces.configured 
                      ? "bg-emerald-500/5 border-emerald-500/20" 
                      : "bg-white/[0.02] border-white/[0.06]"
                  )}>
                    <div className="text-xs text-white/40 mb-1">Google Places</div>
                    <div className={cn(
                      "text-sm font-medium",
                      configStatus.googlePlaces.configured ? "text-emerald-400" : "text-white/30"
                    )}>
                      {configStatus.googlePlaces.configured ? '✓ SET' : '—'}
                    </div>
                    {configStatus.googlePlaces.keyPreview && (
                      <div className="text-[10px] text-white/20 mt-1 font-mono">
                        {configStatus.googlePlaces.keyPreview}
                      </div>
                    )}
                  </div>
                  <div className={cn(
                    "p-3 border text-center",
                    configStatus.serpapi.configured 
                      ? "bg-emerald-500/5 border-emerald-500/20" 
                      : "bg-white/[0.02] border-white/[0.06]"
                  )}>
                    <div className="text-xs text-white/40 mb-1">SerpAPI</div>
                    <div className={cn(
                      "text-sm font-medium",
                      configStatus.serpapi.configured ? "text-emerald-400" : "text-white/30"
                    )}>
                      {configStatus.serpapi.configured ? '✓ SET' : '—'}
                    </div>
                    {configStatus.serpapi.keyPreview && (
                      <div className="text-[10px] text-white/20 mt-1 font-mono">
                        {configStatus.serpapi.keyPreview}
                      </div>
                    )}
                  </div>
                  <div className={cn(
                    "p-3 border text-center",
                    configStatus.apify.configured 
                      ? "bg-emerald-500/5 border-emerald-500/20" 
                      : "bg-white/[0.02] border-white/[0.06]"
                  )}>
                    <div className="text-xs text-white/40 mb-1">Apify</div>
                    <div className={cn(
                      "text-sm font-medium",
                      configStatus.apify.configured ? "text-emerald-400" : "text-white/30"
                    )}>
                      {configStatus.apify.configured ? '✓ SET' : '—'}
                    </div>
                    {configStatus.apify.keyPreview && (
                      <div className="text-[10px] text-white/20 mt-1 font-mono">
                        {configStatus.apify.keyPreview}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="mb-6 p-4 bg-amber-500/5 border border-amber-500/10 rounded-lg">
              <p className="text-sm text-amber-400/80">
                <strong>Priority Order:</strong> Google Places API → SerpAPI → Apify → Mock Data
              </p>
              <p className="text-xs text-white/40 mt-1">
                Add at least one API key below to enable live business data. The system will automatically fall back to mock data if no APIs are configured.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Google Places API Key
                  <span className="px-2 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-400 rounded-sm">RECOMMENDED</span>
                </label>
                <input 
                  type="password"
                  placeholder="Enter your Google Places API key"
                  className="w-full bg-black/30 border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                />
                <p className="text-xs text-white/40 mt-1">
                  Get from <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Google Cloud Console</a>. Enable Places API.
                </p>
              </div>
              
              <div>
                <label className="block text-sm text-white/60 mb-2 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  SerpAPI Key
                </label>
                <input 
                  type="password"
                  placeholder="Enter your SerpAPI key"
                  className="w-full bg-black/30 border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                />
                <p className="text-xs text-white/40 mt-1">
                  Get from <a href="https://serpapi.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">SerpAPI.com</a>. 100 free searches/month.
                </p>
              </div>
              
              <div>
                <label className="block text-sm text-white/60 mb-2">Apify Token</label>
                <input 
                  type="password"
                  placeholder="Enter your Apify API token"
                  className="w-full bg-black/30 border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                />
                <p className="text-xs text-white/40 mt-1">
                  Get from <a href="https://console.apify.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Apify Console</a>. For Google Maps scraping.
                </p>
              </div>
            </div>
          </motion.div>

          {/* API Keys */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.06]"
          >
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Key className="w-5 h-5 text-cyan-400" />
              Other API Keys
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">OpenAI API Key</label>
                <input 
                  type="password"
                  placeholder="Enter your OpenAI API key"
                  className="w-full bg-black/30 border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                />
                <p className="text-xs text-white/40 mt-1">Required for AI-powered proposal generation</p>
              </div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.06]"
          >
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-cyan-400" />
              Notifications
            </h2>
            
            <div className="space-y-4">
              {[
                { label: 'New lead alerts', default: true },
                { label: 'Provider match notifications', default: true },
                { label: 'System error alerts', default: true },
                { label: 'Daily summary email', default: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-white/80">{item.label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/[0.1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.06]"
          >
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              Security
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Admin Password</label>
                <input 
                  type="password"
                  placeholder="Change admin password"
                  className="w-full bg-black/30 border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                <span className="text-white/80">Two-factor authentication</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-white/[0.1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Database */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.06]"
          >
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              Database
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03]">
                <div>
                  <div className="text-white font-medium">Connection Status</div>
                  <div className="text-sm text-emerald-400">Connected</div>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-white/[0.03]">
                  <div className="text-2xl font-bold text-white">1,247</div>
                  <div className="text-xs text-white/40">Total Leads</div>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.03]">
                  <div className="text-2xl font-bold text-white">156</div>
                  <div className="text-xs text-white/40">Providers</div>
                </div>
              </div>
              
              <button className="w-full py-2 rounded-lg bg-white/[0.05] text-white/60 hover:bg-white/[0.08] transition-colors text-sm">
                Export Database Backup
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
