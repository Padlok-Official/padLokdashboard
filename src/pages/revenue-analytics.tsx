import type { FC } from 'react';
import { DollarSign, Users, TriangleAlert } from 'lucide-react';
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

const walletData = [
  { day: 'Mon', value: 10 },
  { day: 'Tue', value: 25 },
  { day: 'Wed', value: 55 },
  { day: 'Thu', value: 40 },
  { day: 'Fri', value: 45 },
  { day: 'Sat', value: 50 },
  { day: 'Sun', value: 80 },
];

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

      {/* Top Row — 3 Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<DollarSign size={20} className="text-white" />}
          value="¢1.92/km"
          label="Revenue/Transaction"
          change="+3.5%"
          trend="up"
        />
        <StatCard
          icon={<Users size={20} className="text-white" />}
          value="99.2%"
          label="Service Availability"
          change="+0.8%"
          trend="up"
        />
        <StatCard
          icon={<TriangleAlert size={20} className="text-white" />}
          value="94.5%"
          label="Pricing Efficiency"
          change="+ 12%"
          trend="up"
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
                />
                <Tooltip
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
