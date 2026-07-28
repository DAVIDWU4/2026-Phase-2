import { create } from 'zustand';
import type { User, LoginRequest, RegisterRequest } from '../types';
import { loginUser, registerUser } from '../api';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => void;
  restoreSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  restoreSession: () => {
    try {
      const saved = localStorage.getItem('user');
      console.log('restoreSession - saved from localStorage:', saved);
      if (saved) {
        const userData = JSON.parse(saved) as User;
        console.log('restoreSession - parsed user data:', userData);
        set({ user: userData });
      }
    } catch (err) {
      console.error('restoreSession - error:', err);
      localStorage.removeItem('user');
    } finally {
      set({ loading: false });
      console.log('restoreSession - completed, loading set to false');
    }
  },

  login: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData });
  },

  register: async (payload) => {
    const userData = await registerUser(payload);
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData });
  },

  logout: () => {
    localStorage.removeItem('user');
    set({ user: null });
  }
}));