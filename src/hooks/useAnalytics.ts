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
  PaymentBehavior,
  WalletBalanceTrendPoint,
  TransactionInsights,
  RevenueTrendPoint,
  RevenueEfficiency,
  WalletLoadingPoint,
  CashFlow,
  TakeRate,
  CashFlowPoint,
  TransactionFees,
  RefundRate,
} from '@/services/analytics-service';

const PLATFORM_ACTIVITY_KEY = ['analytics', 'platform-activity'] as const;
const FINANCIAL_SUMMARY_KEY = (currency: string) =>
  ['analytics', 'financial-summary', currency] as const;
const FINANCIAL_FORECAST_KEY = (currency: string) =>
  ['analytics', 'financial-forecast', currency] as const;
const SEASONAL_DEMAND_KEY = (currency: string, months: number) =>
  ['analytics', 'seasonal-demand', currency, months] as const;
const PAYMENT_BEHAVIOR_KEY = (currency: string) =>
  ['analytics', 'payment-behavior', currency] as const;
const WALLET_BALANCE_TREND_KEY = (currency: string, days: number) =>
  ['analytics', 'wallet-balance-trend', currency, days] as const;
const REFUND_RATE_KEY = (currency: string) =>
  ['analytics', 'refund-rate', currency] as const;
const TRANSACTION_INSIGHTS_KEY = (currency: string) =>
  ['analytics', 'transaction-insights', currency] as const;
const REVENUE_TREND_KEY = (currency: string, months: number) =>
  ['analytics', 'revenue-trend', currency, months] as const;
const REVENUE_EFFICIENCY_KEY = (currency: string) =>
  ['analytics', 'revenue-efficiency', currency] as const;
const WALLET_LOADING_PATTERNS_KEY = (currency: string, days: number) =>
  ['analytics', 'wallet-loading-patterns', currency, days] as const;
const CASH_FLOW_KEY = (currency: string) => ['analytics', 'cash-flow', currency] as const;
const TAKE_RATE_KEY = (currency: string) => ['analytics', 'take-rate', currency] as const;
const CASH_FLOW_SERIES_KEY = (currency: string, days: number) =>
  ['analytics', 'cash-flow-series', currency, days] as const;
const TRANSACTION_FEES_KEY = (currency: string) =>
  ['analytics', 'transaction-fees', currency] as const;

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
  currency = 'GHS',
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
 * Forecast stat cards for the Financial Forecasting page. These are derived
 * from trailing trends and barely move minute-to-minute, so refresh slowly.
 */
export const useFinancialForecast = (
  currency = 'GHS',
  options?: { refetchIntervalMs?: number },
) => {
  const refetchInterval = options?.refetchIntervalMs ?? 60_000;

  return useQuery<FinancialForecast>({
    queryKey: FINANCIAL_FORECAST_KEY(currency),
    queryFn: async () => {
      const res = await analyticsService.financialForecast(currency);
      if (!res.success || !res.data) {
        throw new Error(res.message ?? 'Failed to load financial forecast');
      }
      return res.data;
    },
    refetchInterval,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
  });
};

/**
 * Seasonal demand area chart for the Financial Forecasting page (trailing
 * N months of escrow transaction counts).
 */
export const useSeasonalDemand = (
  currency = 'GHS',
  months = 12,
  options?: { refetchIntervalMs?: number },
) => {
  const refetchInterval = options?.refetchIntervalMs ?? 60_000;

  return useQuery<SeasonalDemandPoint[]>({
    queryKey: SEASONAL_DEMAND_KEY(currency, months),
    queryFn: async () => {
      const res = await analyticsService.seasonalDemand(currency, months);
      if (!res.success || !res.data) {
        throw new Error(res.message ?? 'Failed to load seasonal demand');
      }
      return res.data;
    },
    refetchInterval,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
  });
};

/**
 * Payment behavior stat cards + top-up tier distribution for the Payment
 * Behavior page.
 */
export const usePaymentBehavior = (
  currency = 'GHS',
  options?: { refetchIntervalMs?: number },
) => {
  const refetchInterval = options?.refetchIntervalMs ?? 30_000;

  return useQuery<PaymentBehavior>({
    queryKey: PAYMENT_BEHAVIOR_KEY(currency),
    queryFn: async () => {
      const res = await analyticsService.paymentBehavior(currency);
      if (!res.success || !res.data) {
        throw new Error(res.message ?? 'Failed to load payment behavior');
      }
      return res.data;
    },
    refetchInterval,
    refetchIntervalInBackground: false,
    staleTime: 10_000,
  });
};

/**
 * Average wallet balance trend line (last N days) for the Payment Behavior
 * page.
 */
export const useWalletBalanceTrend = (
  currency = 'GHS',
  days = 7,
  options?: { refetchIntervalMs?: number },
) => {
  const refetchInterval = options?.refetchIntervalMs ?? 60_000;

  return useQuery<WalletBalanceTrendPoint[]>({
    queryKey: WALLET_BALANCE_TREND_KEY(currency, days),
    queryFn: async () => {
      const res = await analyticsService.walletBalanceTrend(currency, days);
      if (!res.success || !res.data) {
        throw new Error(res.message ?? 'Failed to load wallet balance trend');
      }
      return res.data;
    },
    refetchInterval,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
  });
};

/**
 * Wallet transaction insights (avg value, failed/refund rates, volume) for
 * the Integration Insights page.
 */
export const useTransactionInsights = (
  currency = 'GHS',
  options?: { refetchIntervalMs?: number },
) => {
  const refetchInterval = options?.refetchIntervalMs ?? 30_000;

  return useQuery<TransactionInsights>({
    queryKey: TRANSACTION_INSIGHTS_KEY(currency),
    queryFn: async () => {
      const res = await analyticsService.transactionInsights(currency);
      if (!res.success || !res.data) {
        throw new Error(res.message ?? 'Failed to load transaction insights');
      }
      return res.data;
    },
    refetchInterval,
    refetchIntervalInBackground: false,
    staleTime: 10_000,
  });
};

/**
 * Refund rate — share of resolved escrow disputes refunded to the buyer, plus
 * the money returned. For the Integration Insights "Refund Rate" card.
 */
export const useRefundRate = (
  currency = 'GHS',
  options?: { refetchIntervalMs?: number },
) => {
  const refetchInterval = options?.refetchIntervalMs ?? 30_000;

  return useQuery<RefundRate>({
    queryKey: REFUND_RATE_KEY(currency),
    queryFn: async () => {
      const res = await analyticsService.refundRate(currency);
      if (!res.success || !res.data) {
        throw new Error(res.message ?? 'Failed to load refund rate');
      }
      return res.data;
    },
    refetchInterval,
    refetchIntervalInBackground: false,
    staleTime: 10_000,
  });
};

/**
 * Monthly revenue vs forecast trend line for the Integration Insights page.
 */
export const useRevenueTrend = (
  currency = 'GHS',
  months = 6,
  options?: { refetchIntervalMs?: number },
) => {
  const refetchInterval = options?.refetchIntervalMs ?? 60_000;

  return useQuery<RevenueTrendPoint[]>({
    queryKey: REVENUE_TREND_KEY(currency, months),
    queryFn: async () => {
      const res = await analyticsService.revenueTrend(currency, months);
      if (!res.success || !res.data) {
        throw new Error(res.message ?? 'Failed to load revenue trend');
      }
      return res.data;
    },
    refetchInterval,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
  });
};

/**
 * Revenue efficiency stat cards (revenue per transaction, service
 * availability, pricing efficiency) for the Revenue Analytics page.
 */
export const useRevenueEfficiency = (
  currency = 'GHS',
  options?: { refetchIntervalMs?: number },
) => {
  const refetchInterval = options?.refetchIntervalMs ?? 30_000;

  return useQuery<RevenueEfficiency>({
    queryKey: REVENUE_EFFICIENCY_KEY(currency),
    queryFn: async () => {
      const res = await analyticsService.revenueEfficiency(currency);
      if (!res.success || !res.data) {
        throw new Error(res.message ?? 'Failed to load revenue efficiency');
      }
      return res.data;
    },
    refetchInterval,
    refetchIntervalInBackground: false,
    staleTime: 10_000,
  });
};

/**
 * Daily wallet loading (top-up inflow) patterns for the Revenue Analytics
 * page.
 */
export const useWalletLoadingPatterns = (
  currency = 'GHS',
  days = 7,
  options?: { refetchIntervalMs?: number },
) => {
  const refetchInterval = options?.refetchIntervalMs ?? 60_000;

  return useQuery<WalletLoadingPoint[]>({
    queryKey: WALLET_LOADING_PATTERNS_KEY(currency, days),
    queryFn: async () => {
      const res = await analyticsService.walletLoadingPatterns(currency, days);
      if (!res.success || !res.data) {
        throw new Error(res.message ?? 'Failed to load wallet loading patterns');
      }
      return res.data;
    },
    refetchInterval,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
  });
};

/**
 * Cash flow (money in/out, float, estimated provider cost) for the Wallet &
 * Escrow page. Totals move slowly, so a 30s refresh is plenty.
 */
export const useCashFlow = (
  currency = 'GHS',
  options?: { refetchIntervalMs?: number },
) => {
  const refetchInterval = options?.refetchIntervalMs ?? 30_000;

  return useQuery<CashFlow>({
    queryKey: CASH_FLOW_KEY(currency),
    queryFn: async () => {
      const res = await analyticsService.cashFlow(currency);
      if (!res.success || !res.data) {
        throw new Error(res.message ?? 'Failed to load cash flow');
      }
      return res.data;
    },
    refetchInterval,
    refetchIntervalInBackground: false,
    staleTime: 10_000,
  });
};

/** The one-time % we charge per escrow transaction (Wallet & Escrow page). */
export const useTakeRate = (
  currency = 'GHS',
  options?: { refetchIntervalMs?: number },
) => {
  const refetchInterval = options?.refetchIntervalMs ?? 60_000;

  return useQuery<TakeRate>({
    queryKey: TAKE_RATE_KEY(currency),
    queryFn: async () => {
      const res = await analyticsService.takeRate(currency);
      if (!res.success || !res.data) {
        throw new Error(res.message ?? 'Failed to load take rate');
      }
      return res.data;
    },
    refetchInterval,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
  });
};

/**
 * Transaction-fees breakdown (PadLok service fee vs Paystack API fees) for the
 * BI Overview. Totals move slowly — 30s refresh.
 */
export const useTransactionFees = (
  currency = 'GHS',
  options?: { refetchIntervalMs?: number },
) => {
  const refetchInterval = options?.refetchIntervalMs ?? 30_000;

  return useQuery<TransactionFees>({
    queryKey: TRANSACTION_FEES_KEY(currency),
    queryFn: async () => {
      const res = await analyticsService.transactionFees(currency);
      if (!res.success || !res.data) {
        throw new Error(res.message ?? 'Failed to load transaction fees');
      }
      return res.data;
    },
    refetchInterval,
    refetchIntervalInBackground: false,
    staleTime: 10_000,
  });
};

/** Daily inflow/outflow series for the cash-flow chart. */
export const useCashFlowSeries = (
  currency = 'GHS',
  days = 30,
  options?: { refetchIntervalMs?: number },
) => {
  const refetchInterval = options?.refetchIntervalMs ?? 60_000;

  return useQuery<CashFlowPoint[]>({
    queryKey: CASH_FLOW_SERIES_KEY(currency, days),
    queryFn: async () => {
      const res = await analyticsService.cashFlowSeries(currency, days);
      if (!res.success || !res.data) {
        throw new Error(res.message ?? 'Failed to load cash flow series');
      }
      return res.data;
    },
    refetchInterval,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
  });
};
