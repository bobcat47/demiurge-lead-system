// DEMIURGE LEAD MATCHER - COMPONENT LIBRARY
// Copy each component into your Claude Design project

// ============================================
// 1. UTILITY FUNCTIONS
// ============================================

// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================
// 2. BUTTON COMPONENT
// ============================================

// components/ui/button.tsx
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

// ============================================
// 3. CARD COMPONENT
// ============================================

// components/ui/card.tsx
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
  const baseStyles = 'relative rounded-2xl backdrop-blur-xl'
  
  const variants = {
    default: cn(baseStyles, 'bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/[0.06]'),
    elevated: cn(baseStyles, 'bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-indigo-500/20 shadow-[0_4px_24px_rgba(0,0,0,0.3),0_0_0_1px_rgba(99,102,241,0.1)]'),
    glow: cn(baseStyles, 'bg-gradient-to-br from-white/5 to-white/[0.02] border border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.15),0_4px_24px_rgba(0,0,0,0.3)]'),
  }
  
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  }

  return (
    <div className={cn(variants[variant], paddings[padding], className)} {...props}>
      {children}
    </div>
  )
}

// Card subcomponents
Card.Header = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn('flex items-start justify-between mb-4', className)}>{children}</div>
)

Card.Title = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <h3 className={cn('text-lg font-semibold text-white', className)}>{children}</h3>
)

Card.Content = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={className}>{children}</div>
)

Card.Footer = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn('flex items-center justify-end gap-3 mt-4 pt-4 border-t border-white/5', className)}>{children}</div>
)

// ============================================
// 4. BADGE COMPONENT
// ============================================

// components/ui/badge.tsx
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  dot?: boolean
}

export function Badge({ className, variant = 'neutral', dot, children, ...props }: BadgeProps) {
  const variants = {
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    danger: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    info: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    neutral: 'bg-white/5 border-white/10 text-white/60',
  }

  const dotColors = {
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    info: 'bg-cyan-400',
    neutral: 'bg-white/40',
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
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', dotColors[variant])} />}
      {children}
    </span>
  )
}

// ============================================
// 5. SCORE DISPLAY COMPONENT
// ============================================

// components/ui/score-display.tsx
'use client'

import { motion } from 'framer-motion'

interface ScoreDisplayProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  label?: string
  showRing?: boolean
}

export function ScoreDisplay({ score, size = 'md', label = 'Score', showRing = true }: ScoreDisplayProps) {
  const sizes = {
    sm: { container: 'w-12 h-12', value: 'text-lg', label: 'text-[8px]' },
    md: { container: 'w-16 h-16', value: 'text-2xl', label: 'text-[10px]' },
    lg: { container: 'w-20 h-20', value: 'text-3xl', label: 'text-xs' },
  }
  
  const s = sizes[size]
  
  const getColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400'
    if (score >= 60) return 'text-indigo-400'
    if (score >= 40) return 'text-amber-400'
    return 'text-rose-400'
  }

  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className={cn('relative flex flex-col items-center justify-center', s.container)}>
      {showRing && (
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="50%" cy="50%" r="45%" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
          <motion.circle
            cx="50%" cy="50%" r="45%" fill="none" stroke="currentColor" strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={cn(getColor(score))}
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

// ============================================
// 6. STATUS INDICATOR COMPONENT
// ============================================

// components/ui/status-indicator.tsx
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
      <span className={cn('w-2 h-2 rounded-full', pulse && status !== 'idle' && 'animate-pulse', colors[status])} />
      {label && <span className="text-sm text-white/60">{label}</span>}
    </div>
  )
}

// ============================================
// 7. INPUT COMPONENT
// ============================================

// components/ui/input.tsx
import { LucideIcon } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon
  error?: string
}

export function Input({ className, icon: Icon, error, ...props }: InputProps) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />}
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

// ============================================
// 8. SIDEBAR COMPONENT
// ============================================

// components/layout/sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, Zap, Globe, Users, BarChart3, Settings, Plus } from 'lucide-react'

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
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-lg shadow-indigo-400/50" />}
            </Link>
          )
        })}
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-white/[0.06]">
        <div className="rounded-2xl p-4 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/[0.06]">
          <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Add Source
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm transition-colors">
              <Plus className="w-4 h-4" /> Add Provider
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}

// ============================================
// 9. HEADER COMPONENT
// ============================================

// components/layout/header.tsx
import { RefreshCw, Bell } from 'lucide-react'
import { StatusIndicator } from '@/components/ui/status-indicator'
import { Button } from '@/components/ui/button'

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

          <Button variant="ghost" size="sm" icon={RefreshCw}>Refresh</Button>
          
          <button className="relative p-2 rounded-xl bg-white/5 border border-white/[0.06] text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-[#0A0A0F]" />
          </button>
        </div>
      </div>
    </header>
  )
}

// ============================================
// 10. STAT CARD COMPONENT
// ============================================

// components/ui/stat-card.tsx
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: string
  highlight?: boolean
}

export function StatCard({ label, value, icon: Icon, trend, highlight }: StatCardProps) {
  return (
    <div className={cn(
      'p-4 rounded-2xl border transition-all hover:scale-[1.02]',
      highlight 
        ? 'bg-indigo-500/10 border-indigo-500/20' 
        : 'bg-gradient-to-br from-white/5 to-white/[0.02] border-white/[0.06]'
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-white/50 uppercase tracking-wide">{label}</p>
          <p className={cn('text-2xl font-bold mt-1', highlight ? 'text-indigo-400' : 'text-white')}>{value}</p>
        </div>
        <Icon className={cn('w-5 h-5', highlight ? 'text-indigo-400' : 'text-white/40')} />
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          <TrendingUp className="w-3 h-3 text-emerald-400" />
          <span className="text-xs text-emerald-400">{trend}</span>
        </div>
      )}
    </div>
  )
}

// ============================================
// EXPORT ALL COMPONENTS
// ============================================

export {
  Button,
  Card,
  Badge,
  ScoreDisplay,
  StatusIndicator,
  Input,
  Sidebar,
  Header,
  StatCard,
}
