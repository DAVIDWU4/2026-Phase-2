import { render, screen, waitFor } from '@testing-library/react';
/// <reference types="vitest" />
import '@testing-library/jest-dom';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Leaderboard from './Leaderboard';
import { useAuthStore } from '../stores/authStore';
import { useLocaleStore } from '../stores/localeStore';

vi.mock('../api', () => ({
  getLeaderboard: vi.fn().mockResolvedValue([
    {
      UserId: 1,
      Amount: 150,
      Reason: 'Total Score',
      Username: 'alice',
      Nickname: 'Alice',
      Level: 2,
      StreakDays: 5,
    },
  ]),
  getAllBadges: vi.fn().mockResolvedValue([]),
  getUserUnlockedBadges: vi.fn().mockResolvedValue([]),
}));

describe('Leaderboard page', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'en' });
    useAuthStore.setState({ user: null, loading: false });
  });

  it('renders page title and leaderboard entries', async () => {
    render(
      <MemoryRouter>
        <Leaderboard />
      </MemoryRouter>
    );

    expect(screen.getByText('Score Leaderboard')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText(/150 pts/)).toBeInTheDocument();
    });
  });

  it('shows empty state when no entries returned', async () => {
    const { getLeaderboard } = await import('../api');
    vi.mocked(getLeaderboard).mockResolvedValueOnce([]);

    render(
      <MemoryRouter>
        <Leaderboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No users yet')).toBeInTheDocument();
    });
  });
});
