/**
 * Role + permission hooks.
 *
 * useRoles()           — live list of roles with permission/user counts
 * useRole(id)          — detailed role with its permission set
 * usePermissions()     — catalog of all permissions (for Create Role modal)
 * useCreateRole()      — mutation, invalidates useRoles on success
 * useUpdateRole()      — mutation, invalidates useRoles + useRole
 * useDeleteRole()      — mutation, invalidates useRoles
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import roleService from '@/services/role-service';
import type {
  Role,
  RoleDetail,
  PermissionCategory,
  CreateRolePayload,
  UpdateRolePayload,
} from '@/services/role-service';

const ROLES_KEY = ['roles'] as const;
const ROLE_KEY = (id: string) => ['roles', id] as const;
const PERMISSIONS_KEY = ['permissions'] as const;

const unwrap = <T>(res: { success: boolean; data?: T; message?: string }, what: string): T => {
  if (!res.success || !res.data) {
    throw new Error(res.message ?? `Failed to load ${what}`);
  }
  return res.data;
};

export const useRoles = () =>
  useQuery<Role[]>({
    queryKey: ROLES_KEY,
    queryFn: async () => unwrap(await roleService.list(), 'roles').roles,
  });

export const useRole = (id: string | undefined) =>
  useQuery<RoleDetail>({
    queryKey: id ? ROLE_KEY(id) : ['roles', 'none'],
    queryFn: async () => unwrap(await roleService.get(id as string), 'role').role,
    enabled: Boolean(id),
  });

export const usePermissions = () =>
  useQuery<PermissionCategory[]>({
    queryKey: PERMISSIONS_KEY,
    queryFn: async () =>
      unwrap(await roleService.permissions(), 'permissions').categories,
    staleTime: 10 * 60 * 1000, // rarely changes
  });

export const useCreateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateRolePayload) =>
      unwrap(await roleService.create(payload), 'create role').role,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ROLES_KEY });
    },
  });
};

export const useUpdateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateRolePayload }) =>
      unwrap(await roleService.update(id, payload), 'update role').role,
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ROLES_KEY });
      qc.invalidateQueries({ queryKey: ROLE_KEY(id) });
    },
  });
};

export const useDeleteRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await roleService.remove(id);
      if (!res.success) throw new Error(res.message ?? 'Failed to delete role');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ROLES_KEY });
    },
  });
};
