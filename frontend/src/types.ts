export interface ScoreEntry {
  id: number
  playerName: string
  score: number
}

export interface User {
  RID: number;
  Username: string;
  Password: string;
  Nickname: string;
  Email: string;
  Role: string;
}

export interface StudyRecord {
  RecordID: number;
  rID: number;
  Date: string;
  Duration: number;
  Subject: string;
  EarnedPoints: number;
  StreakCount: number;
}

export interface Badge {
  BadgeID: number;
  BadgeName: string;
  BadgeImage: string;
  BadgeDescription: string;
  BadgePoints: number;
}

export interface UserBadge {
  UserID: number;
  BadgeID: number;
}

export interface LoginRequest {
  Username: string;
  Password: string;
}