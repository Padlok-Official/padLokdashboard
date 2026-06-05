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
};

export default analyticsService;
