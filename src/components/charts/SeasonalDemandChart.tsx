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

interface ChartPoint {
  month: string; // short label — JAN, FEB, ...
  value: number;
}

/** Demo data used when the API is offline or the DB returns empty. */
const DEMO_DATA: ChartPoint[] = [
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

interface SeasonalDemandChartProps {
  /** Optional — when omitted, renders the demo dataset. */
  data?: ChartPoint[];
  isLoading?: boolean;
  /** Shows the "demo" chip in the title bar. */
  isDemo?: boolean;
  /** Tooltip prefix (e.g. "Transactions"). Defaults to "Volume". */
  tooltipLabel?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

const CustomTooltip: FC<CustomTooltipProps & { tooltipLabel: string }> = ({
  active,
  payload,
  tooltipLabel,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-brand-deep-navy px-3 py-2 text-white shadow-lg">
        <p className="text-[10px] text-gray-300">{tooltipLabel}:</p>
        <p className="text-sm font-semibold">
          {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const SeasonalDemandChart: FC<SeasonalDemandChartProps> = ({
  data,
  isLoading,
  isDemo,
  tooltipLabel = 'Volume',
}) => {
  const chartData = data && data.length > 0 ? data : DEMO_DATA;
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">
          Seasonal Demand Patterns
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
        <div className="h-[320px] animate-pulse rounded-lg bg-gray-50" />
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
            <Tooltip content={<CustomTooltip tooltipLabel={tooltipLabel} />} />
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
