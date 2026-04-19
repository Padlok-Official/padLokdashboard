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
import { usePlatformActivity, useFinancialSummary } from '@/hooks/useAnalytics';

/**
 * Demo-mode fallback. If /analytics/financial-summary returns an error
 * (404/5xx/network), we render these so the page stays useful for design
 * review. The doc's convention: render real data when available, demo data
 * (with a badge) otherwise — never a blank chart.
 */
const DEMO_PIE_DATA = [
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

  const {
    data: financials,
    isLoading: financialsLoading,
    error: financialsError,
  } = useFinancialSummary();

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

  // Real financials when the API is happy; demo rows when it errors.
  // A slice where every slot is zero (fresh DB) would render as a blank
  // ring, so we fall back to demo values in that case too.
  const pieData = useMemo(() => {
    if (!financials) return DEMO_PIE_DATA;
    const real = [
      { name: 'Total Revenue', value: financials.totalRevenue },
      { name: 'In Escrow Balance', value: financials.inEscrowBalance },
      { name: 'Transaction Fees', value: financials.transactionFees },
    ];
    const total = real.reduce((sum, r) => sum + r.value, 0);
    return total > 0 ? real : DEMO_PIE_DATA;
  }, [financials]);

  const pieIsDemo = !financials || financialsError !== null
    ? true
    : [financials.totalRevenue, financials.inEscrowBalance, financials.transactionFees]
        .every((v) => v === 0);

  const currencySymbol = financials?.currency === 'NGN' ? '₦' : financials?.currency === 'USD' ? '$' : '¢';

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
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Financial Summary</h3>
            {pieIsDemo && (
              <span
                className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500"
                title={
                  financialsError
                    ? "Couldn't reach the analytics endpoint — showing demo data."
                    : 'No live financial activity yet — showing demo data.'
                }
              >
                demo
              </span>
            )}
          </div>

          {financialsLoading ? (
            <div className="flex h-[280px] items-center justify-center">
              <div className="h-36 w-36 animate-pulse rounded-full border-[18px] border-gray-200" />
            </div>
          ) : (
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
                  formatter={(val: number, name: string) => [
                    `${currencySymbol}${val.toLocaleString()}`,
                    name,
                  ]}
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
          )}
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;
