import apiClient from './api-client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

export type NotificationType =
  | 'warning'
  | 'dispute_update'
  | 'transaction'
  | 'announcement'
  | 'system';

export interface NotificationRow {
  id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  type: NotificationType;
  title: string;
  body: string;
  data: {
    channels?: { push?: boolean; sms?: boolean; email?: boolean };
    delivery_status?: string;
    [k: string]: unknown;
  } | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationStats {
  total_today: number;
  pending: number;
  failed: number;
  delivery_rate_pct: string;
  by_channel: Array<{ channel: string; sent: number; delivery_pct: string }>;
}

export interface BroadcastInput {
  type?: NotificationType;
  title: string;
  body: string;
  channels: { push?: boolean; email?: boolean };
  /** Also write an in-app notification row for every user. Defaults to true. */
  saveInApp?: boolean;
}

export interface BroadcastResult {
  in_app: { recipients: number } | null;
  delivery: {
    push?: { success: boolean; messageId?: string };
    email?: { recipients: number; sent: number; failed: number };
  } | null;
  /** Present when push/email delivery failed (in-app rows may still be saved). */
  delivery_error?: string;
}

const notificationService = {
  getStats: async (): Promise<ApiResponse<NotificationStats>> => {
    const { data } = await apiClient.get<ApiResponse<NotificationStats>>('/notifications/stats');
    return data;
  },

  list: async (params?: {
    page?: number;
    limit?: number;
    type?: NotificationType;
  }): Promise<PaginatedResponse<NotificationRow>> => {
    const { data } = await apiClient.get<PaginatedResponse<NotificationRow>>('/notifications', {
      params,
    });
    return data;
  },

  broadcast: async (input: BroadcastInput): Promise<ApiResponse<BroadcastResult>> => {
    const { data } = await apiClient.post<ApiResponse<BroadcastResult>>(
      '/notifications/broadcast',
      input,
    );
    return data;
  },
};

export default notificationService;
