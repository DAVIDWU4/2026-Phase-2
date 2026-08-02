/// <reference types="vitest" />
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { useAuthStore } from './authStore';
import { loginUser } from '../api';

vi.mock('../api', () => ({
  loginUser: vi.fn(),
  logoutUser: vi.fn().mockResolvedValue(undefined),
  getUserById: vi.fn(),
  registerUser: vi.fn(),
}));

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, loading: false });
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('authenticate sets user and localStorage', async () => {
    const fakeUser = {
      Id: 1,
      Username: 'test',
      Nickname: 'Tester',
      Email: 'test@example.com',
      Role: 'user',
      TotalScore: 42,
      Level: 1,
      StreakDays: 0,
      LastStudyDate: null,
      CreatedAt: '2026-07-29T00:00:00.000Z',
    };

    const mockedLoginUser = loginUser as unknown as { mockResolvedValue: (value: unknown) => void };
    mockedLoginUser.mockResolvedValue(fakeUser);

    await useAuthStore.getState().authenticate({ Username: 'test', Password: 'pass' });

    expect(useAuthStore.getState().user).toEqual(fakeUser);
    expect(localStorage.getItem('user')).toContain('"Username":"test"');
  });

  it('logout clears user and localStorage', async () => {
    useAuthStore.setState({ user: {
      Id: 1,
      Username: 'test',
      Nickname: 'Tester',
      Email: 'test@example.com',
      Role: 'user',
      TotalScore: 0,
      Level: 1,
      StreakDays: 0,
      LastStudyDate: null,
      CreatedAt: '2026-07-29T00:00:00.000Z',
    }, loading: false });

    localStorage.setItem('user', JSON.stringify(useAuthStore.getState().user));
    await useAuthStore.getState().logout();

    expect(useAuthStore.getState().user).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
