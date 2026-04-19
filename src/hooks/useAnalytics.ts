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
} from '@/services/analytics-service';

const PLATFORM_ACTIVITY_KEY = ['analytics', 'platform-activity'] as const;
const FINANCIAL_SUMMARY_KEY = (currency: string) =>
  ['analytics', 'financial-summary', currency] as const;

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
