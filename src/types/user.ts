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

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
  avatar_url: string | null;
}
