import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/useAuthStore';

// Assuming the NestJS backend runs locally. Use localhost for iOS, 10.0.2.2 for Android.
export const API_URL = 'http://10.0.2.2:3000/api/v1';

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

        // Request new tokens directly via axios to avoid interceptor loop
        const res = await axios.post(`${API_URL}/auth/refresh`, {}, {
          headers: { Authorization: `Bearer ${refreshToken}` } // or via body depending on API
        });
        
        const newAccessToken = res.data.access_token;
        const newRefreshToken = res.data.refresh_token;

        if(newAccessToken) await SecureStore.setItemAsync('accessToken', newAccessToken);
        if(newRefreshToken) await SecureStore.setItemAsync('refreshToken', newRefreshToken);

        // Sync Zustand store
        useAuthStore.getState().signIn(newAccessToken, useAuthStore.getState().userProfile);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, force logout
        useAuthStore.getState().signOut();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
