import apiClient from './api-client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

export type RiskLevel = 'high' | 'medium' | 'low' | 'none';

/** A user row from the admin users list / detail (shared `users` table + aggregates). */
export interface UserRow {
  id: string;
  name: string;
  email: string;
  phone_number: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  is_active: boolean;
  status: string | null;
  created_at: string;
  last_login_at: string | null;
  wallet_balance: string | null;
  wallet_escrow_balance: string | null;
  wallet_currency: string | null;
  wallet_status: string | null;
  total_transactions: number;
  total_disputes: number;
  open_disputes: number;
  avg_rating: string | null;
  total_volume: string;
  flag_count: number;
  risk_level: RiskLevel;
}

export interface UserTransactionRow {
  id: string;
  type: string;
  status: string;
  amount: string;
  currency: string;
  role: 'buyer' | 'seller';
  counterparty_id: string | null;
  counterparty_name: string | null;
  created_at: string;
}

export interface UserDisputeRow {
  id: string;
  escrow_transaction_id: string;
  reason: string;
  status: string;
  amount: string | null;
  currency: string | null;
  counterparty_name: string | null;
  role: 'buyer' | 'seller' | 'unknown';
  created_at: string;
  resolved_at: string | null;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'suspended' | 'flagged' | 'banned';
  minFlags?: number;
}

export interface PageParams {
  page?: number;
  limit?: number;
}

const userService = {
  list: async (params?: ListUsersParams): Promise<PaginatedResponse<UserRow>> => {
    const { data } = await apiClient.get<PaginatedResponse<UserRow>>('/users', { params });
    return data;
  },

  getUser: async (id: string): Promise<ApiResponse<UserRow>> => {
    const { data } = await apiClient.get<ApiResponse<UserRow>>(`/users/${id}`);
    return data;
  },

  getUserTransactions: async (
    id: string,
    params?: PageParams,
  ): Promise<PaginatedResponse<UserTransactionRow>> => {
    const { data } = await apiClient.get<PaginatedResponse<UserTransactionRow>>(
      `/users/${id}/transactions`,
      { params },
    );
    return data;
  },

  getUserDisputes: async (
    id: string,
    params?: PageParams,
  ): Promise<PaginatedResponse<UserDisputeRow>> => {
    const { data } = await apiClient.get<PaginatedResponse<UserDisputeRow>>(
      `/users/${id}/disputes`,
      { params },
    );
    return data;
  },

  setStatus: async (
    id: string,
    status: 'active' | 'inactive',
  ): Promise<ApiResponse<UserRow>> => {
    const { data } = await apiClient.patch<ApiResponse<UserRow>>(`/users/${id}/status`, {
      status,
    });
    return data;
  },
};

export default userService;
