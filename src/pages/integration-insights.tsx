import { useMemo } from 'react';
import type { FC } from 'react';
import { CircleDot, DollarSign, Activity, Zap, AlertTriangle } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';
import RevenueChart from '@/components/charts/RevenueChart';
import { useTransactionInsights, useRevenueTrend } from '@/hooks/useAnalytics';

/** Mirrors financial-forecast.tsx — kept local so each page owns its formatting. */
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

const formatCurrencyCompact = (value: number, code: string | undefined): string => {
  const prefix = currencyPrefix(code);
  if (!Number.isFinite(value)) return `${prefix}0`;
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}${prefix}${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 10_000) return `${sign}${prefix}${(abs / 1_000).toFixed(0)}k`;
  if (abs >= 1_000) return `${sign}${prefix}${(abs / 1_000).toFixed(1)}k`;
  return `${sign}${prefix}${abs.toFixed(0)}`;
};

/** 45230 → "45.2K", 980 → "980". */
const formatCount = (value: number): string => {
  if (!Number.isFinite(value)) return '0';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
};

/** Convert YYYY-MM → short month label ("2026-04" → "Apr"). */
const shortMonth = (ym: string): string => {
  const [, m] = ym.split('-');
  const idx = Math.max(0, Math.min(11, Number(m) - 1));
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][idx];
};

const IntegrationInsightsPage: FC = () => {
  const insights = useTransactionInsights();
  const trend = useRevenueTrend(6);

  const revenueChartData = useMemo(
    () =>
      (trend.data ?? []).map((p) => ({
        month: shortMonth(p.month),
        Revenue: p.revenue,
        Forecast: p.forecast,
      })),
    [trend.data],
  );

  const trendHasRealData = revenueChartData.some((p) => p.Revenue > 0 || p.Forecast > 0);
  const trendIsDemo = Boolean(trend.error) || !trendHasRealData;

  const insightsError = Boolean(insights.error);

  const walletRows = [
    {
      label: 'Daily Transactions',
      value: insights.isLoading ? '…' : formatCount(insights.data?.dailyTransactions ?? 0),
    },
    {
      label: 'Avg Transaction Value',
      value: insights.isLoading
        ? '…'
        : formatCurrencyCompact(insights.data?.avgTransactionValue ?? 0, insights.data?.currency),
    },
    {
      label: 'Failed Transactions',
      value: insights.isLoading ? '…' : `${(insights.data?.failedRatePct ?? 0).toFixed(1)}%`,
    },
    {
      label: 'Refund Rate',
      value: insights.isLoading ? '…' : `${(insights.data?.refundRatePct ?? 0).toFixed(1)}%`,
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-green">
            Integration Insights
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive data analysis and pricing optimization
          </p>
        </div>
        {insightsError && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
            <AlertTriangle size={12} />
            Offline
          </span>
        )}
      </div>

      {/* Top Row — 3 Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<CircleDot size={20} className="text-white" />}
          value={
            insights.isLoading
              ? '…'
              : formatCurrencyCompact(
                  insights.data?.avgTransactionValue ?? 0,
                  insights.data?.currency,
                )
          }
          label="Avg Transaction Value"
          change={insights.isLoading ? '' : 'Last 24h'}
          trend="up"
        />
        <StatCard
          icon={<DollarSign size={20} className="text-white" />}
          value={
            insights.isLoading
              ? '…'
              : `${(insights.data?.failedRatePct ?? 0).toFixed(2)}%`
          }
          label="Failed Transactions"
          change={insights.isLoading ? '' : 'All time'}
          trend="up"
        />
        <StatCard
          icon={<Activity size={20} className="text-white" />}
          value={
            insights.isLoading
              ? '…'
              : `${(insights.data?.refundRatePct ?? 0).toFixed(2)}%`
          }
          label="Refund Rate"
          change={insights.isLoading ? '' : 'All time'}
          trend="up"
        />
      </div>

      {/* Bottom Row — Stat Card + Revenue Chart | Wallet Insights */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Left Column */}
        <div className="space-y-5 lg:col-span-2">
          <StatCard
            icon={<Zap size={20} className="text-white" />}
            value={
              insights.isLoading
                ? '…'
                : formatCount(insights.data?.transactionVolume ?? 0)
            }
            label="Transaction Vol"
            change={insights.isLoading ? '' : 'All time'}
            trend="up"
          />

          <RevenueChart
            data={revenueChartData}
            isLoading={trend.isLoading}
            isDemo={trendIsDemo}
          />
        </div>

        {/* Right Column — Wallet Transaction Insights */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-base font-bold text-gray-900">
              Wallet Transaction Insights
            </h3>
            <div className="divide-y divide-gray-100">
              {walletRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between py-4"
                >
                  <span className="text-sm text-gray-600">{row.label}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationInsightsPage;
