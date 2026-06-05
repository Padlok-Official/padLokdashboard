import type { FC } from 'react';
import { Loader2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TopUpTier {
  tier: string;
  count: number;
}

interface TopUpFrequencyChartProps {
  data?: TopUpTier[];
  loading?: boolean;
}

const TopUpFrequencyChart: FC<TopUpFrequencyChartProps> = ({ data = [], loading }) => {
  const chartData = data.map((d) => ({ amount: `¢${d.tier}`, value: d.count }));
  const hasData = chartData.some((d) => d.value > 0);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h3 className="mb-6 text-lg font-bold text-gray-900">
        Top-Up Frequency by Amount
      </h3>
      {loading ? (
        <div className="flex h-[260px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
        </div>
      ) : !hasData ? (
        <div className="flex h-[260px] items-center justify-center text-sm text-gray-500">
          No top-up data available yet.
        </div>
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
            width={50}
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
