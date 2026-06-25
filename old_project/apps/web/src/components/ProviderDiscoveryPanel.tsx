'use client';

import { useState } from 'react';
import { Search, MapPin, Globe, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { discoverProviders } from '@/lib/scrapers/provider-scraper';
import { cn } from '@/lib/utils';

interface ProviderDiscoveryPanelProps {
  onDiscoveryComplete?: () => void;
}

export function ProviderDiscoveryPanel({ onDiscoveryComplete }: ProviderDiscoveryPanelProps) {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('US');
  const [limit, setLimit] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    providers?: number;
    error?: string;
  } | null>(null);

  const handleDiscover = async () => {
    if (!query || !city) return;
    
    setIsLoading(true);
    setResult(null);
    
    try {
      const data = await discoverProviders({ query, city, country, limit });
      setResult(data);
      if (data.success) {
        onDiscoveryComplete?.();
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Discovery failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const presetSearches = [
    { query: 'plumber', city: 'New York', icon: '🔧' },
    { query: 'electrician', city: 'Los Angeles', icon: '⚡' },
    { query: 'hvac', city: 'Chicago', icon: '❄️' },
    { query: 'roofing', city: 'Houston', icon: '🏠' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Provider Discovery</h2>
        <p className="text-white/40 mt-1">
          Discover local businesses from Google Maps and other sources
        </p>
      </div>

      {/* Search Form */}
      <Card className="p-6 bg-white/5 border-white/10">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white/60 mb-2">
                Service Keyword
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  placeholder="e.g., plumber, electrician, hvac"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                City
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  placeholder="e.g., New York"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white"
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-4">
              <label className="text-sm text-white/60">
                Max Results:
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="ml-2 bg-black/30 border border-white/10 rounded-lg px-3 py-1 text-white text-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </label>
            </div>
            
            <Button
              onClick={handleDiscover}
              disabled={isLoading || !query || !city}
              className={isLoading ? 'animate-pulse' : ''}
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Discovering...</>
              ) : (
                <><Plus className="w-4 h-4 mr-2" /> Discover Providers</>
              )}
            </Button>
          </div>

          {/* Result Message */}
          {result && (
            <div className={cn(
              'mt-4 p-4 rounded-xl',
              result.success 
                ? 'bg-emerald-500/10 border border-emerald-500/20' 
                : 'bg-rose-500/10 border border-rose-500/20'
            )}>
              <p className={cn(
                'text-sm',
                result.success ? 'text-emerald-400' : 'text-rose-400'
              )}>
                {result.success ? '✓' : '✗'} {result.message}
              </p>
              {result.providers !== undefined && (
                <p className="text-white/60 text-sm mt-1">
                  Found {result.providers} providers
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Searches */}
      <div>
        <h3 className="text-sm font-medium text-white/60 mb-3">Quick Searches</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {presetSearches.map((preset) => (
            <button
              key={`${preset.query}-${preset.city}`}
              onClick={() => {
                setQuery(preset.query);
                setCity(preset.city);
              }}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-left"
            >
              <span className="text-2xl mb-2 block">{preset.icon}</span>
              <p className="font-medium text-white capitalize">{preset.query}</p>
              <p className="text-sm text-white/40">{preset.city}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Data Sources */}
      <div>
        <h3 className="text-sm font-medium text-white/60 mb-3">Data Sources</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-white">Google Maps</p>
                <p className="text-sm text-white/40">Via Decodo API</p>
              </div>
            </div>
            <Badge variant="outline" className="text-amber-400 border-amber-400/20">Requires API Key</Badge>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 opacity-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <span className="text-red-400 font-bold">Y</span>
              </div>
              <div>
                <p className="font-medium text-white">Yelp</p>
                <p className="text-sm text-white/40">Coming soon</p>
              </div>
            </div>
            <Badge variant="secondary">Disabled</Badge>
          </div>
        </div>
      </div>

      {/* Compliance Notice */}
      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
        <p className="text-sm text-amber-400/80">
          <strong>Compliance Notice:</strong> Provider discovery only uses publicly available data. 
          Sources requiring authentication or API keys are marked accordingly. 
          Set <code className="bg-black/30 px-1 rounded">DECODO_USERNAME</code> and{' '}
          <code className="bg-black/30 px-1 rounded">DECODO_PASSWORD</code> environment variables to enable Google Maps scraping.
        </p>
      </div>
    </div>
  );
}
