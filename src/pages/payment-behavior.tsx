import { useMemo } from 'react';
import type { FC } from 'react';
import { DollarSign, Activity, ArrowLeftRight, AlertTriangle } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';
import TopUpFrequencyChart from '@/components/charts/TopUpFrequencyChart';
import WalletBalanceTrendChart from '@/components/charts/WalletBalanceTrendChart';
import { usePaymentBehavior, useWalletBalanceTrend } from '@/hooks/useAnalytics';

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

interface PromoRecommendation {
  title: string;
  description: string;
  impact: string;
}

const recommendations: PromoRecommendation[] = [
  {
    title: 'Weekend Boost',
    description: '15% bonus on top-ups over 500 during weekends',
    impact: 'Est. Impact: +$18K revenue',
  },
  {
    title: 'Loyalty Rewards',
    description: '5% cashback for users with 10+ trips/month',
    impact: 'Est. Impact: +22% retention',
  },
  {
    title: 'Referals',
    description: '10% off rides between 10AM-4PM weekdays',
    impact: 'Est. Impact: +35% off-peak usage',
  },
];

const PaymentBehaviorPage: FC = () => {
  const behavior = usePaymentBehavior();
  const balance = useWalletBalanceTrend(7);

  const prefix = currencyPrefix(behavior.data?.currency);

  // Tier bar chart — use the currency prefix so labels read like "₦500"
  // instead of always "¢500". Empty-tier rows stay in so the bar alignment
  // is stable across polls.
  const tierChartData = useMemo(
    () =>
      (behavior.data?.topupByTier ?? []).map((t) => ({
        amount: `${prefix}${t.tier}`,
        value: t.count,
      })),
    [behavior.data?.topupByTier, prefix],
  );

  const tierHasRealData = tierChartData.some((p) => p.value > 0);
  const tierIsDemo = Boolean(behavior.error) || !tierHasRealData;

  // Balance chart — rename dayLabel → day to match the chart's prop shape.
  const balanceChartData = useMemo(
    () =>
      (balance.data ?? []).map((p) => ({
        day: p.dayLabel.trim().toUpperCase(),
        value: p.avgBalance,
      })),
    [balance.data],
  );

  const balanceHasRealData = balanceChartData.some((p) => p.value > 0);
  const balanceIsDemo = Boolean(balance.error) || !balanceHasRealData;

  // Week-over-week delta for the header tile: first vs last non-zero point.
  const balanceDelta = useMemo(() => {
    const vals = balanceChartData.map((p) => p.value);
    if (vals.length < 2) return 0;
    const first = vals[0];
    const last = vals[vals.length - 1];
    if (first === 0) return last === 0 ? 0 : 100;
    return ((last - first) / first) * 100;
  }, [balanceChartData]);

  const offline = Boolean(behavior.error);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-green">
            Payment Behavior Analysis
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Understanding customer payment patterns and optimization strategies
          </p>
        </div>
        {offline && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
            <AlertTriangle size={12} />
            Offline
          </span>
        )}
      </div>

      {/* Stat Cards Row */}
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<DollarSign size={20} className="text-white" />}
          value={
            behavior.isLoading
              ? '…'
              : formatCurrencyCompact(
                  behavior.data?.avgTopupAmount ?? 0,
                  behavior.data?.currency,
                )
          }
          label="Avg Top-Up Amount"
          change={behavior.isLoading ? '' : 'All time'}
          trend="up"
        />
        <StatCard
          icon={<Activity size={20} className="text-white" />}
          value={
            behavior.isLoading ? '…' : `${behavior.data?.topupPerHour ?? 0}/hour`
          }
          label="Top-Up Frequency"
          change={behavior.isLoading ? '' : 'Last hour'}
          trend="up"
        />
        <StatCard
          icon={<ArrowLeftRight size={20} className="text-white" />}
          value={
            behavior.isLoading
              ? '…'
              : `${(behavior.data?.promoRedemptionPct ?? 0).toFixed(1)}%`
          }
          label="Promo Redemption"
          change={behavior.isLoading ? '' : 'Pending'}
          trend="up"
        />
      </div>

      {/* Charts Row */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <TopUpFrequencyChart
          data={tierChartData}
          isLoading={behavior.isLoading}
          isDemo={tierIsDemo}
        />
        <WalletBalanceTrendChart
          data={balanceChartData}
          isLoading={balance.isLoading}
          isDemo={balanceIsDemo}
          deltaPct={balanceDelta}
        />
      </div>

      {/* Promotional Strategy Recommendations */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900">
          Promotional Strategy Recommendations
        </h3>
        <div className="space-y-3">
          {recommendations.map((rec) => (
            <div
              key={rec.title}
              className="rounded-xl bg-brand-green/10 px-5 py-4"
            >
              <p className="text-sm font-bold text-gray-900">{rec.title}</p>
              <p className="mt-1 text-sm text-gray-600">{rec.description}</p>
              <p className="mt-1 text-sm text-gray-500">{rec.impact}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentBehaviorPage;
