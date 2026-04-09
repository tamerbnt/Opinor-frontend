import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  accessToken: string | null;
  userProfile: any | null;
  signIn: (token: string, profile: any) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  userProfile: null,
  signIn: async (token, profile) => {
    await SecureStore.setItemAsync('accessToken', token);
    set({ accessToken: token, userProfile: profile });
  },
  signOut: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    set({ accessToken: null, userProfile: null });
  },
}));
