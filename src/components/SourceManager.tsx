'use client';

import { useEffect, useState } from 'react';
import { Globe, Play, Pause, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Source {
  id: string;
  name: string;
  source_type: string;
  base_url: string;
  status: 'active' | 'paused' | 'error' | 'disabled';
  last_crawled_at: string | null;
  posts_crawled: number;
  crawl_frequency_minutes: number;
}

export function SourceManager() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSources();
  }, []);

  async function fetchSources() {
    try {
      const res = await fetch('/api/sources');
      if (res.ok) {
        const data = await res.json();
        setSources(data.sources || []);
      }
    } catch (error) {
      console.error('Failed to fetch sources:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="text-slate-500">Loading sources...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-200">Source Manager</h2>
        <button className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium">
          + Add Source
        </button>
      </div>

      <div className="grid gap-4">
        {sources.map((source) => (
          <div key={source.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  source.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200">{source.name}</h3>
                  <p className="text-sm text-slate-500">{source.base_url}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Every {source.crawl_frequency_minutes} min</span>
                    <span>{source.posts_crawled} posts crawled</span>
                    {source.last_crawled_at && <span>Last: {formatDistanceToNow(new Date(source.last_crawled_at), { addSuffix: true })}</span>}
                  </div>
                </div>
              </div>
              <button className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
                source.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {source.status === 'active' ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Resume</>}
              </button>
            </div>
          </div>
        ))}

        {sources.length === 0 && (
          <div className="text-center py-12">
            <Globe className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">No sources configured</p>
          </div>
        )}
      </div>
    </div>
  );
}
