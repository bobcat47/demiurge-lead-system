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
  Globe
} from 'lucide-react';
import { Header } from '@/components/layout/Header';

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
          {/* API Keys */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.06]"
          >
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Key className="w-5 h-5 text-cyan-400" />
              API Keys
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Apify Token</label>
                <input 
                  type="password"
                  placeholder="Enter your Apify API token"
                  className="w-full bg-black/30 border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                />
                <p className="text-xs text-white/40 mt-1">Required for premium scraping sources</p>
              </div>
              
              <div>
                <label className="block text-sm text-white/60 mb-2">OpenAI API Key</label>
                <input 
                  type="password"
                  placeholder="Enter your OpenAI API key"
                  className="w-full bg-black/30 border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                />
                <p className="text-xs text-white/40 mt-1">Required for AI-powered features</p>
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
