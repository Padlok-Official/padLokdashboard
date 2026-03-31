import type { FC } from 'react';
import { TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
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
        <p className="text-sm font-semibold">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const WalletBalanceTrendChart: FC = () => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-start justify-between">
        <h3 className="text-lg font-bold text-gray-900">
          Average Wallet Balance Trend
        </h3>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-gray-900">1.3%</span>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-green">
              <TrendingUp size={12} className="text-white" />
            </div>
          </div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
            vs last week
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
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
    </div>
  );
};

export default WalletBalanceTrendChart;
