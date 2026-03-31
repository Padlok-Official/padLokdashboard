import type { FC } from 'react';
import { DollarSign, Users, AlertTriangle } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';
import RevenueChart from '@/components/charts/RevenueChart';

const DashboardPage: FC = () => {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-green">Business Intelligence Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Real-time insights into your escrow platform performance
        </p>
      </div>

      {/* Top Row — 3 Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<DollarSign size={20} className="text-white" />}
          value="¢389.2k"
          label="Total Revenue"
          change="+ 12%"
          trend="up"
        />
        <StatCard
          icon={<Users size={20} className="text-white" />}
          value="28,450"
          label="Active Users"
          change="+ 8.3%"
          trend="up"
        />
        <StatCard
          icon={<DollarSign size={20} className="text-white" />}
          value="¢142.50"
          label="In Escrow Balance"
          change="+ 12%"
          trend="up"
        />
      </div>

      {/* Bottom Row — 3 Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<AlertTriangle size={20} className="text-white" />}
          value="9,070"
          label="Disputes"
          change="+ 12%"
          trend="down"
        />
        <StatCard
          icon={<AlertTriangle size={20} className="text-white" />}
          value="10,070"
          label="Completed Transactions"
          change="+ 12%"
          trend="down"
        />
        <StatCard
          icon={<AlertTriangle size={20} className="text-white" />}
          value="12,070"
          label="Current Ongoing Transactions"
          change="+ 12%"
          trend="down"
        />
      </div>

      {/* Bottom Section — Chart + Fee Card */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RevenueChart />
        </div>
        <div className="lg:col-span-2">
          <StatCard
            icon={<DollarSign size={20} className="text-white" />}
            value="¢2.2k"
            label="Total Transaction fees"
            change="+ 12%"
            trend="up"
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
