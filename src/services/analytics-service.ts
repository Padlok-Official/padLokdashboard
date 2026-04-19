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
 * Forecast card block for the Financial Forecast page.
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

/**
 * One entry on the 12-month seasonal demand area chart.
 */
export interface SeasonalDemandPoint {
  month: string; // YYYY-MM
  shortLabel: string; // JAN, FEB, ...
  value: number; // escrow transaction count
}

/**
 * Transaction insights block for the Integration Insights page.
 * All money fields arrive as strings on the wire; parsed to numbers here.
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

/**
 * Revenue-vs-forecast point for the line chart.
 */
export interface RevenueTrendPointApi {
  month: string; // YYYY-MM
  revenue: string;
  forecast: string;
}

export interface RevenueTrendPoint {
  month: string; // YYYY-MM
  revenue: number;
  forecast: number;
}

/**
 * Payment behavior (top-up patterns) for the Payment Behavior page.
 * `promo_redemption_pct` currently hard-codes to "0" on the backend until
 * the promotions/redemptions surface lands in padlokbackend.
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

/**
 * One point on the average-wallet-balance line chart.
 */
export interface WalletBalanceTrendPointApi {
  date: string; // YYYY-MM-DD
  day_label: string; // MON, TUE, ...
  avg_balance: string;
}

export interface WalletBalanceTrendPoint {
  date: string;
  dayLabel: string;
  avgBalance: number;
}

/**
 * Revenue efficiency tile values for the Revenue Analytics page.
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

const analyticsService = {
  platformActivity: async (): Promise<ApiResponse<PlatformActivity>> => {
    const { data } = await apiClient.get<ApiResponse<PlatformActivity>>(
      '/analytics/platform-activity',
    );
    return data;
  },

  financialForecast: async (
    currency = 'NGN',
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
    months = 12,
    currency = 'NGN',
  ): Promise<ApiResponse<SeasonalDemandPoint[]>> => {
    const { data } = await apiClient.get<
      ApiResponse<Array<{ month: string; short_label: string; value: number }>>
    >('/analytics/seasonal-demand', { params: { months, currency } });
    if (!data.success || !data.data) {
      return { success: false, message: data.message };
    }
    return {
      success: true,
      message: data.message,
      data: data.data.map((r) => ({
        month: r.month,
        shortLabel: r.short_label,
        value: Number(r.value) || 0,
      })),
    };
  },

  transactionInsights: async (
    currency = 'NGN',
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
        transactionVolume: d.transaction_volume,
        dailyTransactions: d.daily_transactions,
        dailyAvgValue: Number(d.daily_avg_value) || 0,
        currency: d.currency,
      },
    };
  },

  revenueTrend: async (
    months = 6,
    currency = 'NGN',
  ): Promise<ApiResponse<RevenueTrendPoint[]>> => {
    const { data } = await apiClient.get<ApiResponse<RevenueTrendPointApi[]>>(
      '/analytics/revenue-trend',
      { params: { months, currency } },
    );
    if (!data.success || !data.data) {
      return { success: false, message: data.message };
    }
    return {
      success: true,
      message: data.message,
      data: data.data.map((r) => ({
        month: r.month,
        revenue: Number(r.revenue) || 0,
        forecast: Number(r.forecast) || 0,
      })),
    };
  },

  paymentBehavior: async (
    currency = 'NGN',
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
        topupByTier: d.topup_by_tier,
        currency: d.currency,
      },
    };
  },

  walletBalanceTrend: async (
    days = 7,
    currency = 'NGN',
  ): Promise<ApiResponse<WalletBalanceTrendPoint[]>> => {
    const { data } = await apiClient.get<ApiResponse<WalletBalanceTrendPointApi[]>>(
      '/analytics/wallet-balance-trend',
      { params: { days, currency } },
    );
    if (!data.success || !data.data) {
      return { success: false, message: data.message };
    }
    return {
      success: true,
      message: data.message,
      data: data.data.map((r) => ({
        date: r.date,
        dayLabel: r.day_label,
        avgBalance: Number(r.avg_balance) || 0,
      })),
    };
  },

  revenueEfficiency: async (
    currency = 'NGN',
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

  financialSummary: async (
    currency = 'NGN',
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
};

export default analyticsService;
