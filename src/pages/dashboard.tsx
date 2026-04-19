import { useMemo } from 'react';
import type { FC } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlatformActivity } from '@/hooks/useAnalytics';


const pieData = [
  { name: 'Total Revenue', value: 389200 },
  { name: 'In Escrow Balance', value: 14250 },
  { name: 'Transaction Fees', value: 2200 },
];

const PIE_COLORS = ['#2DB52D', '#033604', '#7DD87D'];

const formatNumber = (val: number) => {
  if (val >= 1000) return `${(val / 1000).toFixed(val >= 10000 ? 0 : 1)}k`;
  return val.toString();
};

/**
 * Small "live" indicator that pulses when a fetch is in flight.
 */
const LiveIndicator: FC<{ isFetching: boolean; error: unknown }> = ({
  isFetching,
  error,
}) => {
  if (error) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
        <AlertTriangle size={12} />
        Offline
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
      <span
        className={cn(
          'h-2 w-2 rounded-full',
          isFetching ? 'animate-pulse bg-[#2DB52D]' : 'bg-[#2DB52D]',
        )}
      />
      Live
    </span>
  );
};

const DashboardPage: FC = () => {
  const {
    data: activity,
    isLoading,
    isFetching,
    error,
  } = usePlatformActivity();

  // Transform API response → histogram rows. Until the first fetch
  // resolves, show zeros so the chart axes are stable.
  const histogramData = useMemo(
    () => [
      { name: 'Disputes', value: activity?.disputes ?? 0 },
      { name: 'Completed Txns', value: activity?.completedTransactions ?? 0 },
      { name: 'Ongoing Txns', value: activity?.ongoingTransactions ?? 0 },
      { name: 'Active Users', value: activity?.activeUsers ?? 0 },
    ],
    [activity],
  );

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-green">Business Intelligence Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Real-time insights into your escrow platform performance
        </p>
      </div>

      {/* Charts Row — Histogram + Pie Chart */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Histogram — Platform Activity (LIVE) */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Platform Activity</h3>
            <LiveIndicator isFetching={isFetching} error={error} />
          </div>

          {isLoading ? (
            <div className="flex h-[280px] items-end justify-around gap-4 px-4">
              {[0.45, 0.7, 0.55, 0.9].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h * 100}%` }}
                  className="w-16 animate-pulse rounded-t-md bg-gray-200"
                />
              ))}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={histogramData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#9e9e9e' }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#9e9e9e' }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickLine={false}
                  tickFormatter={formatNumber}
                />
                <Tooltip
                  formatter={(val: number) => [val.toLocaleString(), '']}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" fill="#2DB52D" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {error && (
            <p className="mt-2 text-xs text-red-500">
              Couldn&apos;t reach the API — retrying…
            </p>
          )}
        </div>

        {/* Pie Chart — Financial Summary */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 lg:col-span-2">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Financial Summary</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="45%"
                outerRadius={75}
                innerRadius={40}
                dataKey="value"
                label={({ percent }) => `${((percent ?? 0) * 100).toFixed(1)}%`}
                labelLine={false}
              >
                {pieData.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: number, name: string) => [`¢${val.toLocaleString()}`, name]}
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  fontSize: '12px',
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;
