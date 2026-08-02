import { create } from 'zustand';
import type { User, LoginRequest, RegisterRequest } from '../types';
import { loginUser, registerUser, getUserById, logoutUser } from '../api';

const toNumber = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const toString = (value: unknown, fallback: string): string => {
  return typeof value === 'string' ? value : fallback;
};

const toNullableString = (value: unknown): string | null => {
  return typeof value === 'string' ? value : null;
};

const normalizeUserData = (data: unknown): User => {
  const raw = typeof data === 'object' && data !== null ? data as Record<string, unknown> : {};

  return {
    Id: toNumber(raw.Id ?? raw.id, 0),
    Username: toString(raw.Username ?? raw.username, ''),
    Nickname: toString(raw.Nickname ?? raw.nickname, ''),
    Email: toString(raw.Email ?? raw.email, ''),
    Role: toString(raw.Role ?? raw.role, 'user'),
    TotalScore: toNumber(raw.TotalScore ?? raw.totalScore, 0),
    Level: toNumber(raw.Level ?? raw.level, 1),
    StreakDays: toNumber(raw.StreakDays ?? raw.streakDays, 0),
    LastStudyDate: toNullableString(raw.LastStudyDate ?? raw.lastStudyDate),
    CreatedAt: toString(raw.CreatedAt ?? raw.createdAt, new Date().toISOString()),
  };
};

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  authenticate: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  restoreSession: () => {
    try {
      const saved = localStorage.getItem('user');
      if (saved) {
        const userData = JSON.parse(saved);
        set({ user: normalizeUserData(userData) });
      }
    } catch (err) {
      console.error('restoreSession - error:', err);
      localStorage.removeItem('user');
    } finally {
      set({ loading: false });
    }
  },

  login: (userData) => {
    const normalized = normalizeUserData(userData);
    localStorage.setItem('user', JSON.stringify(normalized));
    set({ user: normalized });
  },

  authenticate: async (payload) => {
    const userData = await loginUser(payload);
    const normalized = normalizeUserData(userData);
    localStorage.setItem('user', JSON.stringify(normalized));
    set({ user: normalized });
  },

  register: async (payload) => {
    const userData = await registerUser(payload);
    const normalized = normalizeUserData(userData);
    localStorage.setItem('user', JSON.stringify(normalized));
    set({ user: normalized });
  },

  refreshUser: async () => {
    const current = useAuthStore.getState().user;
    if (!current?.Id) return;
    const fresh = await getUserById(current.Id);
    const normalized = normalizeUserData(fresh);
    localStorage.setItem('user', JSON.stringify(normalized));
    set({ user: normalized });
  },

  logout: async () => {
    try {
      await logoutUser();
    } catch {
      // Clear local session even if the server call fails
    }
    localStorage.removeItem('user');
    set({ user: null });
  }
}));