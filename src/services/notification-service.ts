/**
 * Admin notification endpoints. Mirrors padlok-api's /notifications surface
 * (see ADMIN_CLIENT_API_DOCS.MD §9).
 *
 * Delivery workers aren't live yet — the backend stores the row and the
 * `data.channels` object, and a future worker will fan it out to push/SMS/
 * email. Until then "sent" means "written to the in-app inbox".
 */

import clientApi from '@/services/client-service';
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
  data: Record<string, unknown> | null;
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

export interface SendNotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  userId?: string;
  userIds?: string[];
  broadcast?: boolean;
  channels?: { push?: boolean; sms?: boolean; email?: boolean };
  data?: Record<string, unknown>;
}

export interface SendNotificationResult {
  recipients: number;
  notification_ids: string[];
}

export interface ListNotificationsQuery {
  page?: number;
  limit?: number;
  type?: NotificationType;
  userId?: string;
  unread_only?: boolean;
}

export const notificationService = {
  getStats: async (): Promise<ApiResponse<NotificationStats>> => {
    const { data } = await clientApi.get('/notifications/stats');
    return data;
  },

  list: async (
    query: ListNotificationsQuery = {},
  ): Promise<PaginatedResponse<NotificationRow>> => {
    const { data } = await clientApi.get('/notifications', { params: query });
    return data;
  },

  send: async (
    payload: SendNotificationPayload,
  ): Promise<ApiResponse<SendNotificationResult>> => {
    const { data } = await clientApi.post('/notifications/send', payload);
    return data;
  },

  markRead: async (id: string): Promise<ApiResponse<void>> => {
    const { data } = await clientApi.post(`/notifications/${id}/read`);
    return data;
  },
};
