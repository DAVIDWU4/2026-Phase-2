// User
export interface User {
  Id: number;
  Username: string;
  Nickname: string;
  Email: string;
  Role: string;
  TotalScore: number;
  Level: number;
  StreakDays: number;
  LastStudyDate: string | null;
  CreatedAt: string;
}

// StudyRecord
export interface StudyRecord {
  Id: number;
  UserId: number;
  StudyDate: string;
  DurationMinutes: number;
  Subject: string;
  EarnedScore: number;
  StreakCount: number;
  Notes: string | null;
}
export type NewStudyRecord = Omit<StudyRecord, "Id">;

// Badge
export interface Badge {
  Id: number;
  Name: string;
  Icon: string;
  Description: string;
  RequiredScore: number;
  CreatedAt: string;
}

// UserBadge
export interface UserBadge {
  UserId: number;
  BadgeId: number;
  UnlockedAt: string;
}

// ScoreEntry
export interface ScoreEntry {
  Id: number;
  UserId: number;
  Amount: number;
  Reason: string;
  CreatedAt: string;
}
export type NewScoreEntry = Omit<ScoreEntry, "Id">;

// StudyTask
export interface StudyTask {
  Id: number;
  Title: string;
  Description: string | null;
  Difficulty: string;
  ExpReward: number;
  IsCompleted: boolean;
  CreatedAt: string;
  CompletedAt: string | null;
}
export type NewStudyTask = Omit<StudyTask, "Id">;

// 登录请求体
export interface LoginRequest {
  Username: string;
  Password: string;
}

// 注册请求体（对应后端RegisterDto）
export interface RegisterRequest {
  Username: string;
  Password: string;
  Nickname: string;
  Email: string;
}