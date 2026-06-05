import type { FC } from 'react';
import { DollarSign, Activity, ArrowLeftRight } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';
import TopUpFrequencyChart from '@/components/charts/TopUpFrequencyChart';
import WalletBalanceTrendChart from '@/components/charts/WalletBalanceTrendChart';
import { usePaymentBehavior, useWalletBalanceTrend } from '@/hooks/useAnalytics';
import { formatCurrency } from '@/lib/format-currency';

const CURRENCY = 'GHS';

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
  const behaviorQuery = usePaymentBehavior(CURRENCY);
  const balanceTrendQuery = useWalletBalanceTrend(CURRENCY, 7);

  const behavior = behaviorQuery.data;
  const hasError = behaviorQuery.isError || balanceTrendQuery.isError;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-green">
          Payment Behavior Analysis
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Understanding customer payment patterns and optimization strategies
        </p>
      </div>

      {hasError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load payment behavior data. Showing what's available.
        </div>
      )}

      {/* Stat Cards Row */}
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<DollarSign size={20} className="text-white" />}
          value={
            behaviorQuery.isLoading
              ? '—'
              : formatCurrency(behavior?.avgTopupAmount ?? 0, behavior?.currency ?? CURRENCY)
          }
          label="Avg Top-Up Amount"
          change="Completed top-ups"
          trend="neutral"
        />
        <StatCard
          icon={<Activity size={20} className="text-white" />}
          value={behaviorQuery.isLoading ? '—' : `${behavior?.topupPerHour ?? 0}/hour`}
          label="Top-Up Frequency"
          change="Last hour"
          trend="neutral"
        />
        <StatCard
          icon={<ArrowLeftRight size={20} className="text-white" />}
          value={behaviorQuery.isLoading ? '—' : `${(behavior?.promoRedemptionPct ?? 0).toFixed(1)}%`}
          label="Promo Redemption"
          change="Not yet tracked"
          trend="neutral"
        />
      </div>

      {/* Charts Row */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <TopUpFrequencyChart data={behavior?.topupByTier} loading={behaviorQuery.isLoading} />
        <WalletBalanceTrendChart data={balanceTrendQuery.data} loading={balanceTrendQuery.isLoading} />
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
