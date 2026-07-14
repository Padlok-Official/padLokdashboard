import type { FC } from 'react';
import { CircleDot, DollarSign, Activity, Zap } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';
import RevenueChart from '@/components/charts/RevenueChart';
import {
  useTransactionInsights,
  useRevenueTrend,
  useRefundRate,
} from '@/hooks/useAnalytics';
import { formatCurrency } from '@/lib/format-currency';

const CURRENCY = 'GHS';

// Compact volume label, e.g. 45200 -> "45.2K".
const formatCompact = (n: number): string =>
  new Intl.NumberFormat('en-GH', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

const IntegrationInsightsPage: FC = () => {
  const insightsQuery = useTransactionInsights(CURRENCY);
  const revenueQuery = useRevenueTrend(CURRENCY, 6);
  const refundQuery = useRefundRate(CURRENCY);

  const insights = insightsQuery.data;
  const refund = refundQuery.data;
  const loading = insightsQuery.isLoading;
  const hasError = insightsQuery.isError || revenueQuery.isError;
  const cur = insights?.currency ?? CURRENCY;

  const walletInsights = [
    {
      label: 'Daily Transactions',
      value: loading ? '—' : (insights?.dailyTransactions ?? 0).toLocaleString(),
    },
    {
      label: 'Avg Transaction Value',
      value: loading ? '—' : formatCurrency(insights?.avgTransactionValue ?? 0, cur),
    },
    {
      label: 'Failed Transactions',
      value: loading ? '—' : `${(insights?.failedRatePct ?? 0).toFixed(1)}%`,
    },
    {
      label: 'Refund Rate (resolved disputes)',
      value: refundQuery.isLoading ? '—' : `${(refund?.refundRatePct ?? 0).toFixed(1)}%`,
    },
    {
      label: 'Refunded to Buyers',
      value: refundQuery.isLoading ? '—' : formatCurrency(refund?.totalRefunded ?? 0, cur),
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-green">
          Integration Insights
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Comprehensive data analysis and pricing optimization
        </p>
      </div>

      {hasError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load integration insights data. Showing what's available.
        </div>
      )}

      {/* Top Row — 3 Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<CircleDot size={20} className="text-white" />}
          value={loading ? '—' : formatCurrency(insights?.avgTransactionValue ?? 0, cur)}
          label="Avg Transaction Value"
          change="Completed txns"
          trend="neutral"
        />
        <StatCard
          icon={<DollarSign size={20} className="text-white" />}
          value={loading ? '—' : `${(insights?.failedRatePct ?? 0).toFixed(1)}%`}
          label="Failed Transactions"
          change="Of all txns"
          trend="neutral"
        />
        <StatCard
          icon={<Activity size={20} className="text-white" />}
          value={refundQuery.isLoading ? '—' : `${(refund?.refundRatePct ?? 0).toFixed(1)}%`}
          label="Refund Rate"
          change={
            refund
              ? `${formatCurrency(refund.totalRefunded, cur)} to buyers · ${refund.resolvedDisputes} resolved`
              : 'Of resolved disputes'
          }
          trend="neutral"
        />
      </div>

      {/* Bottom Row — Stat Card + Optimization Score | Wallet Insights */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Left Column — Transaction Vol Card + Revenue Chart */}
        <div className="space-y-5 lg:col-span-2">
          <StatCard
            icon={<Zap size={20} className="text-white" />}
            value={loading ? '—' : formatCompact(insights?.transactionVolume ?? 0)}
            label="Transaction Vol"
            change="All currencies"
            trend="neutral"
          />

          <RevenueChart data={revenueQuery.data} loading={revenueQuery.isLoading} />
        </div>

        {/* Right Column — Wallet Transaction Insights */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-base font-bold text-gray-900">
              Wallet Transaction Insights
            </h3>
            <div className="divide-y divide-gray-100">
              {walletInsights.map((row) => (
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
