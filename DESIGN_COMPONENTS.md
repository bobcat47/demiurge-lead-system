# Demiurge Lead Matcher - Component Implementation Guide

Quick reference for implementing each UI component with exact specifications.

---

## CORE SETUP

### 1. Install Dependencies
```bash
npm install lucide-react framer-motion clsx tailwind-merge date-fns
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. tailwind.config.ts
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#030305',
          deep: '#0A0A0F',
          elevated: '#12121A',
          hover: '#1A1A25',
        },
        accent: {
          primary: '#6366F1',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#F43F5E',
          info: '#06B6D4',
          premium: '#A855F7',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.06)',
          DEFAULT: 'rgba(255, 255, 255, 0.1)',
          strong: 'rgba(255, 255, 255, 0.15)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-in': 'slide-in 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px currentColor', opacity: '1' },
          '50%': { boxShadow: '0 0 20px currentColor', opacity: '0.8' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
export default config
```

### 3. globals.css
```css
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

/* Glass Card Base */
@layer components {
  .glass-card {
    @apply relative rounded-2xl p-5;
    background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%);
    border: 1px solid rgba(255,255,255,0.06);
    backdrop-filter: blur(20px);
  }
  
  .glass-card-elevated {
    @apply glass-card;
    background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%);
    border-color: rgba(99, 102, 241, 0.2);
    box-shadow: 0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(99, 102, 241, 0.1);
  }
  
  .glass-card-glow {
    box-shadow: 0 0 40px rgba(99, 102, 241, 0.15), 0 4px 24px rgba(0,0,0,0.3);
    border-color: rgba(99, 102, 241, 0.3);
  }
}
```

### 4. utils.ts
```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## COMPONENT LIBRARY

### Button.tsx
```tsx
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIcon
  loading?: boolean
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading,
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5',
    secondary: 'bg-white/5 border border-white/10 text-white/90 hover:bg-white/10 hover:border-white/15',
    ghost: 'text-white/70 hover:text-white hover:bg-white/5',
    danger: 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/25',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      {Icon && !loading && <Icon className="w-4 h-4" />}
      {children}
    </button>
  )
}
```

### Card.tsx
```tsx
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glow'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({
  className,
  variant = 'default',
  padding = 'md',
  children,
  ...props
}: CardProps) {
  const variants = {
    default: 'glass-card',
    elevated: 'glass-card-elevated',
    glow: 'glass-card glass-card-glow',
  }
  
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  }

  return (
    <div
      className={cn(variants[variant], paddings[padding], className)}
      {...props}
    >
      {children}
    </div>
  )
}

// Card subcomponents
Card.Header = function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('flex items-start justify-between mb-4', className)}>{children}</div>
}

Card.Title = function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={cn('text-lg font-semibold text-white', className)}>{children}</h3>
}

Card.Content = function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={className}>{children}</div>
}

Card.Footer = function CardFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('flex items-center justify-end gap-3 mt-4 pt-4 border-t border-white/5', className)}>{children}</div>
}
```

### Badge.tsx
```tsx
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  dot?: boolean
}

export function Badge({
  className,
  variant = 'neutral',
  dot,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    danger: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    info: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    neutral: 'bg-white/5 border-white/10 text-white/60',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border',
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full animate-pulse',
          variant === 'success' && 'bg-emerald-400',
          variant === 'warning' && 'bg-amber-400',
          variant === 'danger' && 'bg-rose-400',
          variant === 'info' && 'bg-cyan-400',
        )} />
      )}
      {children}
    </span>
  )
}
```

### ScoreDisplay.tsx
```tsx
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface ScoreDisplayProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  label?: string
  showRing?: boolean
}

export function ScoreDisplay({
  score,
  size = 'md',
  label = 'Score',
  showRing = true,
}: ScoreDisplayProps) {
  const sizes = {
    sm: { container: 'w-12 h-12', value: 'text-lg', label: 'text-[8px]' },
    md: { container: 'w-16 h-16', value: 'text-2xl', label: 'text-[10px]' },
    lg: { container: 'w-20 h-20', value: 'text-3xl', label: 'text-xs' },
  }
  
  const s = sizes[size]
  
  // Color based on score
  const getColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400'
    if (score >= 60) return 'text-indigo-400'
    if (score >= 40) return 'text-amber-400'
    return 'text-rose-400'
  }

  return (
    <div className={cn('relative flex flex-col items-center justify-center', s.container)}>
      {showRing && (
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="3"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${score * 2.83} 283`}
            className={cn(getColor(score))}
            initial={{ strokeDasharray: '0 283' }}
            animate={{ strokeDasharray: `${score * 2.83} 283` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
      )}
      <div className="relative z-10 flex flex-col items-center">
        <motion.span
          className={cn('font-mono font-bold tabular-nums', s.value, getColor(score))}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {score}
        </motion.span>
        <span className={cn('text-white/40 uppercase tracking-wider', s.label)}>{label}</span>
      </div>
    </div>
  )
}
```

### StatusIndicator.tsx
```tsx
import { cn } from '@/lib/utils'

interface StatusIndicatorProps {
  status: 'active' | 'paused' | 'error' | 'idle'
  label?: string
  pulse?: boolean
}

export function StatusIndicator({ status, label, pulse = true }: StatusIndicatorProps) {
  const colors = {
    active: 'bg-emerald-400 shadow-emerald-400/50',
    paused: 'bg-amber-400 shadow-amber-400/50',
    error: 'bg-rose-400 shadow-rose-400/50',
    idle: 'bg-white/30',
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'w-2 h-2 rounded-full',
          pulse && status !== 'idle' && 'animate-pulse-glow',
          colors[status]
        )}
      />
      {label && <span className="text-sm text-white/60">{label}</span>}
    </div>
  )
}
```

### Input.tsx
```tsx
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon
  error?: string
}

export function Input({ className, icon: Icon, error, ...props }: InputProps) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
      )}
      <input
        className={cn(
          'w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30',
          'focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10',
          'transition-all duration-200',
          Icon && 'pl-10',
          error && 'border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/10',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-rose-400 mt-1">{error}</span>}
    </div>
  )
}
```

---

## LAYOUT COMPONENTS

### Sidebar.tsx
```tsx
'use client'

import { cn } from '@/lib/utils'
import { 
  Activity, Zap, Globe, Users, BarChart3, Settings,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { id: 'leads', label: 'Live Leads', icon: Zap, href: '/leads' },
  { id: 'sources', label: 'Sources', icon: Globe, href: '/sources' },
  { id: 'providers', label: 'Providers', icon: Users, href: '/providers' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 w-[280px] h-screen bg-[#0A0A0F]/95 border-r border-white/[0.06] backdrop-blur-xl z-50 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Demiurge</h1>
            <p className="text-xs text-white/40">Lead Matcher</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'text-indigo-400')} />
              {item.label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-lg shadow-indigo-400/50" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-white/[0.06]">
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" />
              Add Source
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm transition-colors">
              <Plus className="w-4 h-4" />
              Add Provider
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
```

### Header.tsx
```tsx
import { StatusIndicator } from './status-indicator'
import { RefreshCw, Bell } from 'lucide-react'
import { Button } from './button'

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-[#030305]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="flex items-center justify-between h-16 px-8">
        <div>
          <h2 className="text-xl font-semibold text-white">Dashboard</h2>
          <p className="text-sm text-white/40">Monitor and manage your lead pipeline</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/[0.06]">
            <StatusIndicator status="active" pulse />
            <span className="text-sm text-white/60">System Active</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              Compliant
            </span>
          </div>

          <Button variant="ghost" size="sm" icon={RefreshCw}>
            Refresh
          </Button>
          
          <button className="relative p-2 rounded-xl bg-white/5 border border-white/[0.06] text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-[#0A0A0F]" />
          </button>
        </div>
      </div>
    </header>
  )
}
```

---

## PAGE IMPLEMENTATION

### leads/page.tsx
```tsx
'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScoreDisplay } from '@/components/ui/score-display'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Filter, ChevronDown, ChevronUp, CheckCircle2, XCircle } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ... Lead interface and data fetching

export default function LeadsPage() {
  const [expandedLead, setExpandedLead] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')

  return (
    <div className="p-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Lead Feed</h1>
          <p className="text-white/40 mt-1">Real-time service intent detection</p>
        </div>
        <Button icon={Filter}>Filter</Button>
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
      <Input icon={Search} placeholder="Search leads..." />

      {/* Lead Cards */}
      <div className="space-y-4">
        {/* Map through leads */}
        <LeadCard />
      </div>
    </div>
  )
}

function LeadCard({ lead }: { lead: any }) {
  const [expanded, setExpanded] = useState(false)
  const isUrgent = lead?.parsed_intent?.urgency === 'urgent'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'glass-card transition-all duration-300',
        isUrgent && 'border-amber-500/30 shadow-lg shadow-amber-500/10',
        expanded && 'glass-card-glow'
      )}
    >
      {/* Card Header - Always Visible */}
      <div
        className="flex items-start justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-mono font-semibold">
              #{lead?.lead_number || '001'}
            </span>
            {isUrgent && (
              <Badge variant="warning" dot>Urgent</Badge>
            )}
            <Badge variant="info">{lead?.parsed_intent?.service_category || 'Unknown'}</Badge>
          </div>
          <h3 className="text-lg font-semibold text-white truncate">
            {lead?.title || 'Lead Title'}
          </h3>
          <p className="text-white/50 mt-1 line-clamp-1">
            {lead?.summary || 'Lead summary...'}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <ScoreDisplay score={lead?.parsed_intent?.lead_quality_score || 85} size="md" />
          <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            {expanded ? <ChevronUp className="w-5 h-5 text-white/40" /> : <ChevronDown className="w-5 h-5 text-white/40" />}
          </button>
        </div>
      </div>

      {/* Meta Row */}
      <div className="flex items-center gap-4 mt-4 text-sm text-white/40">
        <span className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          2m ago
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4" />
          Downtown, NY
        </span>
        <span className="flex items-center gap-1.5">
          <DollarSign className="w-4 h-4" />
          Premium
        </span>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-white/[0.06]"
          >
            {/* Original Post */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-white/60 mb-3">Original Post</h4>
              <div className="p-4 rounded-xl bg-black/30 border border-white/[0.06]">
                <p className="text-white/80 whitespace-pre-wrap">
                  {lead?.raw_post?.content || 'Post content...'}
                </p>
              </div>
            </div>

            {/* Signals */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-white/60 mb-3">Detected Signals</h4>
              <div className="flex flex-wrap gap-2">
                {['has_budget', 'asking_recommendations', 'urgent', 'ready_to_hire'].map((signal) => (
                  <span
                    key={signal}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"
                  >
                    ✓ {signal.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>

            {/* Matched Providers */}
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-3">Matched Providers (3)</h4>
              <div className="space-y-3">
                {/* Map through matches */}
                <MatchCard />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-white/[0.06]">
              <Button variant="secondary" icon={XCircle}>
                Reject
              </Button>
              <Button icon={CheckCircle2}>
                Approve & Contact
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function MatchCard({ match }: { match?: any }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-indigo-500/30 transition-colors">
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex flex-col items-center justify-center">
        <span className="text-xl font-mono font-bold text-indigo-400">98</span>
        <span className="text-[10px] text-white/40 uppercase">Match</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h4 className="font-semibold text-white">PlumbPro Emergency Services</h4>
          <Badge variant="success" dot>24/7</Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-white/50 mb-2">
          <span className="flex items-center gap-1">⭐ 4.8</span>
          <span className="flex items-center gap-1">⏱ 30min</span>
          <span className="flex items-center gap-1">💰 Premium</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 rounded-lg bg-white/5 text-white/60 text-xs">Serves Downtown</span>
          <span className="px-2 py-1 rounded-lg bg-white/5 text-white/60 text-xs">Emergency Available</span>
        </div>
      </div>
      
      <Button variant="secondary" size="sm">View</Button>
    </div>
  )
}
```

---

## ANIMATION UTILITIES

### hooks/useCountUp.ts
```typescript
import { useEffect, useState } from 'react'

export function useCountUp(target: number, duration: number = 1000) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(easeOut * target))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [target, duration])

  return count
}
```

---

## FINAL CHECKLIST

### Must-Have Components
- [ ] Button (primary, secondary, ghost, danger variants)
- [ ] Card (default, elevated, glow variants)
- [ ] Badge (success, warning, danger, info, neutral)
- [ ] ScoreDisplay (with animated ring)
- [ ] StatusIndicator (with pulse animation)
- [ ] Input (with icon support)
- [ ] Sidebar navigation
- [ ] Header with status

### Must-Have Pages
- [ ] Dashboard / Leads Feed
- [ ] Source Manager
- [ ] Provider Database
- [ ] Analytics

### Animations to Implement
- [ ] Page load slide-in
- [ ] Card hover effects
- [ ] Score count-up animation
- [ ] Expand/collapse transitions
- [ ] Button press feedback
- [ ] Loading shimmer states

### Visual Effects
- [ ] Glassmorphism cards
- [ ] Gradient accents
- [ ] Glow shadows on active elements
- [ ] Backdrop blur on overlays
- [ ] Subtle grid background

---

**Implementation Priority:**
1. Set up Tailwind config with custom colors
2. Create base UI components (Button, Card, Badge)
3. Build layout (Sidebar, Header)
4. Implement Leads page with animations
5. Add polish (hover effects, transitions)
