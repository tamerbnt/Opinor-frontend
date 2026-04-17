import { apiClient } from './client';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  email?: string;
  phone?: string;
}

export interface UpdateBusinessInfoData {
  businessName?: string;
  businessCategory?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  logo?: string;
}

export interface UpdateSettingsData {
  language?: string;
  theme?: string;
  notificationsEnabled?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  emailFrequency?: string;
}

export const getProfile = async () => {
  const { data } = await apiClient.get('/users/profile');
  return data;
};

export const updateProfile = async (payload: UpdateProfileData) => {
  const { data } = await apiClient.patch('/users/profile', payload);
  return data;
};

export const updateBusinessInfo = async (payload: UpdateBusinessInfoData) => {
  const { data } = await apiClient.patch('/users/business-info', payload);
  return data;
};

export const updateSettings = async (payload: UpdateSettingsData) => {
  const { data } = await apiClient.patch('/users/settings', payload);
  return data;
};

export const getSettings = async () => {
  const { data } = await apiClient.get('/users/settings');
  return data;
};
