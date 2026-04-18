import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AdminUser } from '@/types/user';

interface AuthState {
  token: string | null; // JWT access token (sent on every request)
  refreshToken: string | null; // Long-lived, used to rotate access tokens
  admin: AdminUser | null;
  isAuthenticated: boolean;
  /** Called on successful login. `refreshToken` is optional for legacy/dev paths. */
  setAuth: (token: string, admin: AdminUser, refreshToken?: string) => void;
  /** Update just the token pair after a refresh. */
  setTokens: (token: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      admin: null,
      isAuthenticated: false,
      setAuth: (token, admin, refreshToken) =>
        set({
          token,
          admin,
          refreshToken: refreshToken ?? null,
          isAuthenticated: true,
        }),
      setTokens: (token, refreshToken) => set({ token, refreshToken }),
      logout: () =>
        set({
          token: null,
          refreshToken: null,
          admin: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'padlok-admin-auth',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
