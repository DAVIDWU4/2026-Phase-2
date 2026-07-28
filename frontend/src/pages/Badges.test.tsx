import { render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { useAuthStore } from '../stores/authStore';
import Badges from './Badges';

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
    useAuthStore.setState({ user: null, loading: false }, true);
  });

  it('renders unlocked badge count based on user score', () => {
    useAuthStore.setState({ user: defaultUser, loading: false }, true);

    render(<Badges />);

    expect(screen.getByText('6/8 unlocked')).toBeInTheDocument();
  });
});
