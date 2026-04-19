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

// Shape the admin-api (padlok-api) returns — camelCase, no is_admin flag.
interface AdminApiAdmin {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  status?: string;
  role?: { id: string; name: string } | null;
  permissions?: string[];
}

interface AdminApiLoginData {
  accessToken?: string;
  refreshToken?: string;
  admin?: AdminApiAdmin;
  // legacy / dev-shape fallbacks
  token?: string;
  user?: AdminUser;
}

const REFRESH_TOKEN_KEY = 'padlok-admin-refresh-token';

export const getRefreshToken = (): string | null =>
  typeof window === 'undefined' ? null : window.localStorage.getItem(REFRESH_TOKEN_KEY);

const setRefreshToken = (token: string | null): void => {
  if (typeof window === 'undefined') return;
  if (token) window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
  else window.localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// The admin-api exposes admin membership via `role.name === 'Super Admin'`
// or the presence of admin-only permissions. The dashboard just needs a
// boolean, so we derive one here.
const isAdminFromRole = (a: AdminApiAdmin): boolean => {
  if (a.role?.name?.toLowerCase().includes('admin')) return true;
  if ((a.permissions?.length ?? 0) > 0) return true;
  return false;
};

const normalizeAdmin = (a: AdminApiAdmin | AdminUser | undefined): AdminUser | undefined => {
  if (!a) return undefined;
  // Already in dashboard shape (from dev fallback or legacy backend)
  if ('avatar_url' in a && 'is_admin' in a) return a as AdminUser;
  const admin = a as AdminApiAdmin;
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    avatar_url: admin.avatarUrl ?? null,
    is_admin: isAdminFromRole(admin),
  };
};

const authService = {
  login: async (payload: LoginPayload): Promise<ApiResponse<LoginResponse>> => {
    const { data } = await apiClient.post<ApiResponse<AdminApiLoginData>>('/auth/login', payload);
    if (!data?.success || !data.data) {
      return { success: false, message: data?.message ?? 'Login failed' };
    }

    const raw = data.data;
    const token = raw.accessToken ?? raw.token;
    const user = normalizeAdmin(raw.admin ?? raw.user);

    if (raw.refreshToken) setRefreshToken(raw.refreshToken);

    if (!token || !user) {
      return {
        success: false,
        message: 'Login succeeded but the response was missing a token or admin profile.',
      };
    }

    return {
      success: true,
      message: data.message,
      data: { token, user },
    };
  },

  me: async (): Promise<ApiResponse<AdminUser>> => {
    const { data } = await apiClient.get<ApiResponse<AdminApiAdmin | { admin: AdminApiAdmin } | AdminUser>>(
      '/auth/me',
    );
    if (!data?.success || !data.data) {
      return { success: false, message: data?.message ?? 'Not authenticated' };
    }

    const payload = data.data as { admin?: AdminApiAdmin } & AdminApiAdmin & AdminUser;
    const normalized = normalizeAdmin(payload.admin ?? payload);
    if (!normalized) {
      return { success: false, message: 'Malformed /auth/me response' };
    }
    return { success: true, message: data.message, data: normalized };
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const refreshToken = getRefreshToken();
    try {
      const { data } = await apiClient.post<ApiResponse<null>>('/auth/logout', { refreshToken });
      return data;
    } finally {
      setRefreshToken(null);
    }
  },
};

export default authService;
