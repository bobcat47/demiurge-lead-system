'use client';

import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react';

export function ComplianceBadge() {
  // This would check actual compliance status
  const status = 'compliant'; // 'compliant' | 'warning' | 'violation'

  const config = {
    compliant: {
      icon: ShieldCheck,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      label: 'Compliant'
    },
    warning: {
      icon: Shield,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      label: 'Review'
    },
    violation: {
      icon: ShieldAlert,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      label: 'Issue'
    }
  };

  const { icon: Icon, color, bg, label } = config[status as keyof typeof config];

  return (
    <span className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${bg} ${color} text-xs font-medium`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}
