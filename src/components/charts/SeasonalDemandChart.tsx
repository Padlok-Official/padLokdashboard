import type { FC } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { month: 'JAN', value: 2800 },
  { month: 'FEB', value: 2500 },
  { month: 'MAR', value: 3200 },
  { month: 'APR', value: 3600 },
  { month: 'MAY', value: 3800 },
  { month: 'JUN', value: 3400 },
  { month: 'JUL', value: 2200 },
  { month: 'AUG', value: 3348 },
  { month: 'SEP', value: 3100 },
  { month: 'OCT', value: 2600 },
  { month: 'NOV', value: 3000 },
  { month: 'DEC', value: 3800 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
}

const CustomTooltip: FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-brand-deep-navy px-3 py-2 text-white shadow-lg">
        <p className="text-[10px] text-gray-300">Forecast:</p>
        <p className="text-sm font-semibold">
          ¢{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const SeasonalDemandChart: FC = () => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h3 className="mb-6 text-xl font-bold text-gray-900">
        Seasonal Demand Patterns
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2DB52D" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#2DB52D" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f0f0f0"
            horizontal={true}
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: '#9e9e9e' }}
            axisLine={{ stroke: '#e0e0e0' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#9e9e9e' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : `${v}`)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#2DB52D"
            strokeWidth={2.5}
            fill="url(#demandGradient)"
            dot={false}
            activeDot={{ fill: '#2DB52D', r: 6, stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SeasonalDemandChart;
