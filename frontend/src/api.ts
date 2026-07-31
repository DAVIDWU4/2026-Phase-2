import type {
  ScoreEntry, User, StudyRecord, Badge, LoginRequest,
  RegisterRequest, PasswordResetRequest, PasswordResetConfirmRequest,
  NewScoreEntry, NewStudyRecord, UserBadge
} from './types'

const API_ROOT = import.meta.env.VITE_API_ROOT ?? 'http://localhost:5000/api'

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
export async function getLeaderboard(): Promise<{
  UserId: number;
  Amount: number;
  Reason: string;
  Username: string;
  Nickname: string;
  Level: number;
  StreakDays: number;
}[]> {
  return (await apiFetch('/scores/leaderboard')) ?? []
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
  return await apiFetch('/users/register', {
    method: 'POST',
    body: JSON.stringify(data)
  }) as User
}

export async function loginUser(request: LoginRequest): Promise<User> {
  return await apiFetch('/users/login', {
    method: 'POST',
    body: JSON.stringify(request)
  }) as User
}
// Alias to keep naming consistent with page components.
export const loginApi = loginUser
export const registerApi = registerUser

export async function getUserById(userId: number): Promise<User> {
  return await apiFetch(`/users/${userId}`) as User
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
  return (await apiFetch(`/StudyRecords/user/${userId}`)) ?? []
}

export async function createStudyRecord(record: NewStudyRecord): Promise<StudyRecord> {
  return await apiFetch('/StudyRecords', {
    method: 'POST',
    body: JSON.stringify(record)
  }) as StudyRecord
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
  return (await apiFetch('/badges')) ?? []
}

// Get badges unlocked by the current user.
export async function getUserBadges(userId: number): Promise<UserBadge[]> {
  return (await apiFetch(`/badges/user/${userId}`)) ?? []
}

// Alias matching the Badges page import names.
export const getAllBadges = getBadges
export const getUserUnlockedBadges = getUserBadges