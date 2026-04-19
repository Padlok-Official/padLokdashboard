import apiClient from './api-client';
import type { ApiResponse } from '@/types/api';

export interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissionCount: number;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermission {
  key: string;
  label: string;
  category: string;
}

export interface RoleDetail {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: RolePermission[];
  createdAt: string;
  updatedAt: string;
}

export interface PermissionCategory {
  category: string;
  permissions: Array<{
    key: string;
    label: string;
    description: string | null;
  }>;
}

export interface CreateRolePayload {
  name: string;
  description?: string | null;
  permissionKeys: string[];
}

export interface UpdateRolePayload {
  name?: string;
  description?: string | null;
  permissionKeys?: string[];
}

const roleService = {
  list: async (): Promise<ApiResponse<{ roles: Role[] }>> => {
    const { data } = await apiClient.get<ApiResponse<{ roles: Role[] }>>('/roles');
    return data;
  },

  get: async (id: string): Promise<ApiResponse<{ role: RoleDetail }>> => {
    const { data } = await apiClient.get<ApiResponse<{ role: RoleDetail }>>(`/roles/${id}`);
    return data;
  },

  create: async (
    payload: CreateRolePayload,
  ): Promise<ApiResponse<{ role: RoleDetail }>> => {
    const { data } = await apiClient.post<ApiResponse<{ role: RoleDetail }>>(
      '/roles',
      payload,
    );
    return data;
  },

  update: async (
    id: string,
    payload: UpdateRolePayload,
  ): Promise<ApiResponse<{ role: RoleDetail }>> => {
    const { data } = await apiClient.patch<ApiResponse<{ role: RoleDetail }>>(
      `/roles/${id}`,
      payload,
    );
    return data;
  },

  remove: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/roles/${id}`);
    return data;
  },

  permissions: async (): Promise<
    ApiResponse<{ categories: PermissionCategory[] }>
  > => {
    const { data } = await apiClient.get<
      ApiResponse<{ categories: PermissionCategory[] }>
    >('/permissions');
    return data;
  },
};

export default roleService;
