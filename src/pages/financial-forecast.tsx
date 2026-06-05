import type { FC } from 'react';
import { TrendingUp, CalendarDays, AlertTriangle } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';
import SeasonalDemandChart from '@/components/charts/SeasonalDemandChart';
import { useFinancialForecast, useSeasonalDemand } from '@/hooks/useAnalytics';
import { formatCurrency } from '@/lib/format-currency';

const CURRENCY = 'GHS';

const FinancialForecastPage: FC = () => {
  const forecastQuery = useFinancialForecast(CURRENCY);
  const seasonalQuery = useSeasonalDemand(CURRENCY, 12);

  const forecast = forecastQuery.data;
  const growth = forecast?.projectedEscrowGrowth ?? 0;
  const growthIsPositive = growth >= 0;

  const hasError = forecastQuery.isError || seasonalQuery.isError;

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

      {hasError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load forecast data. Showing what's available.
        </div>
      )}

      {/* Stat Cards Row */}
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<TrendingUp size={20} className="text-white" />}
          value={
            forecastQuery.isLoading
              ? '—'
              : formatCurrency(forecast?.monthlyForecastedRevenue ?? 0, forecast?.currency ?? CURRENCY)
          }
          label="Monthly Forecasted Revenue"
          change="Next month"
          trend="neutral"
        />
        <StatCard
          icon={<CalendarDays size={20} className="text-white" />}
          value={forecastQuery.isLoading ? '—' : forecast?.seasonalPeak.label ?? 'N/A'}
          label="Seasonal Peak"
          change={forecast?.seasonalPeak.demand ?? ''}
          trend={forecast?.seasonalPeak.demand === 'High Demand' ? 'up' : 'neutral'}
        />
        <StatCard
          icon={<AlertTriangle size={20} className="text-white" />}
          value={
            forecastQuery.isLoading
              ? '—'
              : formatCurrency(growth, forecast?.currency ?? CURRENCY)
          }
          label="Projected Escrow Growth"
          change={`${growthIsPositive ? '+' : ''}${formatCurrency(growth, forecast?.currency ?? CURRENCY)}/mo`}
          trend={growthIsPositive ? 'up' : 'down'}
        />
      </div>

      {/* Seasonal Demand Chart */}
      <SeasonalDemandChart data={seasonalQuery.data} loading={seasonalQuery.isLoading} />
    </div>
  );
};

export default FinancialForecastPage;
