import { render, screen, waitFor } from '@testing-library/react';
/// <reference types="vitest" />
import '@testing-library/jest-dom';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../stores/authStore';
import { useLocaleStore } from '../stores/localeStore';
import Badges from './Badges';

vi.mock('../api', () => ({
  getAllBadges: vi.fn().mockResolvedValue([
    { Id: 1, Name: 'First Step', Description: 'Complete your first study session', RequiredScore: 0, Icon: '🌱' },
    { Id: 2, Name: 'Rising Star', Description: 'Earn 100 total points', RequiredScore: 100, Icon: '⭐' },
  ]),
  getUserUnlockedBadges: vi.fn().mockResolvedValue([
    { UserId: 1, BadgeId: 1, UnlockedAt: '2026-07-29T00:00:00.000Z' },
  ]),
}));

const defaultUser = {
  Id: 1,
  Username: 'test',
  Nickname: 'Tester',
  Email: 'test@example.com',
  Role: 'user',
  TotalScore: 120,
  Level: 1,
  StreakDays: 3,
  LastStudyDate: null,
  CreatedAt: '2026-07-29T00:00:00.000Z',
};

describe('Badges page', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, loading: false });
    useLocaleStore.setState({ locale: 'en' });
  });

  it('renders unlocked badge count from API data', async () => {
    useAuthStore.setState({ user: defaultUser, loading: false });

    render(<Badges />);

    await waitFor(() => {
      expect(screen.getByText('1/2 unlocked')).toBeInTheDocument();
    });
  });
});
