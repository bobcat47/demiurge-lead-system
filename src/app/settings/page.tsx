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
  Activity,
  Sparkles,
  Brain,
  Cpu,
  Zap,
  Bot,
  Server
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { cn } from '@/lib/utils';

interface ConfigStatus {
  googlePlaces: { configured: boolean; keyPreview: string | null };
  serpapi: { configured: boolean; keyPreview: string | null };
  apify: { configured: boolean; keyPreview: string | null };
  activeProvider: string;
  aiProviders: Array<{
    provider: string;
    configured: boolean;
    keyPreview: string | null;
    isFreeTier: boolean;
  }>;
  activeAIProvider: string;
  aiProposalAvailable: boolean;
}

const AI_PROVIDER_INFO: Record<string, { icon: React.ElementType; color: string; description: string }> = {
  openrouter: { icon: Zap, color: 'text-purple-400', description: 'Free models from Google, Meta, and more' },
  gemini: { icon: Brain, color: 'text-blue-400', description: 'Google Gemini Flash - 15 RPM free tier' },
  groq: { icon: Zap, color: 'text-orange-400', description: 'Ultra-fast Llama/Mixtral inference' },
  openai: { icon: Bot, color: 'text-emerald-400', description: 'GPT-4o-mini and other OpenAI models' },
  ollama: { icon: Server, color: 'text-amber-400', description: 'Run models locally' },
  mock: { icon: Cpu, color: 'text-gray-400', description: 'Template-based generation' },
};

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
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
    setTimeout(() => testConfiguration(), 500);
  };

  if (!mounted) return null;

  const activeAIInfo = configStatus ? AI_PROVIDER_INFO[configStatus.activeAIProvider] : null;

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

          {/* AI Model Provider */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.06]"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                AI Model Provider
              </h2>
            </div>

            {/* Active AI Provider Status */}
            {configStatus && (
              <div className="mb-6 space-y-3">
                {/* Active AI Provider Badge */}
                <div className={cn(
                  "p-4 border rounded-lg flex items-center gap-3",
                  configStatus.aiProposalAvailable
                    ? "bg-purple-500/5 border-purple-500/20"
                    : "bg-amber-500/5 border-amber-500/20"
                )}>
                  {activeAIInfo && <activeAIInfo.icon className={cn("w-5 h-5 flex-shrink-0", activeAIInfo.color)} />}
                  <div className="flex-1">
                    <p className={cn(
                      "font-medium",
                      configStatus.aiProposalAvailable ? "text-purple-400" : "text-amber-400"
                    )}>
                      {configStatus.aiProposalAvailable 
                        ? `✅ AI PROPOSALS ACTIVE: ${configStatus.activeAIProvider.toUpperCase()}`
                        : "⚠️ AI PROPOSALS UNAVAILABLE"
                      }
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {configStatus.aiProposalAvailable
                        ? activeAIInfo?.description || 'AI-powered proposal generation is ready.'
                        : "Add a free AI provider key below to enable AI proposal generation."
                      }
                    </p>
                  </div>
                </div>

                {/* AI Provider Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {configStatus.aiProviders.map((aiProvider) => {
                    const info = AI_PROVIDER_INFO[aiProvider.provider];
                    const Icon = info?.icon || Bot;
                    return (
                      <div 
                        key={aiProvider.provider}
                        className={cn(
                          "p-3 border text-center",
                          aiProvider.configured 
                            ? "bg-purple-500/5 border-purple-500/20" 
                            : "bg-white/[0.02] border-white/[0.06]"
                        )}
                      >
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                          <Icon className={cn("w-3.5 h-3.5", info?.color || "text-white/30")} />
                          <span className="text-xs text-white/40 capitalize">{aiProvider.provider}</span>
                          {aiProvider.isFreeTier && (
                            <span className="px-1 py-0 text-[8px] bg-emerald-500/10 text-emerald-400 rounded">FREE</span>
                          )}
                        </div>
                        <div className={cn(
                          "text-sm font-medium",
                          aiProvider.configured ? "text-purple-400" : "text-white/30"
                        )}>
                          {aiProvider.configured ? '✓ SET' : '—'}
                        </div>
                        {aiProvider.keyPreview && (
                          <div className="text-[10px] text-white/20 mt-1 font-mono">
                            {aiProvider.keyPreview}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="mb-6 p-4 bg-purple-500/5 border border-purple-500/10 rounded-lg">
              <p className="text-sm text-purple-400/80">
                <strong>Priority Order:</strong> OpenRouter → Gemini → Groq → OpenAI → Ollama → Mock
              </p>
              <p className="text-xs text-white/40 mt-1">
                Free and free-tier providers are fully supported. OpenAI is optional — add any free provider above to enable AI proposals.
              </p>
            </div>
            
            <div className="space-y-4">
              {/* OpenRouter */}
              <div>
                <label className="block text-sm text-white/60 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  OpenRouter API Key
                  <span className="px-2 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-400 rounded-sm">FREE TIER</span>
                  <span className="px-2 py-0.5 text-[10px] bg-purple-500/10 text-purple-400 rounded-sm">RECOMMENDED</span>
                </label>
                <input 
                  type="password"
                  placeholder="sk-or-v1-..."
                  className="w-full bg-black/30 border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50"
                />
                <p className="text-xs text-white/40 mt-1">
                  Get from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">OpenRouter.ai</a>. Access free Google, Meta, and open-source models.
                </p>
              </div>

              {/* Gemini */}
              <div>
                <label className="block text-sm text-white/60 mb-2 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-400" />
                  Google Gemini API Key
                  <span className="px-2 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-400 rounded-sm">FREE TIER</span>
                </label>
                <input 
                  type="password"
                  placeholder="AIza..."
                  className="w-full bg-black/30 border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                />
                <p className="text-xs text-white/40 mt-1">
                  Get from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google AI Studio</a>. 15 requests/minute free tier.
                </p>
              </div>

              {/* Groq */}
              <div>
                <label className="block text-sm text-white/60 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-400" />
                  Groq API Key
                  <span className="px-2 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-400 rounded-sm">FREE TIER</span>
                </label>
                <input 
                  type="password"
                  placeholder="gsk_..."
                  className="w-full bg-black/30 border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50"
                />
                <p className="text-xs text-white/40 mt-1">
                  Get from <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Groq Console</a>. Fast inference with Llama and Mixtral models.
                </p>
              </div>

              {/* OpenAI */}
              <div>
                <label className="block text-sm text-white/60 mb-2 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  OpenAI API Key
                  <span className="px-2 py-0.5 text-[10px] bg-amber-500/10 text-amber-400 rounded-sm">PAID</span>
                  <span className="px-2 py-0.5 text-[10px] bg-white/10 text-white/60 rounded-sm">OPTIONAL</span>
                </label>
                <input 
                  type="password"
                  placeholder="sk-..."
                  className="w-full bg-black/30 border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
                />
                <p className="text-xs text-white/40 mt-1">
                  Get from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">OpenAI Platform</a>. Requires paid credits. Optional — free providers above work great!
                </p>
              </div>

              {/* Ollama */}
              <div>
                <label className="block text-sm text-white/60 mb-2 flex items-center gap-2">
                  <Server className="w-4 h-4 text-amber-400" />
                  Ollama (Local)
                  <span className="px-2 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-400 rounded-sm">FREE</span>
                  <span className="px-2 py-0.5 text-[10px] bg-white/10 text-white/60 rounded-sm">LOCAL</span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={process.env.OLLAMA_ENABLED === 'true'}
                    />
                    <div className="w-11 h-6 bg-white/[0.1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                  <span className="text-sm text-white/60">Enable Ollama (requires local server)</span>
                </div>
                <p className="text-xs text-white/40 mt-1">
                  Run models locally with <a href="https://ollama.com/" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">Ollama</a>. No API key needed, runs on your hardware.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
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
