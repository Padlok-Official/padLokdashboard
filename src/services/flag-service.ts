/**
 * Admin flag + risk-alert endpoints. Mirrors padlok-api's /flags surface
 * (see ADMIN_CLIENT_API_DOCS.MD §8). Requires migration 008 on the API side.
 */

import clientApi from '@/services/client-service';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

export type FlagSeverity = 'critical' | 'warning' | 'info';

export interface FlagRow {
  id: string;
  user_id: string;
  user_name: string | null;
  flagged_by: string;
  flagged_by_name: string | null;
  reason: string;
  severity: FlagSeverity;
  category: string | null;
  related_dispute_id: string | null;
  related_transaction_id: string | null;
  notes: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_notes: string | null;
  created_at: string;
}

export interface FlagStats {
  flagged_users: number;
  active_alerts: number;
  accounts_frozen: number;
  accounts_banned: number;
  by_severity: Record<FlagSeverity, number>;
}

export interface RiskAlertRow {
  id: string;
  user_id: string | null;
  user_name: string | null;
  title: string;
  description: string;
  severity: FlagSeverity;
  source: string;
  metadata: Record<string, unknown> | null;
  acknowledged_at: string | null;
  created_at: string;
}

export interface ListFlagsQuery {
  page?: number;
  limit?: number;
  severity?: FlagSeverity;
  userId?: string;
  resolved?: boolean;
}

export interface ListAlertsQuery {
  page?: number;
  limit?: number;
  severity?: FlagSeverity;
  source?: string;
  acknowledged?: boolean;
}

export interface CreateFlagPayload {
  userId: string;
  reason: string;
  severity?: FlagSeverity;
  category?: string;
  relatedDisputeId?: string;
  relatedTransactionId?: string;
  notes?: string;
}

export const flagService = {
  getStats: async (): Promise<ApiResponse<FlagStats>> => {
    const { data } = await clientApi.get('/flags/stats');
    return data;
  },

  listFlags: async (
    query: ListFlagsQuery = {},
  ): Promise<PaginatedResponse<FlagRow>> => {
    const { data } = await clientApi.get('/flags', { params: query });
    return data;
  },

  getFlag: async (id: string): Promise<ApiResponse<FlagRow>> => {
    const { data } = await clientApi.get(`/flags/${id}`);
    return data;
  },

  createFlag: async (payload: CreateFlagPayload): Promise<ApiResponse<FlagRow>> => {
    const { data } = await clientApi.post('/flags', payload);
    return data;
  },

  resolveFlag: async (
    id: string,
    resolutionNotes?: string,
  ): Promise<ApiResponse<FlagRow>> => {
    const { data } = await clientApi.post(`/flags/${id}/resolve`, {
      resolutionNotes,
    });
    return data;
  },

  listAlerts: async (
    query: ListAlertsQuery = {},
  ): Promise<PaginatedResponse<RiskAlertRow>> => {
    const { data } = await clientApi.get('/flags/alerts', { params: query });
    return data;
  },

  acknowledgeAlert: async (id: string): Promise<ApiResponse<void>> => {
    const { data } = await clientApi.post(`/flags/alerts/${id}/acknowledge`);
    return data;
  },
};
