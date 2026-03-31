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

const data = [
  { amount: '¢1000+', value: 800 },
  { amount: '¢500', value: 3500 },
  { amount: '¢200', value: 2200 },
  { amount: '¢100', value: 4500 },
  { amount: '¢50', value: 1500 },
];

const TopUpFrequencyChart: FC = () => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h3 className="mb-6 text-lg font-bold text-gray-900">
        Top-Up Frequency by Amount
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" barCategoryGap={12}>
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
    </div>
  );
};

export default TopUpFrequencyChart;
