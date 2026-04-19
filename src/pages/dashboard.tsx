import { useMemo } from 'react';
import type { FC, ReactNode } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  AlertTriangle,
  Wallet,
  Lock,
  Receipt,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlatformActivity, useFinancialSummary } from '@/hooks/useAnalytics';

/**
 * Demo-mode fallback for the Financial Summary cards. If the API errors
 * OR the real numbers are all zero, we render these so the page stays
 * useful during design review and demos — always paired with a "demo"
 * badge so nobody mistakes them for live figures.
 */
const DEMO_FINANCIALS = {
  totalRevenue: 389_200,
  inEscrowBalance: 14_250,
  transactionFees: 2_200,
};

const formatNumber = (val: number) => {
  if (val >= 1000) return `${(val / 1000).toFixed(val >= 10000 ? 0 : 1)}k`;
  return val.toString();
};

/**
 * Currency prefix lookup. Keep this tiny — we only ever surface the three
 * rails the admin-api exposes. Fallback to the cedi sign to match earlier
 * copy in the design files.
 */
const currencyPrefix = (code: string | undefined): string => {
  switch (code) {
    case 'NGN':
      return '₦';
    case 'USD':
      return '$';
    case 'GHS':
      return 'GH₵';
    default:
      return '¢';
  }
};

/**
 * Compact currency formatter for stat card values. We don't want
 * "₦389,200.00" squeezed into a narrow card — scaling to "₦389.2k" /
 * "₦1.4M" keeps things scannable. Exact values are in the tooltip.
 */
const formatCurrencyCompact = (value: number, code: string | undefined): string => {
  const prefix = currencyPrefix(code);
  if (!Number.isFinite(value) || value === 0) return `${prefix}0`;
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}${prefix}${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 10_000) return `${sign}${prefix}${(abs / 1_000).toFixed(0)}k`;
  if (abs >= 1_000) return `${sign}${prefix}${(abs / 1_000).toFixed(1)}k`;
  return `${sign}${prefix}${abs.toFixed(0)}`;
};

/** Full-precision value for tooltips and accessibility. */
const formatCurrencyFull = (value: number, code: string | undefined): string => {
  const prefix = currencyPrefix(code);
  try {
    return `${prefix}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } catch {
    return `${prefix}${value}`;
  }
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

/**
 * One row in the Financial Summary side panel. Icon tile on the left, then
 * label + compact-formatted value stacked, with the percent-of-total chip
 * on the far right so the eye can still compare proportions without a pie
 * chart. Tooltip (title attr) carries the full-precision number.
 */
const SummaryCard: FC<{
  icon: ReactNode;
  iconBg: string;
  label: string;
  value: number;
  currencyCode: string | undefined;
  percentOfTotal: number;
  isLoading: boolean;
}> = ({ icon, iconBg, label, value, currencyCode, percentOfTotal, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
        <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-gray-200" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 transition-colors hover:border-brand-green/30 hover:bg-[#F6FBF6]"
      title={`${label}: ${formatCurrencyFull(value, currencyCode)}`}
    >
      <div
        className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', iconBg)}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-gray-500">{label}</p>
        <p className="mt-0.5 truncate text-lg font-bold text-gray-900">
          {formatCurrencyCompact(value, currencyCode)}
        </p>
      </div>
      <span
        className={cn(
          'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums',
          percentOfTotal > 0
            ? 'bg-brand-green/10 text-brand-green'
            : 'bg-gray-100 text-gray-400',
        )}
      >
        {percentOfTotal.toFixed(1)}%
      </span>
    </div>
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

  // Real financials when the API is happy; demo rows when it errors or
  // when the real numbers are all zero (fresh DB → pie/cards would be
  // blank which tells the admin nothing useful).
  const financialsForDisplay = useMemo(() => {
    if (!financials) return DEMO_FINANCIALS;
    const realTotal =
      financials.totalRevenue + financials.inEscrowBalance + financials.transactionFees;
    return realTotal > 0
      ? {
          totalRevenue: financials.totalRevenue,
          inEscrowBalance: financials.inEscrowBalance,
          transactionFees: financials.transactionFees,
        }
      : DEMO_FINANCIALS;
  }, [financials]);

  const summaryIsDemo =
    !financials ||
    financialsError !== null ||
    financials.totalRevenue + financials.inEscrowBalance + financials.transactionFees === 0;

  // Denominator for the % chip on each card. Guard against 0 so we don't
  // divide by zero when the demo-fallback still hasn't kicked in.
  const summaryTotal =
    financialsForDisplay.totalRevenue +
    financialsForDisplay.inEscrowBalance +
    financialsForDisplay.transactionFees;
  const pct = (v: number) => (summaryTotal > 0 ? (v / summaryTotal) * 100 : 0);

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

        {/* Financial Summary — 3 stacked stat cards (replaces the donut) */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Financial Summary</h3>
            {summaryIsDemo && (
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

          <div className="flex flex-col gap-3">
            <SummaryCard
              icon={<Wallet size={18} className="text-brand-green" />}
              iconBg="bg-brand-green/10"
              label="Total Revenue"
              value={financialsForDisplay.totalRevenue}
              currencyCode={financials?.currency}
              percentOfTotal={pct(financialsForDisplay.totalRevenue)}
              isLoading={financialsLoading}
            />
            <SummaryCard
              icon={<Lock size={18} className="text-white" />}
              iconBg="bg-[#033604]"
              label="In Escrow Balance"
              value={financialsForDisplay.inEscrowBalance}
              currencyCode={financials?.currency}
              percentOfTotal={pct(financialsForDisplay.inEscrowBalance)}
              isLoading={financialsLoading}
            />
            <SummaryCard
              icon={<Receipt size={18} className="text-[#033604]" />}
              iconBg="bg-[#E4F5E4]"
              label="Transaction Fees"
              value={financialsForDisplay.transactionFees}
              currencyCode={financials?.currency}
              percentOfTotal={pct(financialsForDisplay.transactionFees)}
              isLoading={financialsLoading}
            />
          </div>

          {/* Total footer — small, muted, full precision */}
          {!financialsLoading && (
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
              <span className="font-medium text-gray-500">Total value</span>
              <span className="font-semibold text-gray-900 tabular-nums">
                {formatCurrencyFull(summaryTotal, financials?.currency)}
              </span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;
