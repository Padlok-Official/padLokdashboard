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
