import type { User, Badge, UserBadge } from '../types';

const avatarColors = [
  'from-red-400 to-red-600',
  'from-orange-400 to-orange-600',
  'from-yellow-400 to-yellow-600',
  'from-green-400 to-green-600',
  'from-teal-400 to-teal-600',
  'from-blue-400 to-blue-600',
  'from-indigo-400 to-indigo-600',
  'from-purple-400 to-purple-600',
];

export function getAvatarGradient(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export function getDisplayInitial(nickname?: string, username?: string): string {
  const source = nickname?.trim() || username?.trim() || '?';
  return source.charAt(0).toUpperCase();
}

export function getDisplayName(nickname?: string, username?: string, fallback = 'User'): string {
  return nickname?.trim() || username?.trim() || fallback;
}

export function normalizeUser(data: unknown): User {
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
}

export function normalizeBadge(data: unknown): Badge {
  const raw = typeof data === 'object' && data !== null ? data as Record<string, unknown> : {};
  return {
    Id: toNumber(raw.Id ?? raw.id, 0),
    Name: toString(raw.Name ?? raw.name, ''),
    Icon: toString(raw.Icon ?? raw.icon, '🏅'),
    Description: toString(raw.Description ?? raw.description, ''),
    RequiredScore: toNumber(raw.RequiredScore ?? raw.requiredScore, 0),
    CreatedAt: toString(raw.CreatedAt ?? raw.createdAt, ''),
  };
}

export function normalizeUserBadge(data: unknown): UserBadge {
  const raw = typeof data === 'object' && data !== null ? data as Record<string, unknown> : {};
  return {
    UserId: toNumber(raw.UserId ?? raw.userId, 0),
    BadgeId: toNumber(raw.BadgeId ?? raw.badgeId, 0),
    UnlockedAt: toString(raw.UnlockedAt ?? raw.unlockedAt, new Date().toISOString()),
  };
}

export interface LeaderboardEntry {
  UserId: number;
  Amount: number;
  Reason: string;
  Username: string;
  Nickname: string;
  Level: number;
  StreakDays: number;
}

export function normalizeLeaderboardEntry(data: unknown): LeaderboardEntry {
  const raw = typeof data === 'object' && data !== null ? data as Record<string, unknown> : {};
  return {
    UserId: toNumber(raw.UserId ?? raw.userId, 0),
    Amount: toNumber(raw.Amount ?? raw.amount, 0),
    Reason: toString(raw.Reason ?? raw.reason, 'Total Score'),
    Username: toString(raw.Username ?? raw.username, ''),
    Nickname: toString(raw.Nickname ?? raw.nickname, ''),
    Level: toNumber(raw.Level ?? raw.level, 1),
    StreakDays: toNumber(raw.StreakDays ?? raw.streakDays, 0),
  };
}

function toNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function toString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function toNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}
