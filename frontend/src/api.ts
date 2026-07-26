import type { ScoreEntry, User, StudyRecord, Badge, LoginRequest, RegisterRequest, NewScoreEntry, NewStudyRecord } from './types'

const API_ROOT = import.meta.env.VITE_API_ROOT ?? 'http://localhost:5000/api'

// 封装通用fetch工具，统一处理请求头、错误
async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const fullUrl = `${API_ROOT}${url}`
  const res = await fetch(fullUrl, {
    headers: {
      'Content-Type': 'application/json',
      // 后续登录后可以在这里统一附加 Authorization token
    },
    ...init
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => 'Unknown error')
    throw new Error(`Request failed (${res.status}): ${errText}`)
  }

  // DELETE 请求返回204无内容
  if (res.status === 204) return undefined as T
  return res.json()
}

// ========== ScoreEntry 积分流水 ==========
export async function getScores(): Promise<ScoreEntry[]> {
  return apiFetch('/scores')
}

export async function createScore(data: NewScoreEntry): Promise<ScoreEntry> {
  return apiFetch('/scores', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export async function deleteScore(id: number): Promise<void> {
  return apiFetch(`/scores/${id}`, { method: 'DELETE' })
}

// ========== User 用户 ==========
// 注册：参数使用 RegisterRequest！
export async function registerUser(data: RegisterRequest): Promise<User> {
  return apiFetch('/users/register', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export async function loginUser(request: LoginRequest): Promise<User> {
  return apiFetch('/users/login', {
    method: 'POST',
    body: JSON.stringify(request)
  })
}

export async function getUserById(userId: number): Promise<User> {
  return apiFetch(`/users/${userId}`)
}

// ========== StudyRecord 学习记录 ==========
export async function getStudyRecords(userId: number): Promise<StudyRecord[]> {
  return apiFetch(`/StudyRecords/user/${userId}`)
}

export async function createStudyRecord(record: NewStudyRecord): Promise<StudyRecord> {
  return apiFetch('/StudyRecords', {
    method: 'POST',
    body: JSON.stringify(record)
  })
}

export async function updateStudyRecord(id: number, record: Partial<StudyRecord>): Promise<StudyRecord> {
  return apiFetch(`/StudyRecords/${id}`, {
    method: 'PUT',
    body: JSON.stringify(record)
  })
}

export async function deleteStudyRecord(id: number): Promise<void> {
  return apiFetch(`/StudyRecords/${id}`, { method: 'DELETE' })
}

// ========== Badge 徽章 ==========
export async function getBadges(): Promise<Badge[]> {
  return apiFetch('/badges')
}

export async function getUserBadges(userId: number): Promise<Badge[]> {
  return apiFetch(`/badges/user/${userId}`)
}