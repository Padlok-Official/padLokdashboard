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

/** Reply shape of GET /auth/invitations/:token — populates the accept-invite page. */
export interface InvitationPreview {
  email: string;
  roleName: string;
  roleDescription: string | null;
  inviterName: string;
  expiresAt: string;
}

/** Matches the `reason` field the backend adds to 400 errors on the preview endpoint. */
export type InvitationInvalidReason = 'not_found' | 'expired' | 'accepted' | 'revoked';

export interface AcceptInvitePayload {
  token: string;
  name: string;
  password: string;
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

  /**
   * Preview an invitation before the user submits the accept form. Public
   * endpoint; the token itself is the capability. Backend returns 400 with
   * a typed `reason` for any invalid state — we surface that to callers so
   * the page can pick the right error view.
   */
  getInvitationPreview: async (
    token: string,
  ): Promise<ApiResponse<InvitationPreview>> => {
    const { data } = await apiClient.get<ApiResponse<InvitationPreview>>(
      `/auth/invitations/${encodeURIComponent(token)}`,
    );
    return data;
  },

  /** Consume an invitation: creates the admin + auto-logs them in. */
  acceptInvite: async (
    payload: AcceptInvitePayload,
  ): Promise<ApiResponse<LoginResponse>> => {
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/accept-invite',
      payload,
    );
    return data;
  },
};

export default authService;
