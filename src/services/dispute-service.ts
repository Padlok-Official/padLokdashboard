import apiClient from './api-client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

export type DisputeStatus =
  | 'open'
  | 'under_review'
  | 'resolved_refund'
  | 'resolved_release'
  | 'closed';

export interface DisputeRow {
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

export interface DisputeDetail extends DisputeRow {
  escrow_amount: string | null;
  escrow_currency: string | null;
  escrow_reference: string | null;
  escrow_item_title: string | null;
  buyer_id: string | null;
  buyer_name: string | null;
  buyer_email: string | null;
  seller_id: string | null;
  seller_name: string | null;
  seller_email: string | null;
}

export interface MessageTemplate {
  id: string;
  title: string;
  body: string;
}

export interface DisputeMessage {
  id: string;
  dispute_id: string;
  recipient_id: string;
  admin_id: string;
  template_id: string | null;
  body: string;
  channel: string;
  created_at: string;
}

export interface DisputeTimelineEvent {
  at: string;
  kind: 'escrow_created' | 'funded' | 'delivery_confirmed' | 'buyer_confirmed' | 'dispute_raised' | 'dispute_resolved';
  actor_id: string | null;
  actor_name: string | null;
  detail: string;
}

const disputeService = {
  getDispute: async (id: string): Promise<ApiResponse<DisputeDetail>> => {
    const { data } = await apiClient.get<ApiResponse<DisputeDetail>>(`/escrow/disputes/${id}`);
    return data;
  },

  getDisputeTimeline: async (id: string): Promise<ApiResponse<DisputeTimelineEvent[]>> => {
    const { data } = await apiClient.get<ApiResponse<DisputeTimelineEvent[]>>(`/escrow/disputes/${id}/timeline`);
    return data;
  },

  payoutDispute: async (id: string, note?: string): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post<ApiResponse<any>>(`/escrow/disputes/${id}/payout`, {
      note,
    });
    return data;
  },

  refundDispute: async (id: string, note?: string): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post<ApiResponse<any>>(`/escrow/disputes/${id}/refund`, {
      note,
    });
    return data;
  },

  penalizeUser: async (
    id: string,
    targetUserId: string,
    reason: string,
    severity: 'critical' | 'warning' | 'info'
  ): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post<ApiResponse<any>>(`/escrow/disputes/${id}/penalize`, {
      targetUserId,
      reason,
      severity,
    });
    return data;
  },

  flagDispute: async (id: string, flagType: string, note?: string): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post<ApiResponse<any>>(`/escrow/disputes/${id}/flag`, {
      flagType,
      note,
    });
    return data;
  },

  getMessageTemplates: async (): Promise<ApiResponse<MessageTemplate[]>> => {
    const { data } = await apiClient.get<ApiResponse<MessageTemplate[]>>(
      `/escrow/disputes/message-templates`
    );
    return data;
  },

  sendMessage: async (
    id: string,
    recipient: 'buyer' | 'seller',
    body: string,
    channel: 'email' | 'sms' | 'in-app',
    templateId?: string
  ): Promise<ApiResponse<DisputeMessage>> => {
    const { data } = await apiClient.post<ApiResponse<DisputeMessage>>(
      `/escrow/disputes/${id}/messages`,
      { recipient, body, channel, templateId }
    );
    return data;
  },

  getMessages: async (id: string): Promise<ApiResponse<DisputeMessage[]>> => {
    const { data } = await apiClient.get<ApiResponse<DisputeMessage[]>>(
      `/escrow/disputes/${id}/messages`
    );
    return data;
  },
};

export default disputeService;
