import type { FC } from 'react';
import { DollarSign, Activity, ArrowLeftRight } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';
import TopUpFrequencyChart from '@/components/charts/TopUpFrequencyChart';
import WalletBalanceTrendChart from '@/components/charts/WalletBalanceTrendChart';

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

      {/* Stat Cards Row */}
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<DollarSign size={20} className="text-white" />}
          value="¢52.30"
          label="Avg Top-Up Amount"
          change="+4.8%"
          trend="up"
        />
        <StatCard
          icon={<Activity size={20} className="text-white" />}
          value="2.3/hour"
          label="Top-Up Frequency"
          change="+11.2%"
          trend="up"
        />
        <StatCard
          icon={<ArrowLeftRight size={20} className="text-white" />}
          value="34.5%"
          label="Promo Redemption"
          change="+6.7%"
          trend="up"
        />
      </div>

      {/* Charts Row */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <TopUpFrequencyChart />
        <WalletBalanceTrendChart />
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
