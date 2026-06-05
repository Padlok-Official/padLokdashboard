import type { FC } from 'react';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';
import type { WalletBalanceTrendPoint } from '@/services/analytics-service';

interface WalletBalanceTrendChartProps {
  data?: WalletBalanceTrendPoint[];
  loading?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
}

const CustomTooltip: FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-brand-green px-3 py-1.5 text-white shadow-lg">
        <p className="text-sm font-semibold">{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const WalletBalanceTrendChart: FC<WalletBalanceTrendChartProps> = ({ data = [], loading }) => {
  const chartData = data.map((d) => ({ day: d.day_label, value: Number(d.avg_balance) || 0 }));
  const hasData = chartData.length > 0;

  // Period-over-period change: first vs last non-trivial day in the window.
  const first = chartData[0]?.value ?? 0;
  const last = chartData[chartData.length - 1]?.value ?? 0;
  const changePct = first > 0 ? ((last - first) / first) * 100 : 0;
  const isUp = changePct >= 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-start justify-between">
        <h3 className="text-lg font-bold text-gray-900">
          Average Wallet Balance Trend
        </h3>
        {hasData && (
          <div className="text-right">
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-gray-900">
                {Math.abs(changePct).toFixed(1)}%
              </span>
              <div
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full',
                  isUp ? 'bg-brand-green' : 'bg-[#F44336]',
                )}
              >
                {isUp ? (
                  <TrendingUp size={12} className="text-white" />
                ) : (
                  <TrendingDown size={12} className="text-white" />
                )}
              </div>
            </div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
              over period
            </p>
          </div>
        )}
      </div>
      {loading ? (
        <div className="flex h-[220px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
        </div>
      ) : !hasData ? (
        <div className="flex h-[220px] items-center justify-center text-sm text-gray-500">
          No wallet balance data available yet.
        </div>
      ) : (
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: '#9e9e9e' }}
            axisLine={{ stroke: '#e0e0e0' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9e9e9e' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2DB52D"
            strokeWidth={2.5}
            dot={{ fill: '#2DB52D', r: 4, stroke: '#fff', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#2DB52D', stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
      )}
    </div>
  );
};

export default WalletBalanceTrendChart;
