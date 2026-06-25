'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus,
  Search,
  MapPin,
  Phone,
  Mail,
  Star,
  Edit2,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Provider {
  id: string;
  business_name: string;
  services: string[];
  service_areas: string[];
  phone?: string;
  email?: string;
  rating?: number;
  is_active: boolean;
  emergency_available: boolean;
}

export default function ProvidersPage() {
  const [mounted, setMounted] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const res = await fetch('/api/providers');
      const data = await res.json();
      setProviders(data.providers || []);
    } catch (error) {
      console.error('Failed to fetch providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProviders = providers.filter(p => 
    p.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] grid-bg">
      <Header />
      
      <main className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Users className="w-7 h-7 text-cyan-400" />
              Asset Database
            </h1>
            <p className="text-sm text-white/40 mt-1">Manage service providers and contractors</p>
          </div>
          
          <Link 
            href="/providers/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Provider
          </Link>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search providers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/30 border border-white/[0.08] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Providers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="col-span-full text-center py-20 text-white/40">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No providers found</p>
              <Link 
                href="/providers/new"
                className="inline-flex items-center gap-2 mt-4 text-cyan-400 hover:text-cyan-300"
              >
                <Plus className="w-4 h-4" />
                Add your first provider
              </Link>
            </div>
          ) : (
            filteredProviders.map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-5 rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    provider.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  )}>
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 rounded-lg bg-white/[0.05] text-white/40 hover:text-white transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-white/[0.05] text-white/40 hover:text-rose-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="font-medium text-white mb-1">{provider.business_name}</h3>
                
                {provider.rating && (
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-white/60 text-sm">{provider.rating.toFixed(1)}</span>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {provider.services.slice(0, 3).map(service => (
                    <span 
                      key={service}
                      className="px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs"
                    >
                      {service}
                    </span>
                  ))}
                  {provider.services.length > 3 && (
                    <span className="px-2 py-1 rounded-full bg-white/[0.05] text-white/40 text-xs">
                      +{provider.services.length - 3}
                    </span>
                  )}
                </div>
                
                <div className="space-y-2 text-sm text-white/40">
                  {provider.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {provider.phone}
                    </div>
                  )}
                  {provider.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {provider.email}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {provider.service_areas.slice(0, 2).join(', ')}
                    {provider.service_areas.length > 2 && ` +${provider.service_areas.length - 2}`}
                  </div>
                </div>
                
                {provider.emergency_available && (
                  <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    <span className="px-2 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs">
                      🚨 Emergency Available
                    </span>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
