import type { ScoreEntry } from './types'

const BASE = 'http://localhost:5000/api/scores'

export async function getScores(): Promise<ScoreEntry[]> {
  const res = await fetch(BASE)
  if (!res.ok) throw new Error('Failed to fetch scores')
  return res.json()
}

export async function createScore(playerName: string, score: number): Promise<ScoreEntry> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerName, score }),
  })
  if (!res.ok) throw new Error('Failed to create score')
  return res.json()
}

export async function deleteScore(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete score')
}


const USERS_BASE = 'http://localhost:5000/api/users'

export async function registerUser(user: Omit<User, 'RID'>): Promise<User> {
  const res = await fetch(`${USERS_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  })
  if (!res.ok) throw new Error('Failed to register')
  return res.json()
}

export async function loginUser(request: LoginRequest): Promise<User> {
  const res = await fetch(`${USERS_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!res.ok) throw new Error('Login failed')
  return res.json()
}

// 学习记录 API
const STUDY_RECORDS_BASE = 'http://localhost:5000/api/studyrecords'

export async function getStudyRecords(userId: number): Promise<StudyRecord[]> {
  const res = await fetch(`${STUDY_RECORDS_BASE}/user/${userId}`)
  if (!res.ok) throw new Error('Failed to fetch study records')
  return res.json()
}

export async function createStudyRecord(record: Omit<StudyRecord, 'RecordID' | 'EarnedPoints' | 'StreakCount'>): Promise<StudyRecord> {
  const res = await fetch(STUDY_RECORDS_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  })
  if (!res.ok) throw new Error('Failed to create study record')
  return res.json()
}

// 徽章 API
const BADGES_BASE = 'http://localhost:5000/api/badges'

export async function getBadges(): Promise<Badge[]> {
  const res = await fetch(BADGES_BASE)
  if (!res.ok) throw new Error('Failed to fetch badges')
  return res.json()
}

export async function getUserBadges(userId: number): Promise<Badge[]> {
  const res = await fetch(`${BADGES_BASE}/user/${userId}`)
  if (!res.ok) throw new Error('Failed to fetch user badges')
  return res.json()
}