// DEMIURGE LEAD MATCHER - PAGE TEMPLATES
// Complete page implementations for Next.js App Router

// ============================================
// 1. ROOT LAYOUT
// ============================================

// app/layout.tsx
import './globals.css'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Sidebar } from '@/components/layout/sidebar'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata = {
  title: 'Demiurge Lead Matcher',
  description: 'Social Intent Lead Matching System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#030305] text-white font-sans antialiased">
        <Sidebar />
        <main className="ml-[280px] min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}

// ============================================
// 2. GLOBAL STYLES
// ============================================

// app/globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-darkest: #030305;
  --bg-deep: #0A0A0F;
  --bg-elevated: #12121A;
  --bg-hover: #1A1A25;
}

* {
  border-color: rgba(255, 255, 255, 0.1);
}

body {
  background: var(--bg-darkest);
  color: white;
  font-feature-settings: "cv02", "cv03", "cv04", "cv11";
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: var(--bg-darkest);
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* Animations */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 5px currentColor; opacity: 1; }
  50% { box-shadow: 0 0 20px currentColor; opacity: 0.8; }
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes slide-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.animate-shimmer {
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

// ============================================
// 3. DASHBOARD PAGE (LEADS)
// ============================================

// app/page.tsx or app/leads/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, ChevronDown, ChevronUp, CheckCircle2, XCircle, Clock, MapPin, DollarSign } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScoreDisplay } from '@/components/ui/score-display'
import { StatCard } from '@/components/ui/stat-card'
import { Activity, Globe, Users, Zap } from 'lucide-react'

// Types
interface Lead {
  id: string
  lead_number: number
  title: string
  summary: string
  status: string
  priority_score: number
  match_count: number
  detected_at: string
  raw_post: {
    content: string
    source_url: string
    author_name: string | null
  }
  parsed_intent: {
    service_category: string | null
    urgency: 'urgent' | 'high' | 'medium' | 'low'
    budget: string
    locations: string[]
    lead_quality_score: number
    signals: Record<string, boolean>
  }
  matches?: LeadMatch[]
}

interface LeadMatch {
  id: string
  match_score: number
  match_reasons: string[]
  provider: {
    id: string
    business_name: string
    rating: number
    response_time: string
    emergency_available: boolean
  }
}

// Mock data
const mockLeads: Lead[] = [
  {
    id: '1',
    lead_number: 1234,
    title: 'URGENT: Pipe burst in Downtown basement',
    summary: 'Water pipe burst, flooding everywhere. Need plumber ASAP!',
    status: 'new',
    priority_score: 95,
    match_count: 2,
    detected_at: new Date().toISOString(),
    raw_post: {
      content: 'Urgently need a plumber in Downtown! Pipe burst and water is everywhere. Can anyone recommend someone who can come today? Budget is flexible for quick service.',
      source_url: 'https://reddit.com/r/HomeImprovement',
      author_name: 'homeowner123'
    },
    parsed_intent: {
      service_category: 'plumbing',
      urgency: 'urgent',
      budget: 'premium',
      locations: ['Downtown'],
      lead_quality_score: 95,
      signals: { has_urgency: true, has_location: true, ready_to_hire: true }
    },
    matches: [
      {
        id: 'm1',
        match_score: 98,
        match_reasons: ['Serves Downtown', '24/7 Emergency', 'Top Rated'],
        provider: {
          id: 'p1',
          business_name: 'PlumbPro Emergency Services',
          rating: 4.8,
          response_time: '30 min',
          emergency_available: true
        }
      },
      {
        id: 'm2',
        match_score: 72,
        match_reasons: ['Serves Downtown', 'Budget Friendly'],
        provider: {
          id: 'p2',
          business_name: 'Quick Fix Plumbing',
          rating: 4.2,
          response_time: 'Same day',
          emergency_available: false
        }
      }
    ]
  },
  {
    id: '2',
    lead_number: 1235,
    title: 'Electrician needed for kitchen rewire',
    summary: 'Looking for electrician to rewire kitchen, getting quotes',
    status: 'new',
    priority_score: 72,
    match_count: 1,
    detected_at: new Date(Date.now() - 900000).toISOString(),
    raw_post: {
      content: 'Looking for an electrician to rewire my kitchen. Planning to do this next month, just getting quotes right now. Any recommendations?',
      source_url: 'https://forum.example.com',
      author_name: 'renovator22'
    },
    parsed_intent: {
      service_category: 'electrical',
      urgency: 'low',
      budget: 'standard',
      locations: [],
      lead_quality_score: 72,
      signals: { planning: true, asking_recommendations: true }
    }
  }
]

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads)
  const [expandedLead, setExpandedLead] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#030305]">
      <Header />
      
      <div className="p-8 space-y-6">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <StatCard label="Posts Today" value="1,234" icon={Activity} trend="+12%" />
          <StatCard label="Leads Generated" value="89" icon={Zap} highlight trend="+8%" />
          <StatCard label="Active Sources" value="4" icon={Globe} />
          <StatCard label="Active Providers" value="12" icon={Users} />
          <StatCard label="Queue Size" value="23" icon={Activity} />
          <StatCard label="Last Crawl" value="2m ago" icon={Activity} />
        </div>

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Live Lead Feed</h1>
            <p className="text-white/40 mt-1">Real-time service intent detection and matching</p>
          </div>
          <Button icon={Filter}>Filter View</Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {['all', 'new', 'matched', 'approved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                filter === f
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Search */}
        <Input icon={Search} placeholder="Search leads by keyword, service, location..." />

        {/* Lead Cards */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {leads.map((lead, index) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                index={index}
                expanded={expandedLead === lead.id}
                onToggle={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function LeadCard({ lead, index, expanded, onToggle }: { 
  lead: Lead
  index: number
  expanded: boolean
  onToggle: () => void 
}) {
  const isUrgent = lead.parsed_intent.urgency === 'urgent'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'rounded-2xl backdrop-blur-xl transition-all duration-300',
        isUrgent 
          ? 'bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/20 shadow-lg shadow-amber-500/5' 
          : 'bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/[0.06]',
        expanded && 'border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.1)]'
      )}
    >
      {/* Card Header */}
      <div className="p-5 cursor-pointer" onClick={onToggle}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-mono font-semibold">
                #{lead.lead_number}
              </span>
              {isUrgent && <Badge variant="warning" dot>Urgent</Badge>}
              <Badge variant="info">{lead.parsed_intent.service_category}</Badge>
              <Badge variant="neutral">{lead.status}</Badge>
            </div>
            <h3 className="text-lg font-semibold text-white truncate">{lead.title}</h3>
            <p className="text-white/50 mt-1 line-clamp-1">{lead.summary}</p>
          </div>

          <div className="flex items-center gap-4">
            <ScoreDisplay score={lead.parsed_intent.lead_quality_score} size="md" />
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{lead.match_count}</div>
              <div className="text-[10px] text-white/40 uppercase">Matches</div>
            </div>
            <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
              {expanded ? <ChevronUp className="w-5 h-5 text-white/40" /> : <ChevronDown className="w-5 h-5 text-white/40" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 text-sm text-white/40">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {new Date(lead.detected_at).toLocaleTimeString()}
          </span>
          {lead.parsed_intent.locations.length > 0 && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {lead.parsed_intent.locations.join(', ')}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4" />
            {lead.parsed_intent.budget}
          </span>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/[0.06]"
          >
            <div className="p-5 space-y-6">
              {/* Original Post */}
              <div>
                <h4 className="text-sm font-medium text-white/60 mb-3">Original Post</h4>
                <div className="p-4 rounded-xl bg-black/30 border border-white/[0.06]">
                  <p className="text-white/80 whitespace-pre-wrap">{lead.raw_post.content}</p>
                  <a href={lead.raw_post.source_url} target="_blank" rel="noopener noreferrer" 
                     className="text-indigo-400 text-sm mt-2 inline-block hover:underline">
                    View Source →
                  </a>
                </div>
              </div>

              {/* Signals */}
              {Object.keys(lead.parsed_intent.signals).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-white/60 mb-3">Detected Signals</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(lead.parsed_intent.signals)
                      .filter(([_, v]) => v)
                      .map(([key]) => (
                        <span key={key} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                          ✓ {key.replace(/_/g, ' ')}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* Matched Providers */}
              {lead.matches && lead.matches.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-white/60 mb-3">Matched Providers ({lead.matches.length})</h4>
                  <div className="space-y-3">
                    {lead.matches.map((match) => (
                      <div key={match.id} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-indigo-500/30 transition-colors">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex flex-col items-center justify-center shrink-0">
                          <span className="text-xl font-mono font-bold text-indigo-400">{match.match_score}</span>
                          <span className="text-[10px] text-white/40 uppercase">Match</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-semibold text-white">{match.provider.business_name}</h4>
                            {match.provider.emergency_available && <Badge variant="success" dot>24/7</Badge>}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-white/50 mb-2">
                            <span className="flex items-center gap-1">⭐ {match.provider.rating}</span>
                            <span className="flex items-center gap-1">⏱ {match.provider.response_time}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {match.match_reasons.map((reason, i) => (
                              <span key={i} className="px-2 py-1 rounded-lg bg-white/5 text-white/60 text-xs">{reason}</span>
                            ))}
                          </div>
                        </div>
                        
                        <Button variant="secondary" size="sm">View</Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
                <Button variant="secondary" icon={XCircle}>Reject</Button>
                <Button icon={CheckCircle2}>Approve & Contact</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ============================================
// 4. SOURCES PAGE
// ============================================

// app/sources/page.tsx
'use client'

import { useState } from 'react'
import { Globe, Play, Pause, Clock, Plus } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const mockSources = [
  {
    id: '1',
    name: 'Reddit r/HomeImprovement',
    source_type: 'reddit',
    base_url: 'reddit.com/r/HomeImprovement',
    status: 'active' as const,
    last_crawled_at: new Date().toISOString(),
    posts_crawled: 1234,
    posts_qualified: 89,
    crawl_frequency_minutes: 60
  },
  {
    id: '2',
    name: 'Local Services Forum',
    source_type: 'forum',
    base_url: 'forum.example.com/services',
    status: 'active' as const,
    last_crawled_at: new Date(Date.now() - 900000).toISOString(),
    posts_crawled: 456,
    posts_qualified: 34,
    crawl_frequency_minutes: 120
  },
  {
    id: '3',
    name: 'Facebook Community',
    source_type: 'facebook',
    base_url: 'facebook.com/groups/local-services',
    status: 'paused' as const,
    last_crawled_at: new Date(Date.now() - 7200000).toISOString(),
    posts_crawled: 89,
    posts_qualified: 12,
    crawl_frequency_minutes: 60
  }
]

export default function SourcesPage() {
  const [sources] = useState(mockSources)

  return (
    <div className="min-h-screen bg-[#030305]">
      <Header />
      
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Source Manager</h1>
            <p className="text-white/40 mt-1">Configure and monitor your lead sources</p>
          </div>
          <Button icon={Plus}>Add Source</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sources.map((source) => (
            <Card key={source.id} variant="elevated" className="hover:border-indigo-500/30 transition-colors">
              <Card.Header>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    source.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  )}>
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{source.name}</h3>
                    <p className="text-sm text-white/40">{source.base_url}</p>
                  </div>
                </div>
                <Badge variant={source.status === 'active' ? 'success' : 'warning'}>
                  {source.status}
                </Badge>
              </Card.Header>

              <Card.Content className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Last Crawl</span>
                  <span className="text-white/70 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(source.last_crawled_at).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Posts Crawled</span>
                  <span className="text-white font-mono">{source.posts_crawled.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Qualified Leads</span>
                  <span className="text-emerald-400 font-mono">{source.posts_qualified}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Frequency</span>
                  <span className="text-white/70">Every {source.crawl_frequency_minutes} min</span>
                </div>
              </Card.Content>

              <Card.Footer>
                <Button variant="ghost" size="sm">Settings</Button>
                <Button variant="secondary" size="sm" icon={source.status === 'active' ? Pause : Play}>
                  {source.status === 'active' ? 'Pause' : 'Resume'}
                </Button>
              </Card.Footer>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// 5. PROVIDERS PAGE
// ============================================

// app/providers/page.tsx
'use client'

import { useState } from 'react'
import { Users, Star, AlertCircle, Plus, TrendingUp } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const mockProviders = [
  {
    id: '1',
    business_name: 'PlumbPro Emergency Services',
    services: ['plumbing', 'drain cleaning', 'emergency repairs'],
    service_areas: ['Downtown', 'Midtown', 'Westside'],
    rating: 4.8,
    review_count: 124,
    emergency_available: true,
    response_time: '30 min',
    price_tier: 'premium',
    leads_received: 45,
    leads_accepted: 38,
    conversion_rate: 0.84,
    is_active: true
  },
  {
    id: '2',
    business_name: 'Quick Fix Plumbing',
    services: ['plumbing', 'leak repair'],
    service_areas: ['Northside', 'Eastside'],
    rating: 4.2,
    review_count: 67,
    emergency_available: false,
    response_time: 'Same day',
    price_tier: 'budget',
    leads_received: 32,
    leads_accepted: 24,
    conversion_rate: 0.75,
    is_active: true
  },
  {
    id: '3',
    business_name: 'Spark Electricians',
    services: ['electrical', 'rewiring', 'lighting'],
    service_areas: ['Downtown', 'Southside'],
    rating: 4.6,
    review_count: 89,
    emergency_available: true,
    response_time: '2 hours',
    price_tier: 'standard',
    leads_received: 28,
    leads_accepted: 22,
    conversion_rate: 0.79,
    is_active: true
  }
]

export default function ProvidersPage() {
  const [providers] = useState(mockProviders)

  return (
    <div className="min-h-screen bg-[#030305]">
      <Header />
      
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Providers</h1>
            <p className="text-white/40 mt-1">Manage your service provider network</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary">Import CSV</Button>
            <Button icon={Plus}>Add Provider</Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <Card key={provider.id} variant="elevated">
              <Card.Header>
                <div>
                  <h3 className="font-semibold text-white text-lg">{provider.business_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Star className="w-4 h-4 fill-current" />
                      {provider.rating}
                    </span>
                    <span className="text-sm text-white/40">({provider.review_count} reviews)</span>
                  </div>
                </div>
                <Badge variant={provider.is_active ? 'success' : 'neutral'}>
                  {provider.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </Card.Header>

              <Card.Content className="space-y-4">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Services</p>
                  <div className="flex flex-wrap gap-2">
                    {provider.services.map((service) => (
                      <span key={service} className="px-2 py-1 rounded-lg bg-white/5 text-white/70 text-sm">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-black/30 border border-white/[0.06]">
                    <p className="text-xs text-white/40">Leads Received</p>
                    <p className="text-xl font-bold text-white font-mono">{provider.leads_received}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-black/30 border border-white/[0.06]">
                    <p className="text-xs text-white/40">Conversion</p>
                    <p className="text-xl font-bold text-emerald-400 font-mono">
                      {(provider.conversion_rate * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-white/50">
                  <span>⏱ {provider.response_time}</span>
                  <span>💰 {provider.price_tier}</span>
                </div>

                {provider.emergency_available && (
                  <div className="flex items-center gap-2 text-sm text-amber-400">
                    <AlertCircle className="w-4 h-4" />
                    24/7 Emergency Available
                  </div>
                )}
              </Card.Content>

              <Card.Footer>
                <Button variant="ghost" size="sm">Edit</Button>
                <Button variant="secondary" size="sm">View Leads</Button>
              </Card.Footer>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
