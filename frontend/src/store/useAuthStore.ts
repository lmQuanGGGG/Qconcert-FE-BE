import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/lib/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  getRole: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      
      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({ user, accessToken, refreshToken });
      },
      
      clearAuth: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, accessToken: null, refreshToken: null });
      },
      
      isAuthenticated: () => {
        return !!get().accessToken;
      },
      
      getRole: () => {
        const user = get().user;
        if (!user) return null;
        return user.roles?.[0] || user.role || 'Customer';
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
