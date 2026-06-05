import apiClient from './api-client';
import type { ApiResponse } from '@/types/api';

export interface PlatformActivity {
  disputes: number;
  completedTransactions: number;
  ongoingTransactions: number;
  activeUsers: number;
  generatedAt: string;
}

/**
 * Financial snapshot for the BI Overview donut. The backend returns
 * strings so big BigDecimals don't lose precision on the wire — the
 * frontend parses them to numbers for charting.
 */
export interface FinancialSummaryApi {
  total_revenue: string;
  in_escrow_balance: string;
  transaction_fees: string;
  currency: string;
  generated_at: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  inEscrowBalance: number;
  transactionFees: number;
  currency: string;
  generatedAt: string;
}

/**
 * Forecast stat-card values for the Financial Forecasting page. Backend
 * returns decimals as strings; the frontend parses them once here.
 */
export interface FinancialForecastApi {
  monthly_forecasted_revenue: string;
  seasonal_peak: { label: string; demand: string };
  projected_escrow_growth: string;
  currency: string;
}

export interface FinancialForecast {
  monthlyForecastedRevenue: number;
  seasonalPeak: { label: string; demand: string };
  projectedEscrowGrowth: number;
  currency: string;
}

/** One bucket of the Seasonal Demand area chart. */
export interface SeasonalDemandPoint {
  month: string; // YYYY-MM
  short_label: string; // JAN, FEB, ...
  value: number; // escrow transaction count
}

/**
 * Payment behavior stat cards + top-up tier distribution for the Payment
 * Behavior page. Backend returns decimals as strings; parsed once here.
 */
export interface PaymentBehaviorApi {
  avg_topup_amount: string;
  topup_per_hour: string;
  promo_redemption_pct: string;
  topup_by_tier: Array<{ tier: string; count: number }>;
  currency: string;
}

export interface PaymentBehavior {
  avgTopupAmount: number;
  topupPerHour: number;
  promoRedemptionPct: number;
  topupByTier: Array<{ tier: string; count: number }>;
  currency: string;
}

/** One day of the average wallet balance trend line. */
export interface WalletBalanceTrendPoint {
  date: string; // YYYY-MM-DD
  day_label: string; // MON, TUE, ...
  avg_balance: string;
}

/**
 * Wallet transaction insights for the Integration Insights page. Backend
 * returns decimals/percentages as strings; parsed once here.
 */
export interface TransactionInsightsApi {
  avg_transaction_value: string;
  failed_rate_pct: string;
  refund_rate_pct: string;
  transaction_volume: number;
  daily_transactions: number;
  daily_avg_value: string;
  currency: string;
}

export interface TransactionInsights {
  avgTransactionValue: number;
  failedRatePct: number;
  refundRatePct: number;
  transactionVolume: number;
  dailyTransactions: number;
  dailyAvgValue: number;
  currency: string;
}

/** One month of the Revenue vs Forecast line chart. */
export interface RevenueTrendPoint {
  month: string; // YYYY-MM
  revenue: string;
  forecast: string;
}

/**
 * Revenue efficiency stat cards for the Revenue Analytics page. Backend
 * returns decimals/percentages as strings; parsed once here.
 */
export interface RevenueEfficiencyApi {
  revenue_per_transaction: string;
  service_availability_pct: string;
  pricing_efficiency_pct: string;
  currency: string;
}

export interface RevenueEfficiency {
  revenuePerTransaction: number;
  serviceAvailabilityPct: number;
  pricingEfficiencyPct: number;
  currency: string;
}

/** One day of the wallet loading (top-up inflow) patterns chart. */
export interface WalletLoadingPoint {
  date: string; // YYYY-MM-DD
  day_label: string; // MON, TUE, ...
  amount: string; // total funding inflow that day
  count: number; // completed funding events
}

const analyticsService = {
  platformActivity: async (): Promise<ApiResponse<PlatformActivity>> => {
    const { data } = await apiClient.get<ApiResponse<PlatformActivity>>(
      '/analytics/platform-activity',
    );
    return data;
  },

  financialSummary: async (
    currency = 'GHS',
  ): Promise<ApiResponse<FinancialSummary>> => {
    const { data } = await apiClient.get<ApiResponse<FinancialSummaryApi>>(
      '/analytics/financial-summary',
      { params: { currency } },
    );
    if (!data.success || !data.data) {
      return { success: false, message: data.message };
    }
    // Parse the string decimals into numbers once so every chart consumer
    // doesn't need to remember they're strings on the wire.
    const d = data.data;
    return {
      success: true,
      message: data.message,
      data: {
        totalRevenue: Number(d.total_revenue) || 0,
        inEscrowBalance: Number(d.in_escrow_balance) || 0,
        transactionFees: Number(d.transaction_fees) || 0,
        currency: d.currency,
        generatedAt: d.generated_at,
      },
    };
  },

  financialForecast: async (
    currency = 'GHS',
  ): Promise<ApiResponse<FinancialForecast>> => {
    const { data } = await apiClient.get<ApiResponse<FinancialForecastApi>>(
      '/analytics/financial-forecast',
      { params: { currency } },
    );
    if (!data.success || !data.data) {
      return { success: false, message: data.message };
    }
    const d = data.data;
    return {
      success: true,
      message: data.message,
      data: {
        monthlyForecastedRevenue: Number(d.monthly_forecasted_revenue) || 0,
        seasonalPeak: d.seasonal_peak,
        projectedEscrowGrowth: Number(d.projected_escrow_growth) || 0,
        currency: d.currency,
      },
    };
  },

  seasonalDemand: async (
    currency = 'GHS',
    months = 12,
  ): Promise<ApiResponse<SeasonalDemandPoint[]>> => {
    const { data } = await apiClient.get<ApiResponse<SeasonalDemandPoint[]>>(
      '/analytics/seasonal-demand',
      { params: { currency, months } },
    );
    return data;
  },

  paymentBehavior: async (
    currency = 'GHS',
  ): Promise<ApiResponse<PaymentBehavior>> => {
    const { data } = await apiClient.get<ApiResponse<PaymentBehaviorApi>>(
      '/analytics/payment-behavior',
      { params: { currency } },
    );
    if (!data.success || !data.data) {
      return { success: false, message: data.message };
    }
    const d = data.data;
    return {
      success: true,
      message: data.message,
      data: {
        avgTopupAmount: Number(d.avg_topup_amount) || 0,
        topupPerHour: Number(d.topup_per_hour) || 0,
        promoRedemptionPct: Number(d.promo_redemption_pct) || 0,
        topupByTier: d.topup_by_tier ?? [],
        currency: d.currency,
      },
    };
  },

  walletBalanceTrend: async (
    currency = 'GHS',
    days = 7,
  ): Promise<ApiResponse<WalletBalanceTrendPoint[]>> => {
    const { data } = await apiClient.get<ApiResponse<WalletBalanceTrendPoint[]>>(
      '/analytics/wallet-balance-trend',
      { params: { currency, days } },
    );
    return data;
  },

  transactionInsights: async (
    currency = 'GHS',
  ): Promise<ApiResponse<TransactionInsights>> => {
    const { data } = await apiClient.get<ApiResponse<TransactionInsightsApi>>(
      '/analytics/transaction-insights',
      { params: { currency } },
    );
    if (!data.success || !data.data) {
      return { success: false, message: data.message };
    }
    const d = data.data;
    return {
      success: true,
      message: data.message,
      data: {
        avgTransactionValue: Number(d.avg_transaction_value) || 0,
        failedRatePct: Number(d.failed_rate_pct) || 0,
        refundRatePct: Number(d.refund_rate_pct) || 0,
        transactionVolume: Number(d.transaction_volume) || 0,
        dailyTransactions: Number(d.daily_transactions) || 0,
        dailyAvgValue: Number(d.daily_avg_value) || 0,
        currency: d.currency,
      },
    };
  },

  revenueTrend: async (
    currency = 'GHS',
    months = 6,
  ): Promise<ApiResponse<RevenueTrendPoint[]>> => {
    const { data } = await apiClient.get<ApiResponse<RevenueTrendPoint[]>>(
      '/analytics/revenue-trend',
      { params: { currency, months } },
    );
    return data;
  },

  revenueEfficiency: async (
    currency = 'GHS',
  ): Promise<ApiResponse<RevenueEfficiency>> => {
    const { data } = await apiClient.get<ApiResponse<RevenueEfficiencyApi>>(
      '/analytics/revenue-efficiency',
      { params: { currency } },
    );
    if (!data.success || !data.data) {
      return { success: false, message: data.message };
    }
    const d = data.data;
    return {
      success: true,
      message: data.message,
      data: {
        revenuePerTransaction: Number(d.revenue_per_transaction) || 0,
        serviceAvailabilityPct: Number(d.service_availability_pct) || 0,
        pricingEfficiencyPct: Number(d.pricing_efficiency_pct) || 0,
        currency: d.currency,
      },
    };
  },

  walletLoadingPatterns: async (
    currency = 'GHS',
    days = 7,
  ): Promise<ApiResponse<WalletLoadingPoint[]>> => {
    const { data } = await apiClient.get<ApiResponse<WalletLoadingPoint[]>>(
      '/analytics/wallet-loading-patterns',
      { params: { currency, days } },
    );
    return data;
  },
};

export default analyticsService;
