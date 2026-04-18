import type { FC } from 'react';
import { CircleDot, DollarSign, Activity, Zap } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';
import RevenueChart from '@/components/charts/RevenueChart';

interface InsightRow {
  label: string;
  value: string;
}

const walletInsights: InsightRow[] = [
  { label: 'Daily Transactions', value: '1,850' },
  { label: 'Avg Transaction Value', value: '¢24.35' },
  { label: 'Failed Transactions', value: '1.2%' },
  { label: 'Refund Rate', value: '0.8%' },
];

const IntegrationInsightsPage: FC = () => {
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

      {/* Top Row — 3 Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<CircleDot size={20} className="text-white" />}
          value="¢300.7"
          label="Avg Transaction Value"
          change="+0.5%"
          trend="up"
        />
        <StatCard
          icon={<DollarSign size={20} className="text-white" />}
          value="%1.85"
          label="Failed Transactions"
          change="+2.1%"
          trend="up"
        />
        <StatCard
          icon={<Activity size={20} className="text-white" />}
          value="87.2%"
          label="Refund Rate"
          change="+3.8%"
          trend="up"
        />
      </div>

      {/* Bottom Row — Stat Card + Optimization Score | Wallet Insights */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Left Column — Transaction Vol Card + Optimization Score */}
        <div className="space-y-5 lg:col-span-2">
          <StatCard
            icon={<Zap size={20} className="text-white" />}
            value="45.2K"
            label="Transaction Vol"
            change="+9.4%"
            trend="up"
          />

          <RevenueChart />
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
