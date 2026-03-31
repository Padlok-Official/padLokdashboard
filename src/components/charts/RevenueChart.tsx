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

const data = [
  { month: 'Jan', Revenue: 38000, Forecast: 30000 },
  { month: 'Feb', Revenue: 35000, Forecast: 38000 },
  { month: 'Mar', Revenue: 42000, Forecast: 43000 },
  { month: 'Apr', Revenue: 44000, Forecast: 42000 },
  { month: 'Mai', Revenue: 48000, Forecast: 45000 },
  { month: 'Jun', Revenue: 52000, Forecast: 50000 },
];

const RevenueChart: FC = () => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-bold text-gray-900">Revenue vs Forecast</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
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
    </div>
  );
};

export default RevenueChart;
