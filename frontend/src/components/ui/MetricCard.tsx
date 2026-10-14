import type { LucideIcon } from 'lucide-react';
import { cn } from '../../utils';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  iconColor?: string;
}

export const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-indigo-400',
}: MetricCardProps) => (
  <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex items-start gap-4">
    <div className={cn('p-3 rounded-xl bg-slate-700/60', iconColor)}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-slate-400 text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
      {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
    </div>
  </div>
);
