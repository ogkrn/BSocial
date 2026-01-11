import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  email: string;
  fullName: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  branch?: string;
  year?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingEmail: string | null;
  
  login: (user: User, accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  setPendingEmail: (email: string | null) => void;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  pendingEmail: null,

  login: async (user, accessToken) => {
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    await SecureStore.setItemAsync('accessToken', accessToken);
    set({
      user,
      accessToken,
      isAuthenticated: true,
      pendingEmail: null,
    });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('user');
    await SecureStore.deleteItemAsync('accessToken');
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      pendingEmail: null,
    });
  },

  setPendingEmail: (email) => set({ pendingEmail: email }),

  loadStoredAuth: async () => {
    try {
      const userStr = await SecureStore.getItemAsync('user');
      const accessToken = await SecureStore.getItemAsync('accessToken');
      
      if (userStr && accessToken) {
        const user = JSON.parse(userStr);
        set({
          user,
          accessToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading auth:', error);
      set({ isLoading: false });
    }
  },
}));
