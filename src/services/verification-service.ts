import apiClient from './api-client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

export type VerificationTier = 'tier1' | 'tier2' | 'tier3';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';

/** One row in the KYC & Verification list — a user who has submitted documents. */
export interface VerificationUserSummary {
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  user_phone: string | null;
  is_active: boolean;
  total_submissions: number;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  tiers: VerificationTier[];
  highest_approved_tier: VerificationTier | null;
  latest_submitted_at: string;
}

/** A single tier submission with its documents and review trail. */
export interface VerificationSubmission {
  id: string;
  user_id: string;
  tier: VerificationTier;
  status: VerificationStatus;
  // tier1/tier2 → { documentKey: url }, tier3 → { businessName, website?, socials }
  payload: Record<string, unknown>;
  rejection_reason: string | null;
  review_comment: string | null;
  reviewed_by_admin: string | null;
  reviewed_by_admin_name: string | null;
  reviewed_at: string | null;
  submitted_at: string;
  updated_at: string;
}

export interface VerificationUserDetail {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone_number: string | null;
    email_verified: boolean;
    phone_verified: boolean;
    is_active: boolean;
    created_at: string | null;
  };
  account_status: {
    highest_approved_tier: VerificationTier | null;
    approved_count: number;
    pending_count: number;
    rejected_count: number;
    is_active: boolean;
  };
  submissions: VerificationSubmission[];
}

export interface VerificationStats {
  total_users: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface ListVerificationParams {
  page?: number;
  limit?: number;
  status?: VerificationStatus;
  tier?: VerificationTier;
  search?: string;
}

const verificationService = {
  list: async (
    params?: ListVerificationParams,
  ): Promise<PaginatedResponse<VerificationUserSummary>> => {
    const { data } = await apiClient.get<PaginatedResponse<VerificationUserSummary>>(
      '/verification',
      { params },
    );
    return data;
  },

  getStats: async (): Promise<ApiResponse<VerificationStats>> => {
    const { data } = await apiClient.get<ApiResponse<VerificationStats>>('/verification/stats');
    return data;
  },

  getUserDetail: async (userId: string): Promise<ApiResponse<VerificationUserDetail>> => {
    const { data } = await apiClient.get<ApiResponse<VerificationUserDetail>>(
      `/verification/${userId}`,
    );
    return data;
  },

  approve: async (
    userId: string,
    tier: VerificationTier,
    comment?: string,
  ): Promise<ApiResponse<VerificationSubmission>> => {
    const { data } = await apiClient.post<ApiResponse<VerificationSubmission>>(
      `/verification/${userId}/${tier}/approve`,
      { comment },
    );
    return data;
  },

  reject: async (
    userId: string,
    tier: VerificationTier,
    comment: string,
  ): Promise<ApiResponse<VerificationSubmission>> => {
    const { data } = await apiClient.post<ApiResponse<VerificationSubmission>>(
      `/verification/${userId}/${tier}/reject`,
      { comment },
    );
    return data;
  },
};

export default verificationService;
