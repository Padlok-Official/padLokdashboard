import type { FC } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface BalancePoint {
  day: string; // MON, TUE, ...
  value: number;
}

const DEMO_DATA: BalancePoint[] = [
  { day: 'MON', value: 150 },
  { day: 'TUE', value: 30 },
  { day: 'WED', value: 25 },
  { day: 'THU', value: 20 },
  { day: 'FRI', value: 70 },
  { day: 'SAT', value: 80 },
  { day: 'SUN', value: 60 },
];

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

interface WalletBalanceTrendChartProps {
  data?: BalancePoint[];
  isLoading?: boolean;
  isDemo?: boolean;
  /** % change vs previous period for the little header tile. */
  deltaPct?: number;
}

const WalletBalanceTrendChart: FC<WalletBalanceTrendChartProps> = ({
  data,
  isLoading,
  isDemo,
  deltaPct,
}) => {
  const chartData = data && data.length > 0 ? data : DEMO_DATA;
  const delta = Number.isFinite(deltaPct) ? (deltaPct as number) : 1.3;
  const isUp = delta >= 0;
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-gray-900">
            Average Wallet Balance Trend
          </h3>
          {isDemo && !isLoading && (
            <span
              className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500"
              title="No live activity yet — showing demo data."
            >
              demo
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-gray-900">
              {Math.abs(delta).toFixed(1)}%
            </span>
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full ${
                isUp ? 'bg-brand-green' : 'bg-red-500'
              }`}
            >
              {isUp ? (
                <TrendingUp size={12} className="text-white" />
              ) : (
                <TrendingDown size={12} className="text-white" />
              )}
            </div>
          </div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
            vs last week
          </p>
        </div>
      </div>
      {isLoading ? (
        <div className="h-[220px] animate-pulse rounded-lg bg-gray-50" />
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
              tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)}
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
