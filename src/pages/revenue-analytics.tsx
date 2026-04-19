import { useMemo } from 'react';
import type { FC } from 'react';
import { DollarSign, Users, TriangleAlert, AlertTriangle } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';
import RevenueChart from '@/components/charts/RevenueChart';
import { useRevenueEfficiency, useRevenueTrend } from '@/hooks/useAnalytics';

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
  return `${sign}${prefix}${abs.toFixed(2)}`;
};

const shortMonth = (ym: string): string => {
  const [, m] = ym.split('-');
  const idx = Math.max(0, Math.min(11, Number(m) - 1));
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][idx];
};

interface Strategy {
  title: string;
  description: string;
  potential: string;
}

const strategies: Strategy[] = [
  {
    title: 'Dynamic Base Fare',
    description: 'Implement time-based escrow charges adjustments',
    potential: 'Potential: +$32K/month',
  },
  {
    title: 'Distance Tier Optimization',
    description: 'Adjust pricing for 10k+ transactions',
    potential: 'Potential: +28K/month',
  },
  {
    title: 'Wallet Incentive Program',
    description: 'Encourage higher wallet balances',
    potential: 'Potential: 45K/month',
  },
];

const RevenueAnalyticsPage: FC = () => {
  const efficiency = useRevenueEfficiency();
  const trend = useRevenueTrend(6);

  const trendChartData = useMemo(
    () =>
      (trend.data ?? []).map((p) => ({
        month: shortMonth(p.month),
        Revenue: p.revenue,
        Forecast: p.forecast,
      })),
    [trend.data],
  );

  const trendHasRealData = trendChartData.some((p) => p.Revenue > 0 || p.Forecast > 0);
  const trendIsDemo = Boolean(trend.error) || !trendHasRealData;

  const offline = Boolean(efficiency.error);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-green">
            Enhanced Revenue Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Deep dive into revenue metrics and optimization strategies
          </p>
        </div>
        {offline && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
            <AlertTriangle size={12} />
            Offline
          </span>
        )}
      </div>

      {/* Top Row — 3 Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<DollarSign size={20} className="text-white" />}
          value={
            efficiency.isLoading
              ? '…'
              : formatCurrencyCompact(
                  efficiency.data?.revenuePerTransaction ?? 0,
                  efficiency.data?.currency,
                )
          }
          label="Revenue/Transaction"
          change={efficiency.isLoading ? '' : 'Last 30d'}
          trend="up"
        />
        <StatCard
          icon={<Users size={20} className="text-white" />}
          value={
            efficiency.isLoading
              ? '…'
              : `${(efficiency.data?.serviceAvailabilityPct ?? 0).toFixed(1)}%`
          }
          label="Service Availability"
          change={efficiency.isLoading ? '' : 'Last 30d'}
          trend="up"
        />
        <StatCard
          icon={<TriangleAlert size={20} className="text-white" />}
          value={
            efficiency.isLoading
              ? '…'
              : `${(efficiency.data?.pricingEfficiencyPct ?? 0).toFixed(1)}%`
          }
          label="Pricing Efficiency"
          change={efficiency.isLoading ? '' : 'Last 30d'}
          trend="up"
        />
      </div>

      {/* Bottom Row — Revenue Trend + Strategies */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <RevenueChart
          data={trendChartData}
          isLoading={trend.isLoading}
          isDemo={trendIsDemo}
        />

        {/* Optimal Pricing Strategies */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900">
            Optimal Pricing Strategies
          </h3>
          <div className="space-y-4">
            {strategies.map((s) => (
              <div
                key={s.title}
                className="rounded-xl bg-brand-green/10 p-4"
              >
                <h4 className="text-sm font-bold text-brand-green">
                  {s.title}
                </h4>
                <p className="mt-1 text-xs text-gray-600">{s.description}</p>
                <p className="mt-1 text-xs text-gray-500">{s.potential}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueAnalyticsPage;
