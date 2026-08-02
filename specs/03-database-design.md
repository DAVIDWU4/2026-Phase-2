# Database Design

**Database:** PostgreSQL (hosted on Render)  
**ORM:** Entity Framework Core 10  
**Context:** `backend/Data/AppDbContext.cs`

---

## Entity Relationship Overview

```
User ──┬── StudyRecord (1:N)
       ├── ScoreEntry (1:N)
       └── UserBadge (N:M via join) ── Badge

PasswordResetToken (standalone, keyed by email)
```

---

## Tables

### `user`

| Column | Type | Notes |
|--------|------|-------|
| id | int PK | Auto-increment |
| username | varchar(50) | Unique, required |
| email | varchar(100) | Unique, required |
| password_hash | text | BCrypt |
| nickname | varchar | Display name |
| total_score | int | Aggregated from study sessions |
| level | int | `total_score / 100 + 1` |
| streak_days | int | Recalculated from records |
| last_study_date | timestamp | Nullable |
| created_at | timestamp | |

### `study_record`

| Column | Type | Notes |
|--------|------|-------|
| id | int PK | |
| user_id | int FK | Cascade delete |
| study_date | timestamp | |
| duration_minutes | int | |
| subject | varchar | e.g. Math, English |
| earned_score | int | `duration / 10` |
| streak_count | int | Streak at time of record |
| notes | text | Nullable; `study-checkin` for daily check-in |

### `badge` (seed data, 15 rows)

| Column | Type | Notes |
|--------|------|-------|
| id | int PK | Fixed IDs 1–15 for rule mapping |
| name | varchar(50) | |
| description | text | |
| icon | varchar | Emoji |
| required_score | int | 0 = special rule badge |

### `user_badge`

| Column | Type | Notes |
|--------|------|-------|
| user_id | int PK (composite) | |
| badge_id | int PK (composite) | |
| unlocked_at | timestamp | |

### `score_entry`

Audit log of point changes (one entry per study session submit).

### `password_reset_token`

| Column | Type | Notes |
|--------|------|-------|
| id | int PK | |
| email | varchar(100) | Unique index |
| code | varchar(10) | 6-digit numeric |
| expires_at | timestamp | 10-minute TTL |
| created_at | timestamp | Used for 60s resend cooldown |

Added after discovering in-memory codes failed on Render multi-instance deploy.

---

## Badge ID → Rule Mapping

| ID | Name | Rule |
|----|------|------|
| 1 | First Step | ≥ 1 qualifying study session (excludes check-in) |
| 2–5 | Score badges | total_score ≥ 100 / 300 / 500 / 1000 |
| 6–9 | Streak badges | streak_days ≥ 3 / 7 / 15 / 30 |
| 10–12 | Time badges | total minutes ≥ 60 / 300 / 600 |
| 13–14 | Subject badges | distinct subjects ≥ 3 / 5 |
| 15 | 100-Day Journey | distinct study days ≥ 100 |

Qualifying sessions exclude records where `notes = 'study-checkin'`.

---

## Migrations

| Migration | Purpose |
|-----------|---------|
| `20260729142123_InitialPostgres` | Initial schema + badge seed |
| `20260802050752_AddPasswordResetToken` | Password reset persistence |

Auto-migrate on startup is enabled by default (`AutoMigrate=true` in Render env).

---

## Design Notes

- I chose **composite PK** on `user_badge (user_id, badge_id)` to prevent duplicate unlocks at the database level.
- **JSON serialisation:** Navigation properties on entities use `[JsonIgnore]` to prevent circular reference 500 errors — this was discovered during manual API testing, not planned upfront.
