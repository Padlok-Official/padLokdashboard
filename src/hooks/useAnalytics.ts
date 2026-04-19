/**
 * useAnalytics hooks — fetch dashboard metrics via react-query.
 *
 * Polling-based "real-time": the queries refetch on an interval so the
 * UI stays fresh. When the tab is backgrounded react-query pauses the
 * interval automatically.
 */

import { useQuery } from '@tanstack/react-query';
import analyticsService from '@/services/analytics-service';
import type {
  PlatformActivity,
  FinancialSummary,
  FinancialForecast,
  SeasonalDemandPoint,
} from '@/services/analytics-service';

const PLATFORM_ACTIVITY_KEY = ['analytics', 'platform-activity'] as const;
const FINANCIAL_SUMMARY_KEY = (currency: string) =>
  ['analytics', 'financial-summary', currency] as const;
const FINANCIAL_FORECAST_KEY = (currency: string) =>
  ['analytics', 'financial-forecast', currency] as const;
const SEASONAL_DEMAND_KEY = (months: number, currency: string) =>
  ['analytics', 'seasonal-demand', months, currency] as const;

/**
 * Live platform activity counts for the BI Overview histogram.
 * Polls every 5 seconds by default.
 */
export const usePlatformActivity = (options?: { refetchIntervalMs?: number }) => {
  const refetchInterval = options?.refetchIntervalMs ?? 5_000;

  return useQuery<PlatformActivity>({
    queryKey: PLATFORM_ACTIVITY_KEY,
    queryFn: async () => {
      const res = await analyticsService.platformActivity();
      if (!res.success || !res.data) {
        throw new Error(res.message ?? 'Failed to load platform activity');
      }
      return res.data;
    },
    refetchInterval,
    refetchIntervalInBackground: false, // pause polling when tab is hidden
    staleTime: 2_000, // tiny stale window avoids duplicate fetches on nav
  });
};

/**
 * Financial summary for the BI Overview donut. Doesn't need sub-5s polling
 * since these totals don't change second-by-second — 30s is plenty, and it
 * keeps the Supabase free tier happy.
 */
export const useFinancialSummary = (
  currency = 'NGN',
  options?: { refetchIntervalMs?: number },
) => {
  const refetchInterval = options?.refetchIntervalMs ?? 30_000;

  return useQuery<FinancialSummary>({
    queryKey: FINANCIAL_SUMMARY_KEY(currency),
    queryFn: async () => {
      const res = await analyticsService.financialSummary(currency);
      if (!res.success || !res.data) {
        throw new Error(res.message ?? 'Failed to load financial summary');
      }
      return res.data;
    },
    refetchInterval,
    refetchIntervalInBackground: false,
    staleTime: 10_000,
  });
};

/**
 * Forecast card block. Values are derived from a trailing window of the
 * `transactions` table and don't change often — a 60-second poll is plenty.
 */
export const useFinancialForecast = (currency = 'NGN') =>
  useQuery<FinancialForecast>({
    queryKey: FINANCIAL_FORECAST_KEY(currency),
    queryFn: async () => {
      const res = await analyticsService.financialForecast(currency);
      if (!res.success || !res.data) {
        throw new Error(res.message ?? 'Failed to load forecast');
      }
      return res.data;
    },
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
  });

/**
 * Seasonal demand for the area chart. Monthly buckets — effectively
 * static during a session, so 5 minutes is fine.
 */
export const useSeasonalDemand = (months = 12, currency = 'NGN') =>
  useQuery<SeasonalDemandPoint[]>({
    queryKey: SEASONAL_DEMAND_KEY(months, currency),
    queryFn: async () => {
      const res = await analyticsService.seasonalDemand(months, currency);
      if (!res.success || !res.data) {
        throw new Error(res.message ?? 'Failed to load seasonal demand');
      }
      return res.data;
    },
    refetchInterval: 5 * 60_000,
    refetchIntervalInBackground: false,
    staleTime: 60_000,
  });
