import type { FC, ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: ReactNode;
  value: string;
  label: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

const StatCard: FC<StatCardProps> = ({ icon, value, label, change, trend }) => {
  return (
    <div className="rounded-2xl border border-brand-green/40 bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#020036]">
          {icon}
        </div>
        {trend !== 'neutral' && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium',
              trend === 'up' ? 'text-brand-green' : 'text-[#F44336]',
            )}
          >
            {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {change}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="mt-1 text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
};

export default StatCard;
