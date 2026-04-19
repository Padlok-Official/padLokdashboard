import type { FC } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TierPoint {
  amount: string;
  value: number;
}

const DEMO_DATA: TierPoint[] = [
  { amount: '¢1000+', value: 800 },
  { amount: '¢500', value: 3500 },
  { amount: '¢200', value: 2200 },
  { amount: '¢100', value: 4500 },
  { amount: '¢50', value: 1500 },
];

interface TopUpFrequencyChartProps {
  /** Optional — when omitted, renders the demo dataset. */
  data?: TierPoint[];
  isLoading?: boolean;
  isDemo?: boolean;
}

const TopUpFrequencyChart: FC<TopUpFrequencyChartProps> = ({ data, isLoading, isDemo }) => {
  const chartData = data && data.length > 0 ? data : DEMO_DATA;
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">
          Top-Up Frequency by Amount
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
      {isLoading ? (
        <div className="h-[260px] animate-pulse rounded-lg bg-gray-50" />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} layout="vertical" barCategoryGap={12}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              horizontal={false}
              vertical={true}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: '#9e9e9e' }}
              axisLine={{ stroke: '#e0e0e0' }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="amount"
              tick={{ fontSize: 12, fill: '#9e9e9e' }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                fontSize: '12px',
              }}
            />
            <Bar
              dataKey="value"
              fill="#2DB52D"
              radius={[0, 4, 4, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default TopUpFrequencyChart;
