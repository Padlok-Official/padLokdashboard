export interface User {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  is_admin: boolean;
  is_verified: boolean;
  avatar_url: string | null;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export type UserStatus = 'active' | 'suspended' | 'deactivated' | 'pending';

/**
 * Authenticated admin profile returned by padlok-api /auth/login and /auth/me.
 * Mirrors the backend DTO exactly (camelCase).
 */
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  status?: 'active' | 'away' | 'inactive' | 'suspended';
  role?: {
    id: string;
    name: string;
    description: string | null;
    isSystem: boolean;
  };
  permissions?: string[];
  lastLoginAt?: string | null;
  createdAt?: string;

  // Legacy fields kept for backwards-compat with the dev fallback login.
  // Prefer `role.name === 'Super Admin'` and the `permissions` array for
  // authorization checks going forward.
  is_admin?: boolean;
  avatar_url?: string | null;
}
