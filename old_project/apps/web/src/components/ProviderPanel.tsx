'use client';

import { useEffect, useState } from 'react';
import { Users, Star, AlertCircle } from 'lucide-react';

interface Provider {
  id: string;
  business_name: string;
  services: string[];
  rating: number;
  emergency_available: boolean;
  leads_received: number;
  conversion_rate: number;
  is_active: boolean;
}

export function ProviderPanel() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviders();
  }, []);

  async function fetchProviders() {
    try {
      const res = await fetch('/api/providers');
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers || []);
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="text-slate-500">Loading providers...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-200">Providers</h2>
        <button className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium">
          + Add Provider
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {providers.map((provider) => (
          <div key={provider.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-slate-200">{provider.business_name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-1 text-sm text-amber-400">
                    <Star className="w-4 h-4 fill-current" />{provider.rating}
                  </span>
                </div>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${provider.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                {provider.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {provider.services.slice(0, 3).map((service) => (
                <span key={service} className="px-2 py-0.5 rounded bg-slate-800 text-xs text-slate-400">{service}</span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-2 rounded-lg bg-slate-950">
                <div className="text-xs text-slate-500">Leads Received</div>
                <div className="font-semibold text-slate-300">{provider.leads_received}</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950">
                <div className="text-xs text-slate-500">Conversion</div>
                <div className="font-semibold text-emerald-400">{(provider.conversion_rate * 100).toFixed(1)}%</div>
              </div>
            </div>

            {provider.emergency_available && (
              <div className="mt-3 flex items-center gap-2 text-xs text-amber-400">
                <AlertCircle className="w-4 h-4" />24/7 Emergency Available
              </div>
            )}
          </div>
        ))}

        {providers.length === 0 && (
          <div className="col-span-2 text-center py-12">
            <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">No providers configured</p>
          </div>
        )}
      </div>
    </div>
  );
}
