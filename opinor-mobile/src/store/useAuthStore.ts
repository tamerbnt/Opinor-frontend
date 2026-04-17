import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

import { UserProfile } from '../api/auth';

interface AuthState {
  accessToken: string | null;
  userProfile: UserProfile | null;
  signIn: (token: string, profile: UserProfile | null) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  userProfile: null,
  signIn: async (token, profile) => {
    await SecureStore.setItemAsync('accessToken', token);
    if (profile) {
      await SecureStore.setItemAsync('userProfile', JSON.stringify(profile));
    }
    set({ accessToken: token, userProfile: profile });
  },
  signOut: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('userProfile');
    set({ accessToken: null, userProfile: null });
  },
  updateUserProfile: (newProfile) => {
    set((state) => ({
      userProfile: state.userProfile
        ? { ...state.userProfile, ...newProfile } as UserProfile
        : null,
    }));
  },
}));
