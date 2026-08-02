import { describe, expect, it } from 'vitest';
import {
  getAvatarGradient,
  getDisplayInitial,
  getDisplayName,
  normalizeBadge,
  normalizeLeaderboardEntry,
  normalizeUser,
} from './normalize';

describe('normalize utilities', () => {
  it('normalizeUser reads camelCase API fields', () => {
    const user = normalizeUser({
      id: 7,
      username: 'demo',
      nickname: 'Demo User',
      email: 'demo@test.com',
      totalScore: 88,
      level: 2,
      streakDays: 4,
    });

    expect(user.Id).toBe(7);
    expect(user.Username).toBe('demo');
    expect(user.TotalScore).toBe(88);
    expect(user.StreakDays).toBe(4);
  });

  it('normalizeLeaderboardEntry maps score fields', () => {
    const entry = normalizeLeaderboardEntry({
      userId: 3,
      amount: 200,
      username: 'bob',
      nickname: 'Bob',
      level: 3,
      streakDays: 10,
    });

    expect(entry.UserId).toBe(3);
    expect(entry.Amount).toBe(200);
    expect(entry.StreakDays).toBe(10);
  });

  it('normalizeBadge provides defaults for missing icon', () => {
    const badge = normalizeBadge({ id: 1, name: 'Test', description: 'Desc' });
    expect(badge.Icon).toBe('🏅');
    expect(badge.Name).toBe('Test');
  });

  it('getDisplayName prefers nickname over username', () => {
    expect(getDisplayName('Nick', 'user')).toBe('Nick');
    expect(getDisplayName('', 'user')).toBe('user');
    expect(getDisplayInitial('Alice', 'bob')).toBe('A');
  });

  it('getAvatarGradient returns consistent color for same username', () => {
    const a = getAvatarGradient('stable-user');
    const b = getAvatarGradient('stable-user');
    expect(a).toBe(b);
  });
});
