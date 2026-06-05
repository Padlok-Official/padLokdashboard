import type { FC } from 'react';
import { Loader2 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { RevenueTrendPoint } from '@/services/analytics-service';

interface RevenueChartProps {
  data?: RevenueTrendPoint[];
  loading?: boolean;
}

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// Turn a 'YYYY-MM' bucket into a short month label for the X axis.
const toMonthLabel = (month: string): string => {
  const m = Number(month.slice(5, 7));
  return MONTH_LABELS[m - 1] ?? month;
};

const RevenueChart: FC<RevenueChartProps> = ({ data = [], loading }) => {
  const chartData = data.map((d) => ({
    month: toMonthLabel(d.month),
    Revenue: Number(d.revenue) || 0,
    Forecast: Number(d.forecast) || 0,
  }));
  const hasData = chartData.some((d) => d.Revenue > 0 || d.Forecast > 0);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-bold text-gray-900">Revenue vs Forecast</h3>
      {loading ? (
        <div className="flex h-[280px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
        </div>
      ) : !hasData ? (
        <div className="flex h-[280px] items-center justify-center text-sm text-gray-500">
          No revenue data available yet.
        </div>
      ) : (
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: '#9e9e9e' }}
            axisLine={{ stroke: '#e0e0e0' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#9e9e9e' }}
            axisLine={{ stroke: '#e0e0e0' }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              fontSize: '12px',
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
          />
          <Line
            type="monotone"
            dataKey="Revenue"
            stroke="#2DB52D"
            strokeWidth={2}
            dot={{ fill: '#2DB52D', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="Forecast"
            stroke="#9E9E9E"
            strokeWidth={2}
            dot={{ fill: '#9E9E9E', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      )}
    </div>
  );
};

export default RevenueChart;
