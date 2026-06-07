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
  escrow_reconciliation?: {
    active_escrow: string;
    wallet_ledger: string;
    drift: string;
    reconciled: boolean;
  };
  generated_at: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  inEscrowBalance: number;
  transactionFees: number;
  currency: string;
  escrowReconciliation?: {
    activeEscrow: number;
    walletLedger: number;
    drift: number;
    reconciled: boolean;
  };
  generatedAt: string;
}

/**
 * Forecast stat-card values for the Financial Forecasting page. Backend
 * returns decimals as strings; the frontend parses them once here.
 */
export interface SeasonalPeakApi {
  peak_day: string;
  peak_day_short: string;
  peak_time_window: string;
  peak_hour: number;
  label: string;
  demand_level: 'Unknown' | 'Even' | 'Moderate' | 'High';
  demand_phrase: string;
  trend: 'up' | 'down' | 'flat';
  confidence: 'very_low' | 'low' | 'medium' | 'high';
  sample_size: number;
  by_day: Array<{ day: string; value: number }>;
  by_hour: Array<{ hour: number; value: number }>;
  basis: string;
}

export interface EscrowGrowthApi {
  currency: string;
  current_gmv: string;
  projected_gmv: string;
  growth_amount: string;
  growth_pct: string;
  run_rate: string;
  trend: 'up' | 'down' | 'flat';
  confidence: 'very_low' | 'low' | 'medium' | 'high';
  method: string;
  data_months: number;
  basis: string;
  generated_at: string;
}

export interface EscrowGrowth {
  currency: string;
  currentGmv: number;
  projectedGmv: number;
  growthAmount: number;
  growthPct: number;
  runRate: number;
  trend: 'up' | 'down' | 'flat';
  confidence: 'very_low' | 'low' | 'medium' | 'high';
  method: string;
  dataMonths: number;
  basis: string;
}

const mapEscrowGrowth = (d: EscrowGrowthApi): EscrowGrowth => ({
  currency: d.currency,
  currentGmv: Number(d.current_gmv) || 0,
  projectedGmv: Number(d.projected_gmv) || 0,
  growthAmount: Number(d.growth_amount) || 0,
  growthPct: Number(d.growth_pct) || 0,
  runRate: Number(d.run_rate) || 0,
  trend: d.trend,
  confidence: d.confidence,
  method: d.method,
  dataMonths: d.data_months,
  basis: d.basis,
});

export interface FinancialForecastApi {
  monthly_forecasted_revenue: string;
  seasonal_peak: { label: string; demand: string };
  projected_escrow_growth: string;
  currency: string;
  seasonal_peak_detail?: SeasonalPeakApi;
  escrow_growth_detail?: EscrowGrowthApi;
}

export interface SeasonalPeak {
  peakDay: string;
  peakDayShort: string;
  peakTimeWindow: string;
  peakHour: number;
  label: string;
  demandLevel: 'Unknown' | 'Even' | 'Moderate' | 'High';
  demandPhrase: string;
  trend: 'up' | 'down' | 'flat';
  confidence: 'very_low' | 'low' | 'medium' | 'high';
  sampleSize: number;
  byDay: Array<{ day: string; value: number }>;
  byHour: Array<{ hour: number; value: number }>;
  basis: string;
}

export interface FinancialForecast {
  monthlyForecastedRevenue: number;
  seasonalPeak: { label: string; demand: string };
  projectedEscrowGrowth: number;
  currency: string;
  seasonalPeakDetail?: SeasonalPeak;
  escrowGrowthDetail?: EscrowGrowth;
}

/** Map the wire seasonal-peak shape → camelCase. */
const mapSeasonalPeak = (d: SeasonalPeakApi): SeasonalPeak => ({
  peakDay: d.peak_day,
  peakDayShort: d.peak_day_short,
  peakTimeWindow: d.peak_time_window,
  peakHour: d.peak_hour,
  label: d.label,
  demandLevel: d.demand_level,
  demandPhrase: d.demand_phrase,
  trend: d.trend,
  confidence: d.confidence,
  sampleSize: d.sample_size,
  byDay: d.by_day,
  byHour: d.by_hour,
  basis: d.basis,
});

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

/** Refund rate — dispute outcomes (money returned to buyers). */
export interface RefundRateApi {
  currency: string;
  refund_rate_pct: string;
  refunds_count: number;
  releases_count: number;
  resolved_disputes: number;
  total_refunded: string;
  avg_refund: string;
  generated_at: string;
}

export interface RefundRate {
  currency: string;
  refundRatePct: number;
  refundsCount: number;
  releasesCount: number;
  resolvedDisputes: number;
  totalRefunded: number;
  avgRefund: number;
}

const mapRefundRate = (d: RefundRateApi): RefundRate => ({
  currency: d.currency,
  refundRatePct: Number(d.refund_rate_pct) || 0,
  refundsCount: d.refunds_count,
  releasesCount: d.releases_count,
  resolvedDisputes: d.resolved_disputes,
  totalRefunded: Number(d.total_refunded) || 0,
  avgRefund: Number(d.avg_refund) || 0,
});

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

/**
 * Cash flow: money in (completed deposits), money out (completed withdrawals),
 * the float we custody, and the ESTIMATED Paystack cost PadLok absorbs.
 * Backend sends decimals as strings; parsed to numbers here.
 */
export interface CashFlowApi {
  currency: string;
  inflow: string;
  inflow_count: number;
  outflow: string;
  outflow_count: number;
  net_flow: string;
  float: { available: string; escrow_locked: string; total: string };
  provider_fees: {
    deposits: string;
    withdrawals: string;
    total: string;
    borne_by_platform: string;
    borne_by_customer: string;
    is_estimate: boolean;
  };
  platform_net: string;
  reconciliation: { expected_user_float: string; actual_float: string; drift: string };
  generated_at: string;
}

export interface CashFlow {
  currency: string;
  inflow: number;
  inflowCount: number;
  outflow: number;
  outflowCount: number;
  netFlow: number;
  float: { available: number; escrowLocked: number; total: number };
  /** Estimated Paystack fees flowing to the provider, and who bears them.
   *  Customers bear all of it today, so it's informational — not our cost. */
  providerFees: {
    deposits: number;
    withdrawals: number;
    total: number;
    borneByPlatform: number;
    borneByCustomer: number;
    isEstimate: boolean;
  };
  /** Our net from the service fee after any platform-borne provider cost. */
  platformNet: number;
  reconciliation: { expectedUserFloat: number; actualFloat: number; drift: number };
  generatedAt: string;
}

/** Take rate: the one-time % we charge per escrow transaction. */
export interface TakeRateApi {
  currency: string;
  configured_fee_pct: string;
  effective_fee_pct: string;
  revenue_per_transaction: string;
  total_fees: string;
  total_gmv: string;
  completed_count: number;
  generated_at: string;
}

export interface TakeRate {
  currency: string;
  configuredFeePct: number;
  effectiveFeePct: number;
  revenuePerTransaction: number;
  totalFees: number;
  totalGmv: number;
  completedCount: number;
}

/** One day of the cash-flow in/out chart. */
export interface CashFlowPoint {
  date: string; // YYYY-MM-DD
  inflow: string;
  outflow: string;
  net: string;
}

/**
 * Transaction-fees breakdown for the BI Overview: PadLok's service fee (our
 * revenue) vs Paystack's API fees (estimated, customer-borne). Strings on the
 * wire, parsed to numbers here.
 */
export interface FeeItemApi {
  key: string;
  label: string;
  amount: string;
  rate_label: string;
  effective_pct: string;
  kind: 'padlok' | 'paystack';
  borne_by: string;
  is_estimate: boolean;
}

export interface TransactionFeesApi {
  currency: string;
  total_fees: string;
  padlok: { total: string };
  paystack: {
    deposits: string;
    withdrawals: string;
    total: string;
    is_estimate: boolean;
    borne_by: string;
  };
  items: FeeItemApi[];
  generated_at: string;
}

export interface FeeItem {
  key: string;
  label: string;
  amount: number;
  rateLabel: string;
  effectivePct: number;
  kind: 'padlok' | 'paystack';
  borneBy: string;
  isEstimate: boolean;
}

export interface TransactionFees {
  currency: string;
  totalFees: number;
  padlok: { total: number };
  paystack: {
    deposits: number;
    withdrawals: number;
    total: number;
    isEstimate: boolean;
    borneBy: string;
  };
  items: FeeItem[];
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
        escrowReconciliation: d.escrow_reconciliation
          ? {
              activeEscrow: Number(d.escrow_reconciliation.active_escrow) || 0,
              walletLedger: Number(d.escrow_reconciliation.wallet_ledger) || 0,
              drift: Number(d.escrow_reconciliation.drift) || 0,
              reconciled: d.escrow_reconciliation.reconciled,
            }
          : undefined,
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
        seasonalPeakDetail: d.seasonal_peak_detail
          ? mapSeasonalPeak(d.seasonal_peak_detail)
          : undefined,
        escrowGrowthDetail: d.escrow_growth_detail
          ? mapEscrowGrowth(d.escrow_growth_detail)
          : undefined,
      },
    };
  },

  escrowGrowth: async (currency = 'GHS'): Promise<ApiResponse<EscrowGrowth>> => {
    const { data } = await apiClient.get<ApiResponse<EscrowGrowthApi>>(
      '/analytics/escrow-growth',
      { params: { currency } },
    );
    if (!data.success || !data.data) {
      return { success: false, message: data.message };
    }
    return { success: true, message: data.message, data: mapEscrowGrowth(data.data) };
  },

  seasonalPeak: async (currency = 'GHS'): Promise<ApiResponse<SeasonalPeak>> => {
    const { data } = await apiClient.get<ApiResponse<SeasonalPeakApi>>(
      '/analytics/seasonal-peak',
      { params: { currency } },
    );
    if (!data.success || !data.data) {
      return { success: false, message: data.message };
    }
    return { success: true, message: data.message, data: mapSeasonalPeak(data.data) };
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

  refundRate: async (currency = 'GHS'): Promise<ApiResponse<RefundRate>> => {
    const { data } = await apiClient.get<ApiResponse<RefundRateApi>>('/analytics/refund-rate', {
      params: { currency },
    });
    if (!data.success || !data.data) {
      return { success: false, message: data.message };
    }
    return { success: true, message: data.message, data: mapRefundRate(data.data) };
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

  cashFlow: async (currency = 'GHS'): Promise<ApiResponse<CashFlow>> => {
    const { data } = await apiClient.get<ApiResponse<CashFlowApi>>('/analytics/cash-flow', {
      params: { currency },
    });
    if (!data.success || !data.data) {
      return { success: false, message: data.message };
    }
    const d = data.data;
    return {
      success: true,
      message: data.message,
      data: {
        currency: d.currency,
        inflow: Number(d.inflow) || 0,
        inflowCount: d.inflow_count,
        outflow: Number(d.outflow) || 0,
        outflowCount: d.outflow_count,
        netFlow: Number(d.net_flow) || 0,
        float: {
          available: Number(d.float.available) || 0,
          escrowLocked: Number(d.float.escrow_locked) || 0,
          total: Number(d.float.total) || 0,
        },
        providerFees: {
          deposits: Number(d.provider_fees.deposits) || 0,
          withdrawals: Number(d.provider_fees.withdrawals) || 0,
          total: Number(d.provider_fees.total) || 0,
          borneByPlatform: Number(d.provider_fees.borne_by_platform) || 0,
          borneByCustomer: Number(d.provider_fees.borne_by_customer) || 0,
          isEstimate: d.provider_fees.is_estimate,
        },
        platformNet: Number(d.platform_net) || 0,
        reconciliation: {
          expectedUserFloat: Number(d.reconciliation.expected_user_float) || 0,
          actualFloat: Number(d.reconciliation.actual_float) || 0,
          drift: Number(d.reconciliation.drift) || 0,
        },
        generatedAt: d.generated_at,
      },
    };
  },

  takeRate: async (currency = 'GHS'): Promise<ApiResponse<TakeRate>> => {
    const { data } = await apiClient.get<ApiResponse<TakeRateApi>>('/analytics/take-rate', {
      params: { currency },
    });
    if (!data.success || !data.data) {
      return { success: false, message: data.message };
    }
    const d = data.data;
    return {
      success: true,
      message: data.message,
      data: {
        currency: d.currency,
        configuredFeePct: Number(d.configured_fee_pct) || 0,
        effectiveFeePct: Number(d.effective_fee_pct) || 0,
        revenuePerTransaction: Number(d.revenue_per_transaction) || 0,
        totalFees: Number(d.total_fees) || 0,
        totalGmv: Number(d.total_gmv) || 0,
        completedCount: d.completed_count,
      },
    };
  },

  cashFlowSeries: async (
    currency = 'GHS',
    days = 30,
  ): Promise<ApiResponse<CashFlowPoint[]>> => {
    const { data } = await apiClient.get<ApiResponse<CashFlowPoint[]>>(
      '/analytics/cash-flow-series',
      { params: { currency, days } },
    );
    return data;
  },

  transactionFees: async (
    currency = 'GHS',
  ): Promise<ApiResponse<TransactionFees>> => {
    const { data } = await apiClient.get<ApiResponse<TransactionFeesApi>>(
      '/analytics/transaction-fees',
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
        currency: d.currency,
        totalFees: Number(d.total_fees) || 0,
        padlok: {
          total: Number(d.padlok.total) || 0,
        },
        paystack: {
          deposits: Number(d.paystack.deposits) || 0,
          withdrawals: Number(d.paystack.withdrawals) || 0,
          total: Number(d.paystack.total) || 0,
          isEstimate: d.paystack.is_estimate,
          borneBy: d.paystack.borne_by,
        },
        items: d.items.map((i) => ({
          key: i.key,
          label: i.label,
          amount: Number(i.amount) || 0,
          rateLabel: i.rate_label,
          effectivePct: Number(i.effective_pct) || 0,
          kind: i.kind,
          borneBy: i.borne_by,
          isEstimate: i.is_estimate,
        })),
        generatedAt: d.generated_at,
      },
    };
  },
};

export default analyticsService;
