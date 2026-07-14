import apiClient from './api-client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

export type AdminStatus = 'active' | 'away' | 'inactive' | 'suspended';
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface AdminListItem {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  status: AdminStatus;
  role: { id: string; name: string };
  lastActiveAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: { id: string; name: string };
  status: InvitationStatus;
  invitedBy: { id: string; name: string | null; email: string | null } | null;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
}

export interface InvitePayload {
  email: string;
  roleId: string;
}

export interface InviteResult {
  invitationId: string;
  email: string;
  roleName: string;
  expiresAt: string;
  emailResult: {
    sent: boolean;
    inviteUrl: string;
    devToken?: string;
  };
}

export interface ListAdminsParams {
  search?: string;
  roleId?: string;
  status?: AdminStatus;
  page?: number;
  limit?: number;
}

export interface AuditLogItem {
  id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  details: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  admin: { id: string; name: string; email: string } | null;
}

export interface ListAuditLogsParams {
  search?: string;
  action?: string;
  adminId?: string;
  page?: number;
  limit?: number;
}

const adminService = {
  list: async (
    params: ListAdminsParams = {},
  ): Promise<PaginatedResponse<AdminListItem>> => {
    const { data } = await apiClient.get<PaginatedResponse<AdminListItem>>('/admins', {
      params,
    });
    return data;
  },

  get: async (id: string): Promise<ApiResponse<{ admin: AdminListItem }>> => {
    const { data } = await apiClient.get<ApiResponse<{ admin: AdminListItem }>>(
      `/admins/${id}`,
    );
    return data;
  },

  update: async (
    id: string,
    payload: { name?: string; status?: AdminStatus; roleId?: string },
  ): Promise<ApiResponse<{ admin: AdminListItem }>> => {
    const { data } = await apiClient.patch<ApiResponse<{ admin: AdminListItem }>>(
      `/admins/${id}`,
      payload,
    );
    return data;
  },

  remove: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/admins/${id}`);
    return data;
  },

  invite: async (payload: InvitePayload): Promise<ApiResponse<InviteResult>> => {
    const { data } = await apiClient.post<ApiResponse<InviteResult>>(
      '/admins/invite',
      payload,
    );
    return data;
  },

  listAuditLogs: async (
    params: ListAuditLogsParams = {},
  ): Promise<PaginatedResponse<AuditLogItem>> => {
    const { data } = await apiClient.get<PaginatedResponse<AuditLogItem>>(
      '/admins/audit-logs',
      { params },
    );
    return data;
  },

  listInvitations: async (
    params: { status?: InvitationStatus; page?: number; limit?: number } = {},
  ): Promise<PaginatedResponse<Invitation>> => {
    const { data } = await apiClient.get<PaginatedResponse<Invitation>>(
      '/admins/invitations',
      { params },
    );
    return data;
  },

  resendInvitation: async (
    id: string,
  ): Promise<ApiResponse<{ expiresAt: string; emailResult: InviteResult['emailResult'] }>> => {
    const { data } = await apiClient.post<
      ApiResponse<{ expiresAt: string; emailResult: InviteResult['emailResult'] }>
    >(`/admins/invitations/${id}/resend`);
    return data;
  },

  revokeInvitation: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete<ApiResponse<null>>(
      `/admins/invitations/${id}`,
    );
    return data;
  },
};

export default adminService;
