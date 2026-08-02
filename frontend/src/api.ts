import type {
  ScoreEntry, User, StudyRecord, Badge, LoginRequest,
  RegisterRequest, PasswordResetRequest, PasswordResetConfirmRequest,
  NewScoreEntry, NewStudyRecord, UserBadge
} from './types'
import {
  normalizeUser,
  normalizeBadge,
  normalizeUserBadge,
  normalizeLeaderboardEntry,
  type LeaderboardEntry,
} from './utils/normalize'

export type { LeaderboardEntry }

const API_ROOT = import.meta.env.VITE_API_ROOT ?? 'http://localhost:5000/api'

const toNumber = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
}

const toString = (value: unknown, fallback: string): string => {
  return typeof value === 'string' ? value : fallback
}

const toNullableString = (value: unknown): string | null => {
  return typeof value === 'string' ? value : null
}

function normalizeStudyRecord(data: unknown): StudyRecord {
  const raw = typeof data === 'object' && data !== null ? data as Record<string, unknown> : {}

  return {
    Id: toNumber(raw.Id ?? raw.id, 0),
    UserId: toNumber(raw.UserId ?? raw.userId, 0),
    StudyDate: toString(raw.StudyDate ?? raw.studyDate, new Date().toISOString()),
    DurationMinutes: toNumber(raw.DurationMinutes ?? raw.durationMinutes, 0),
    Subject: toString(raw.Subject ?? raw.subject, ''),
    EarnedScore: toNumber(raw.EarnedScore ?? raw.earnedScore, 0),
    StreakCount: toNumber(raw.StreakCount ?? raw.streakCount, 0),
    Notes: toNullableString(raw.Notes ?? raw.notes),
  }
}

// General fetch wrapper for headers and error handling.
async function apiFetch<T>(url: string, init?: RequestInit): Promise<T | undefined> {
  const fullUrl = `${API_ROOT}${url}`
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    // JWT auth token can be added here later.
    // 'Authorization': `Bearer ${useAuthStore.getState().token}`
  }

  const res = await fetch(fullUrl, {
    headers,
    credentials: "include",
    ...init
  })

  if (!res.ok) {
    let errMsg = 'Request failed.'
    try {
      const text = await res.text()
      try {
        const parsed = JSON.parse(text)
        if (parsed.errors && typeof parsed.errors === 'object') {
          const firstKey = Object.keys(parsed.errors)[0]
          const firstMsg = parsed.errors[firstKey]?.[0]
          if (firstMsg) errMsg = firstMsg
        } else if (parsed.message) {
          errMsg = parsed.message
        } else if (typeof parsed === 'string') {
          errMsg = parsed
        }
      } catch {
        errMsg = text || `Request failed (${res.status})`
      }
    } catch {
      errMsg = `Request failed (${res.status})`
    }
    throw new Error(errMsg)
  }

  // DELETE 204 No Content
  if (res.status === 204) return undefined
  return res.json()
}

//ScoreEntry
export async function getScores(): Promise<ScoreEntry[]> {
  return (await apiFetch('/scores')) ?? []
}

// Get leaderboard sorted by total score.
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const data = (await apiFetch<unknown[]>('/scores/leaderboard')) ?? []
  return data.map(normalizeLeaderboardEntry)
}

export async function createScore(data: NewScoreEntry): Promise<ScoreEntry> {
  return await apiFetch('/scores', {
    method: 'POST',
    body: JSON.stringify(data)
  }) as ScoreEntry
}

export async function deleteScore(id: number): Promise<void> {
  await apiFetch(`/scores/${id}`, { method: 'DELETE' })
}

//User
export async function registerUser(data: RegisterRequest): Promise<User> {
  const result = await apiFetch('/users/register', {
    method: 'POST',
    body: JSON.stringify(data)
  })
  return normalizeUser(result)
}

export async function loginUser(request: LoginRequest): Promise<User> {
  const result = await apiFetch('/users/login', {
    method: 'POST',
    body: JSON.stringify(request)
  })
  return normalizeUser(result)
}

export async function logoutUser(): Promise<void> {
  await apiFetch('/users/logout', { method: 'POST' })
}
// Alias to keep naming consistent with page components.
export const loginApi = loginUser
export const registerApi = registerUser

export async function getUserById(userId: number): Promise<User> {
  const data = await apiFetch(`/users/${userId}`)
  return normalizeUser(data)
}

export async function requestPasswordReset(data: PasswordResetRequest): Promise<{ Message: string }> {
  return await apiFetch('/users/password-reset-request', {
    method: 'POST',
    body: JSON.stringify(data)
  }) as { Message: string }
}

export async function confirmPasswordReset(data: PasswordResetConfirmRequest): Promise<{ Message: string }> {
  return await apiFetch('/users/password-reset-confirm', {
    method: 'POST',
    body: JSON.stringify(data)
  }) as { Message: string }
}

// ========== StudyRecord ==========
export async function getStudyRecords(userId: number): Promise<StudyRecord[]> {
  const data = (await apiFetch<unknown[]>(`/StudyRecords/user/${userId}`)) ?? []
  return data.map(normalizeStudyRecord)
}

export async function createStudyRecord(record: NewStudyRecord): Promise<StudyRecord> {
  const data = await apiFetch('/StudyRecords', {
    method: 'POST',
    body: JSON.stringify(record)
  })
  return normalizeStudyRecord(data)
}

export async function updateStudyRecord(id: number, record: Partial<StudyRecord>): Promise<StudyRecord> {
  return await apiFetch(`/StudyRecords/${id}`, {
    method: 'PUT',
    body: JSON.stringify(record)
  }) as StudyRecord
}

export async function deleteStudyRecord(id: number): Promise<void> {
  await apiFetch(`/StudyRecords/${id}`, { method: 'DELETE' })
}

// ========== Badge ==========
// Get all badge definitions.
export async function getBadges(): Promise<Badge[]> {
  const data = (await apiFetch<unknown[]>('/badges')) ?? []
  return data.map(normalizeBadge)
}

// Get badges unlocked by the current user.
export async function getUserBadges(userId: number): Promise<UserBadge[]> {
  const data = (await apiFetch<unknown[]>(`/badges/user/${userId}`)) ?? []
  return data.map(normalizeUserBadge)
}

// Alias matching the Badges page import names.
export const getAllBadges = getBadges
export const getUserUnlockedBadges = getUserBadges