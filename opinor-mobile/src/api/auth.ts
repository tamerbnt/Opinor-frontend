import { apiClient } from './client';

// Fields from GET /users/profile (full profile, editable by user)
export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  businessName: string;
  businessCategory?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  phone?: string;
  avatar?: string;
  logo?: string;
  uniqueCode?: string;
  role?: 'admin' | 'business_owner';
}

// Fields from GET /auth/me (auth entity only — stripped of password/token fields)
// Does NOT include businessCategory, logo, businessPhone etc. Use /users/profile for those.
export interface AuthMeResponse {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  businessName: string;
  uniqueCode?: string;
  avatar?: string;
  role?: 'admin' | 'business_owner';
  isActive?: boolean;
  createdAt?: string;
}

export const getCurrentProfile = async (): Promise<AuthMeResponse> => {
  const { data } = await apiClient.get('/auth/me');
  // API returns { success: true, data: { ...profile } }
  return data.data;
};

export const changePassword = async (payload: any) => {
  const { data } = await apiClient.post('/auth/change-password', payload);
  return data;
};
