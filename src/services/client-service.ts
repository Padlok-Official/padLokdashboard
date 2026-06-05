import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth-store';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

// Admin-scoped wallet & escrow endpoints live on the admin server (padlok-api).
// Auth uses the admin access token already stored in useAuthStore — no
// separate token plane is needed. The route paths mirror the ones the user
// backend exposes but the semantics here are admin/cross-user.

const adminApiUrl = import.meta.env.VITE_API_URL;

export const getClientServerUrl = () => adminApiUrl;

const clientApi = axios.create({
  baseURL: adminApiUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

clientApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

clientApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

// ---------------- Wallet types ----------------

export type WalletTxType =
  | 'funding'
  | 'withdrawal'
  | 'escrow_lock'
  | 'escrow_release'
  | 'escrow_refund';

export type WalletTxStatus = 'pending' | 'completed' | 'failed' | 'reversed';

// Kept as the legacy alias the pages already import.
export type TransactionType = WalletTxType;
export type TransactionStatus = WalletTxStatus;

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  type: WalletTxType;
  status: WalletTxStatus;
  amount: string | number;
  fee?: string | number;
  balance_before?: string | number;
  balance_after?: string | number;
  currency: string;
  reference: string;
  paystack_reference?: string | null;
  escrow_transaction_id?: string | null;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface WalletStats {
  total_balance: string;
  total_funding: string;
  total_withdrawals: string;
  total_wallets: number;
  active_wallets: number;
  funding_per_hour: string;
}

export interface TransactionHistoryQuery {
  page?: number;
  limit?: number;
  type?: WalletTxType;
  status?: WalletTxStatus;
  userId?: string;
  walletId?: string;
  from?: string;
  to?: string;
}

// ---------------- Escrow types ----------------

export type EscrowStatus =
  | 'initiated'
  | 'funded'
  | 'delivery_confirmed'
  | 'completed'
  | 'disputed'
  | 'refunded'
  | 'cancelled';

export interface EscrowTransaction {
  id: string;
  status: EscrowStatus;
  reference: string;
  amount: string | number;
  price: string | number;
  fee?: string | number;
  currency: string;
  buyer_id: string;
  buyer_name: string | null;
  buyer_email: string | null;
  seller_id: string | null;
  seller_name: string | null;
  seller_email: string | null;
  item_title: string | null;
  item_description: string | null;
  item_photos: string[] | null;
  delivery_window: string | null;
  delivery_deadline: string | null;
  delivery_confirmed_at: string | null;
  buyer_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type DisputeStatus =
  | 'open'
  | 'under_review'
  | 'resolved_refund'
  | 'resolved_release'
  | 'closed';

export interface EscrowDispute {
  id: string;
  escrow_transaction_id: string;
  raised_by: string;
  raised_by_name: string | null;
  raised_by_email: string | null;
  reason: string;
  evidence_photos: string[] | null;
  status: DisputeStatus;
  admin_id: string | null;
  admin_name: string | null;
  admin_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EscrowStats {
  total_in_escrow: string;
  total_released: string;
  total_refunded: string;
  total_cancelled: string;
  escrow_count_by_status: Record<EscrowStatus, number>;
}

export interface EscrowListQuery {
  page?: number;
  limit?: number;
  status?: EscrowStatus;
  buyerId?: string;
  sellerId?: string;
  from?: string;
  to?: string;
}

export interface DisputeListQuery {
  page?: number;
  limit?: number;
  status?: DisputeStatus;
}

export interface ResolveDisputePayload {
  resolution: 'refund' | 'release';
  admin_notes?: string;
}

// ---------------- Wallet service ----------------

export const walletService = {
  getTransactionHistory: async (
    query: TransactionHistoryQuery = {},
  ): Promise<PaginatedResponse<WalletTransaction>> => {
    const { data } = await clientApi.get('/wallet/transactions', { params: query });
    return data;
  },

  getTransactionById: async (id: string): Promise<ApiResponse<WalletTransaction>> => {
    const { data } = await clientApi.get(`/wallet/transactions/${id}`);
    return data;
  },

  getStats: async (currency = 'GHS'): Promise<ApiResponse<WalletStats>> => {
    const { data } = await clientApi.get('/wallet/stats', { params: { currency } });
    return data;
  },
};

// ---------------- Escrow service ----------------

export const escrowService = {
  getEscrowTransactions: async (
    query: EscrowListQuery = {},
  ): Promise<PaginatedResponse<EscrowTransaction>> => {
    const { data } = await clientApi.get('/escrow', { params: query });
    return data;
  },

  getEscrowById: async (
    id: string,
  ): Promise<ApiResponse<EscrowTransaction & { dispute: EscrowDispute | null }>> => {
    const { data } = await clientApi.get(`/escrow/${id}`);
    return data;
  },

  getStats: async (currency = 'GHS'): Promise<ApiResponse<EscrowStats>> => {
    const { data } = await clientApi.get('/escrow/stats', { params: { currency } });
    return data;
  },

  getDisputes: async (
    query: DisputeListQuery = {},
  ): Promise<PaginatedResponse<EscrowDispute>> => {
    const { data } = await clientApi.get('/escrow/disputes', { params: query });
    return data;
  },

  resolveDispute: async (
    disputeId: string,
    payload: ResolveDisputePayload,
  ): Promise<ApiResponse<{
    disputeId: string;
    escrowId: string;
    resolution: 'refund' | 'release';
    amount: string;
    currency: string;
  }>> => {
    const { data } = await clientApi.post(`/escrow/disputes/${disputeId}/resolve`, payload);
    return data;
  },
};

export default clientApi;
