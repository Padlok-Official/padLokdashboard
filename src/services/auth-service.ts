import apiClient from './api-client';
import type { ApiResponse } from '@/types/api';
import type { AdminUser } from '@/types/user';

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: AdminUser;
}

const authService = {
  login: async (payload: LoginPayload): Promise<ApiResponse<LoginResponse>> => {
    const { data } = await apiClient.post('/auth/login', payload);
    return data;
  },

  me: async (): Promise<ApiResponse<AdminUser>> => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.post('/auth/logout');
    return data;
  },
};

export default authService;
