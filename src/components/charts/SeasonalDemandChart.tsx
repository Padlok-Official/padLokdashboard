import type { FC } from 'react';
import { Loader2 } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { SeasonalDemandPoint } from '@/services/analytics-service';

interface SeasonalDemandChartProps {
  data?: SeasonalDemandPoint[];
  loading?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
}

const CustomTooltip: FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-brand-deep-navy px-3 py-2 text-white shadow-lg">
        <p className="text-[10px] text-gray-300">Escrow transactions:</p>
        <p className="text-sm font-semibold">
          {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const SeasonalDemandChart: FC<SeasonalDemandChartProps> = ({ data = [], loading }) => {
  const chartData = data.map((d) => ({ month: d.short_label, value: d.value }));
  const hasData = chartData.some((d) => d.value > 0);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h3 className="mb-6 text-xl font-bold text-gray-900">
        Seasonal Demand Patterns
      </h3>
      {loading ? (
        <div className="flex h-[320px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
        </div>
      ) : !hasData ? (
        <div className="flex h-[320px] items-center justify-center text-sm text-gray-500">
          No demand data available yet.
        </div>
      ) : (
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={chartData}>
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
      )}
    </div>
  );
};

export default SeasonalDemandChart;
