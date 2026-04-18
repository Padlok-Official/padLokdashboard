import type { FC } from 'react';
import { TrendingUp, CalendarDays, AlertTriangle } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';
import SeasonalDemandChart from '@/components/charts/SeasonalDemandChart';

const FinancialForecastPage: FC = () => {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-green">
          Financial Forecasting
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Predict demand patterns and revenue optimization opportunities
        </p>
      </div>

      {/* Stat Cards Row */}
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<TrendingUp size={20} className="text-white" />}
          value="¢489.2k"
          label="Monthly Forecasted Revenue"
          change="+ 6.1%"
          trend="up"
        />
        <StatCard
          icon={<CalendarDays size={20} className="text-white" />}
          value="Q4 2025"
          label="Seasonal Peak"
          change="High Demand"
          trend="up"
        />
        <StatCard
          icon={<AlertTriangle size={20} className="text-white" />}
          value="¢32.5k"
          label="Projected Escrow Growth"
          change="+3.2%"
          trend="up"
        />
      </div>

      {/* Seasonal Demand Chart */}
      <SeasonalDemandChart />
    </div>
  );
};

export default FinancialForecastPage;
