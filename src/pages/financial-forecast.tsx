import { useMemo } from 'react';
import type { FC } from 'react';
import { TrendingUp, CalendarDays, Sprout, AlertTriangle } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';
import SeasonalDemandChart from '@/components/charts/SeasonalDemandChart';
import {
  useFinancialForecast,
  useSeasonalDemand,
} from '@/hooks/useAnalytics';

/**
 * Currency prefix lookup — mirrors the BI Overview page so both surfaces
 * render ₦/GH₵/$ consistently. Duplicated locally on purpose: each page
 * reads its own analytics response and doesn't need to share state.
 */
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

/**
 * Compact currency for stat cards. Values like ₦6,834.99 are tight in a
 * card header — we drop to k/M once over 10k so the digit string stays
 * scannable. Full precision lives in the tooltip (title attr).
 */
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

const FinancialForecastPage: FC = () => {
  const forecast = useFinancialForecast();
  const demand = useSeasonalDemand(12);

  // Chart expects `{ month, value }` with `month` as the short label
  // (JAN, FEB, ...). The API returns `shortLabel` separately — rename inline.
  const chartData = useMemo(
    () => (demand.data ?? []).map((p) => ({ month: p.shortLabel, value: p.value })),
    [demand.data],
  );

  // Demo fallback: empty dataset OR API error → pass nothing and let the
  // chart fall back to its built-in demo rows with a "demo" chip.
  const chartHasRealData = chartData.some((p) => p.value > 0);
  const chartIsDemo = Boolean(demand.error) || !chartHasRealData;

  const forecastError = Boolean(forecast.error);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-green">
            Financial Forecasting
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Predict demand patterns and revenue optimization opportunities
          </p>
        </div>
        {forecastError && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
            <AlertTriangle size={12} />
            Offline
          </span>
        )}
      </div>

      {/* Stat Cards Row */}
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<TrendingUp size={20} className="text-white" />}
          value={
            forecast.isLoading
              ? '…'
              : formatCurrencyCompact(
                  forecast.data?.monthlyForecastedRevenue ?? 0,
                  forecast.data?.currency,
                )
          }
          label="Monthly Forecasted Revenue"
          change={forecast.isLoading ? '' : 'Projection'}
          trend="up"
        />
        <StatCard
          icon={<CalendarDays size={20} className="text-white" />}
          value={forecast.isLoading ? '…' : forecast.data?.seasonalPeak.label ?? 'Q?'}
          label="Seasonal Peak"
          change={forecast.isLoading ? '' : forecast.data?.seasonalPeak.demand ?? '—'}
          trend="up"
        />
        <StatCard
          icon={<Sprout size={20} className="text-white" />}
          value={
            forecast.isLoading
              ? '…'
              : formatCurrencyCompact(
                  forecast.data?.projectedEscrowGrowth ?? 0,
                  forecast.data?.currency,
                )
          }
          label="Projected Escrow Growth"
          change={forecast.isLoading ? '' : 'Next month'}
          trend="up"
        />
      </div>

      {/* Seasonal Demand Chart */}
      <SeasonalDemandChart
        data={chartData}
        isLoading={demand.isLoading}
        isDemo={chartIsDemo}
        tooltipLabel="Escrow txns"
      />
    </div>
  );
};

export default FinancialForecastPage;
