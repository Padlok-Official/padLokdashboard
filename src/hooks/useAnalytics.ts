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
  TransactionInsights,
  RevenueTrendPoint,
  PaymentBehavior,
  WalletBalanceTrendPoint,
  RevenueEfficiency,
} from '@/services/analytics-service';

const PLATFORM_ACTIVITY_KEY = ['analytics', 'platform-activity'] as const;
const FINANCIAL_SUMMARY_KEY = (currency: string) =>
  ['analytics', 'financial-summary', currency] as const;
const FINANCIAL_FORECAST_KEY = (currency: string) =>
  ['analytics', 'financial-forecast', currency] as const;
const SEASONAL_DEMAND_KEY = (months: number, currency: string) =>
  ['analytics', 'seasonal-demand', months, currency] as const;
const TRANSACTION_INSIGHTS_KEY = (currency: string) =>
  ['analytics', 'transaction-insights', currency] as const;
const REVENUE_TREND_KEY = (months: number, currency: string) =>
  ['analytics', 'revenue-trend', months, currency] as const;
const PAYMENT_BEHAVIOR_KEY = (currency: string) =>
  ['analytics', 'payment-behavior', currency] as const;
const WALLET_BALANCE_TREND_KEY = (days: number, currency: string) =>
  ['analytics', 'wallet-balance-trend', days, currency] as const;
const REVENUE_EFFICIENCY_KEY = (currency: string) =>
  ['analytics', 'revenue-efficiency', currency] as const;

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

/**
 * Transaction insights for the Integration Insights page.
 * Aggregate counts — 60s poll is plenty.
 */
export const useTransactionInsights = (currency = 'NGN') =>
  useQuery<TransactionInsights>({
    queryKey: TRANSACTION_INSIGHTS_KEY(currency),
    queryFn: async () => {
      const res = await analyticsService.transactionInsights(currency);
      if (!res.success || !res.data) {
        throw new Error(res.message ?? 'Failed to load transaction insights');
      }
      return res.data;
    },
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
  });

/**
 * Revenue vs forecast line chart. Monthly buckets — 5 min poll.
 */
export const useRevenueTrend = (months = 6, currency = 'NGN') =>
  useQuery<RevenueTrendPoint[]>({
    queryKey: REVENUE_TREND_KEY(months, currency),
    queryFn: async () => {
      const res = await analyticsService.revenueTrend(months, currency);
      if (!res.success || !res.data) {
        throw new Error(res.message ?? 'Failed to load revenue trend');
      }
      return res.data;
    },
    refetchInterval: 5 * 60_000,
    refetchIntervalInBackground: false,
    staleTime: 60_000,
  });

/**
 * Payment behavior (avg top-up, hourly cadence, tier bar chart).
 */
export const usePaymentBehavior = (currency = 'NGN') =>
  useQuery<PaymentBehavior>({
    queryKey: PAYMENT_BEHAVIOR_KEY(currency),
    queryFn: async () => {
      const res = await analyticsService.paymentBehavior(currency);
      if (!res.success || !res.data) {
        throw new Error(res.message ?? 'Failed to load payment behavior');
      }
      return res.data;
    },
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
  });

/**
 * Per-day average wallet balance. Daily buckets — 5 min poll.
 */
export const useWalletBalanceTrend = (days = 7, currency = 'NGN') =>
  useQuery<WalletBalanceTrendPoint[]>({
    queryKey: WALLET_BALANCE_TREND_KEY(days, currency),
    queryFn: async () => {
      const res = await analyticsService.walletBalanceTrend(days, currency);
      if (!res.success || !res.data) {
        throw new Error(res.message ?? 'Failed to load wallet balance trend');
      }
      return res.data;
    },
    refetchInterval: 5 * 60_000,
    refetchIntervalInBackground: false,
    staleTime: 60_000,
  });

/**
 * Revenue efficiency tile values for the Revenue Analytics page.
 */
export const useRevenueEfficiency = (currency = 'NGN') =>
  useQuery<RevenueEfficiency>({
    queryKey: REVENUE_EFFICIENCY_KEY(currency),
    queryFn: async () => {
      const res = await analyticsService.revenueEfficiency(currency);
      if (!res.success || !res.data) {
        throw new Error(res.message ?? 'Failed to load revenue efficiency');
      }
      return res.data;
    },
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
  });
