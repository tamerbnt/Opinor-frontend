import { apiClient } from './client';

export interface LoginPayload {
  email: string;
  password?: string;
  code?: string;
}

export const login = async (payload: LoginPayload) => {
  const response = await apiClient.post('/auth/login', payload);
  return response.data;
};

export const getProfile = async () => {
  const response = await apiClient.get('/users/profile');
  return response.data;
};
