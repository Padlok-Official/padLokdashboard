import apiClient from './api-client';
import type { ApiResponse } from '@/types/api';
import type { AdminUser } from '@/types/user';

export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Shape returned by padlok-api POST /auth/login and /auth/refresh.
 * The access token goes to the axios Authorization header (via zustand);
 * the refresh token is persisted separately so we can rotate on 401.
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  admin: AdminUser;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

const authService = {
  login: async (payload: LoginPayload): Promise<ApiResponse<LoginResponse>> => {
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', payload);
    return data;
  },

  me: async (): Promise<ApiResponse<{ admin: AdminUser }>> => {
    const { data } = await apiClient.get<ApiResponse<{ admin: AdminUser }>>('/auth/me');
    return data;
  },

  refresh: async (refreshToken: string): Promise<ApiResponse<RefreshResponse>> => {
    const { data } = await apiClient.post<ApiResponse<RefreshResponse>>('/auth/refresh', {
      refreshToken,
    });
    return data;
  },

  logout: async (refreshToken?: string): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.post<ApiResponse<null>>('/auth/logout', {
      refreshToken: refreshToken ?? null,
    });
    return data;
  },
};

export default authService;
