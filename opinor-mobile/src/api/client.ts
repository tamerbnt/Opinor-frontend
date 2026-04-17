import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/useAuthStore';

// Platform-aware base URL: Android emulator uses 10.0.2.2, iOS uses localhost.
// In production, set EXPO_PUBLIC_API_URL in your environment / EAS secrets.
const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? `http://${DEV_HOST}:3000/api/v1`;

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject Bearer Token
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 Token Refresh Logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (!refreshToken) throw new Error('No refresh token available');

        // Backend expects { refreshToken } in the request body (RefreshTokenDto)
        // Do NOT send it as an Authorization header — that is ignored by the backend.
        const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });

        // Backend generateTokens() returns camelCase: { accessToken, refreshToken }
        const newAccessToken = res.data.accessToken;
        const newRefreshToken = res.data.refreshToken;

        if (newAccessToken) await SecureStore.setItemAsync('accessToken', newAccessToken);
        if (newRefreshToken) await SecureStore.setItemAsync('refreshToken', newRefreshToken);

        // Sync Zustand store
        useAuthStore.getState().signIn(newAccessToken, useAuthStore.getState().userProfile);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed — force logout
        useAuthStore.getState().signOut();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
