import type { FC } from 'react';
import { DollarSign, Users, TriangleAlert, Loader2 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import StatCard from '@/components/shared/StatCard';
import { useRevenueEfficiency, useWalletLoadingPatterns } from '@/hooks/useAnalytics';
import { formatCurrency } from '@/lib/format-currency';

const CURRENCY = 'GHS';

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
  const efficiencyQuery = useRevenueEfficiency(CURRENCY);
  const loadingQuery = useWalletLoadingPatterns(CURRENCY, 7);

  const efficiency = efficiencyQuery.data;
  const loading = efficiencyQuery.isLoading;
  const cur = efficiency?.currency ?? CURRENCY;
  const hasError = efficiencyQuery.isError || loadingQuery.isError;

  const walletData = (loadingQuery.data ?? []).map((d) => ({
    day: d.day_label,
    value: Number(d.amount) || 0,
  }));
  const hasWalletData = walletData.some((d) => d.value > 0);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-green">
          Enhanced Revenue Analytics
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Deep dive into revenue metrics and optimization strategies
        </p>
      </div>

      {hasError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load revenue analytics data. Showing what's available.
        </div>
      )}

      {/* Top Row — 3 Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<DollarSign size={20} className="text-white" />}
          value={loading ? '—' : `${formatCurrency(efficiency?.revenuePerTransaction ?? 0, cur)}/txn`}
          label="Revenue/Transaction"
          change="Last 30 days"
          trend="neutral"
        />
        <StatCard
          icon={<Users size={20} className="text-white" />}
          value={loading ? '—' : `${(efficiency?.serviceAvailabilityPct ?? 0).toFixed(1)}%`}
          label="Service Availability"
          change="Completed rate"
          trend="neutral"
        />
        <StatCard
          icon={<TriangleAlert size={20} className="text-white" />}
          value={loading ? '—' : `${(efficiency?.pricingEfficiencyPct ?? 0).toFixed(1)}%`}
          label="Pricing Efficiency"
          change="Last 30 days"
          trend="neutral"
        />
      </div>

      {/* Bottom Row — Chart + Strategies */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Wallet Loading Patterns Chart */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="mb-6 text-lg font-bold text-gray-900">
            Wallet Loading Patterns
          </h3>
          <div className="h-64">
            {loadingQuery.isLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
              </div>
            ) : !hasWalletData ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                No wallet loading data available yet.
              </div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={walletData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : `${v}`)}
                />
                <Tooltip
                  formatter={(v: number) => [formatCurrency(v, cur), 'Loaded']}
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2DB52D"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>

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
