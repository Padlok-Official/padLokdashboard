/**
 * Admin + invitation hooks (react-query).
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import adminService from '@/services/admin-service';
import type {
  AdminListItem,
  AdminStatus,
  Invitation,
  InvitationStatus,
  InvitePayload,
  InviteResult,
  ListAdminsParams,
} from '@/services/admin-service';
import type { PaginatedResponse } from '@/types/api';

const ADMINS_KEY = (params: ListAdminsParams) => ['admins', params] as const;
const INVITATIONS_KEY = (status?: InvitationStatus) =>
  ['admins', 'invitations', status ?? 'all'] as const;

interface PaginatedResult<T> {
  items: T[];
  pagination: PaginatedResponse<T>['pagination'];
}

export const useAdmins = (params: ListAdminsParams = {}) =>
  useQuery<PaginatedResult<AdminListItem>>({
    queryKey: ADMINS_KEY(params),
    queryFn: async () => {
      const res = await adminService.list(params);
      if (!res.success) throw new Error(res.message ?? 'Failed to load admins');
      return { items: res.data, pagination: res.pagination };
    },
  });

export const useInvitations = (
  status?: InvitationStatus,
  page = 1,
  limit = 20,
) =>
  useQuery<PaginatedResult<Invitation>>({
    queryKey: INVITATIONS_KEY(status),
    queryFn: async () => {
      const res = await adminService.listInvitations({ status, page, limit });
      if (!res.success) throw new Error(res.message ?? 'Failed to load invitations');
      return { items: res.data, pagination: res.pagination };
    },
  });

export const useInviteAdmin = () => {
  const qc = useQueryClient();
  return useMutation<InviteResult, Error, InvitePayload>({
    mutationFn: async (payload) => {
      const res = await adminService.invite(payload);
      if (!res.success || !res.data) {
        throw new Error(res.message ?? 'Failed to send invitation');
      }
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admins', 'invitations'] });
    },
  });
};

export const useUpdateAdmin = () => {
  const qc = useQueryClient();
  return useMutation<
    AdminListItem,
    Error,
    { id: string; payload: { name?: string; status?: AdminStatus; roleId?: string } }
  >({
    mutationFn: async ({ id, payload }) => {
      const res = await adminService.update(id, payload);
      if (!res.success || !res.data) {
        throw new Error(res.message ?? 'Failed to update admin');
      }
      return res.data.admin;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admins'] });
    },
  });
};

export const useDeleteAdmin = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const res = await adminService.remove(id);
      if (!res.success) throw new Error(res.message ?? 'Failed to delete admin');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admins'] });
    },
  });
};

export const useResendInvitation = () => {
  const qc = useQueryClient();
  return useMutation<
    { expiresAt: string; emailResult: InviteResult['emailResult'] },
    Error,
    string
  >({
    mutationFn: async (id) => {
      const res = await adminService.resendInvitation(id);
      if (!res.success || !res.data) {
        throw new Error(res.message ?? 'Failed to resend invitation');
      }
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admins', 'invitations'] });
    },
  });
};

export const useRevokeInvitation = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const res = await adminService.revokeInvitation(id);
      if (!res.success) throw new Error(res.message ?? 'Failed to revoke');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admins', 'invitations'] });
    },
  });
};
