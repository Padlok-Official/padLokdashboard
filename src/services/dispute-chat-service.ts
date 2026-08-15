import apiClient from './api-client';
import type { ApiResponse } from '@/types/api';
import type { DisputeDetail } from './dispute-service';

export type DisputeChatSenderType = 'buyer' | 'seller' | 'admin';

export interface DisputeConversationSummary {
  id: string;
  status: 'active' | 'closed';
  assigned_admin_id: string | null;
}

export interface DisputeChatMessage {
  id: string;
  dispute_id: string;
  conversation_id: string;
  sender_type: DisputeChatSenderType;
  sender_id: string;
  admin_id: string | null;
  body: string;
  channel: string;
  created_at: string;
}

export interface DisputeChatHistory {
  dispute: DisputeDetail;
  conversation: DisputeConversationSummary | null;
  messages: DisputeChatMessage[];
  has_more: boolean;
}

export interface DisputeChatTicket {
  ticket: string;
  expires_in: number;
  conversation: DisputeConversationSummary;
}

const disputeChatService = {
  /**
   * Read-only chat history + dispute context, served entirely by padlok-api.
   * Safe to call for resolved disputes too (no socket connection required).
   */
  getDisputeChat: async (
    id: string,
    params?: { limit?: number; before?: string }
  ): Promise<ApiResponse<DisputeChatHistory>> => {
    const { data } = await apiClient.get<ApiResponse<DisputeChatHistory>>(
      `/escrow/disputes/${id}/chat`,
      { params }
    );
    return data;
  },

  /**
   * Mints a short-lived (60s) single-purpose ticket for connecting directly
   * to padlokbackend's Socket.IO server. Also claims the dispute for the
   * calling admin if unclaimed. Must be called fresh immediately before
   * every connect attempt (including reconnects) — never cache the ticket.
   */
  getDisputeChatTicket: async (id: string): Promise<ApiResponse<DisputeChatTicket>> => {
    const { data } = await apiClient.post<ApiResponse<DisputeChatTicket>>(
      `/escrow/disputes/${id}/chat/ticket`
    );
    return data;
  },
};

export default disputeChatService;
