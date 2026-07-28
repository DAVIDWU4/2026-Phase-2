import type {
  ScoreEntry, User, StudyRecord, Badge, LoginRequest,
  RegisterRequest, PasswordResetRequest, PasswordResetConfirmRequest,
  NewScoreEntry, NewStudyRecord, UserBadge
} from './types'

const API_ROOT = import.meta.env.VITE_API_ROOT ?? 'http://localhost:5000/api'

// 封装通用fetch工具，统一处理请求头、错误
async function apiFetch<T>(url: string, init?: RequestInit): Promise<T | undefined> {
  const fullUrl = `${API_ROOT}${url}`
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    // 后续JWT鉴权在这里注入token
    // 'Authorization': `Bearer ${useAuthStore.getState().token}`
  }

  const res = await fetch(fullUrl, {
    headers,
    ...init
  })

  if (!res.ok) {
    let errMsg = 'Unknown error'
    try {
      errMsg = await res.text()
    } catch (error) {
      console.error('apiFetch failed reading error text:', error)
    }
    throw new Error(`Request failed (${res.status}): ${errMsg}`)
  }

  // DELETE 204 No Content
  if (res.status === 204) return undefined
  return res.json()
}

// ========== ScoreEntry 积分流水 ==========
export async function getScores(): Promise<ScoreEntry[]> {
  return (await apiFetch('/scores')) ?? []
}

// 获取排行榜（用户总分排名）
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

// ========== User 用户 ==========
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
// 和页面组件保持一致的别名
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

// ========== StudyRecord 学习记录 ==========
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

// ========== Badge 徽章 ==========
// 获取系统全部徽章定义
export async function getBadges(): Promise<Badge[]> {
  return (await apiFetch('/badges')) ?? []
}

// 获取【当前用户解锁的徽章记录】（包含BadgeId、解锁时间）
export async function getUserBadges(userId: number): Promise<UserBadge[]> {
  return (await apiFetch(`/badges/user/${userId}`)) ?? []
}

// 别名，匹配你Badges.tsx里面的导入名称
export const getAllBadges = getBadges
export const getUserUnlockedBadges = getUserBadges