import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  pendingEmail: string | null; // For OTP verification flow
  
  // Actions
  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  setPendingEmail: (email: string | null) => void;
  login: (user: User, accessToken: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      pendingEmail: null,

      setUser: (user) => set({ user }),
      
      setAccessToken: (accessToken) => set({ accessToken }),
      
      setPendingEmail: (email) => set({ pendingEmail: email }),
      
      login: (user, accessToken) => set({
        user,
        accessToken,
        isAuthenticated: true,
        pendingEmail: null,
      }),
      
      logout: () => set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        pendingEmail: null,
      }),
      
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      })),
    }),
    {
      name: 'bsocial-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
