import type { FC } from 'react';
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

interface RevenuePoint {
  month: string; // short label e.g. "Jan"
  Revenue: number;
  Forecast: number;
}

const DEMO_DATA: RevenuePoint[] = [
  { month: 'Jan', Revenue: 38000, Forecast: 30000 },
  { month: 'Feb', Revenue: 35000, Forecast: 38000 },
  { month: 'Mar', Revenue: 42000, Forecast: 43000 },
  { month: 'Apr', Revenue: 44000, Forecast: 42000 },
  { month: 'Mai', Revenue: 48000, Forecast: 45000 },
  { month: 'Jun', Revenue: 52000, Forecast: 50000 },
];

interface RevenueChartProps {
  /** Optional — when omitted, renders the demo dataset. */
  data?: RevenuePoint[];
  isLoading?: boolean;
  /** Shows the "demo" chip in the title bar. */
  isDemo?: boolean;
}

const RevenueChart: FC<RevenueChartProps> = ({ data, isLoading, isDemo }) => {
  const chartData = data && data.length > 0 ? data : DEMO_DATA;
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Revenue vs Forecast</h3>
        {isDemo && !isLoading && (
          <span
            className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500"
            title="No live activity yet — showing demo data."
          >
            demo
          </span>
        )}
      </div>
      {isLoading ? (
        <div className="h-[280px] animate-pulse rounded-lg bg-gray-50" />
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
              tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)}
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
