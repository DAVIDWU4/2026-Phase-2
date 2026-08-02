# Iteration & Bug-Fix Notes

Manual testing log — aligned with development **phases** in [`04-ai-prompts-log.md`](04-ai-prompts-log.md).

| Phase | Bug-fix theme |
|-------|----------------|
| 3 | Backend audit fixes (badge logic, validation) |
| 4 | Auth, JSON 500, API field naming |
| 5 | CORS, cookies, Docker/Render deploy |
| 7 | camelCase normalize, undefined leaderboard fields |
| 9 | SendGrid env vars, password token persistence |

---

## Bug 1: Leaderboard shows `undefined day streak`

**Found:** Opening leaderboard after deploy; streak text showed "undefined day streak", score showed only "pts".

**Cause:** ASP.NET serialises JSON as camelCase (`streakDays`, `amount`). Frontend read PascalCase (`StreakDays`, `Amount`).

**Fix:** Added `frontend/src/utils/normalize.ts` to map both conventions.

**Found by:** Manual browser testing + Network tab inspection.

---

## Bug 2: All badges show green checkmark incorrectly

**Found:** Badges page showed 14/15 unlocked when total score was 1.

**Cause (multiple):**
1. Check-in records (1 min, 0 pts) counted toward streak/time/subject badges
2. Study minutes double-counted in EF query
3. Deleting records reduced score but did not revoke badges

**Fix:** `ReconcileUserBadgesAsync` in `StudyGameService`; exclude `study-checkin` notes.

**Verified:** Deleted all study records for test user → only "First Step" remained if one real session existed.

---

## Bug 3: POST /api/StudyRecords 500

**Found:** Submitting study session returned Internal Server Error.

**Cause:** Circular JSON reference on `User.StudyRecords` navigation property.

**Fix:** `[JsonIgnore]` on EF navigation properties.

---

## Bug 4: Study records submitted without login

**Found:** Could POST to API from curl without cookies.

**Fix:** `[Authorize]` on `StudyRecordsController` + cookie auth in `Program.cs`.

---

## Bug 5: CORS blocked on Vercel preview URLs

**Found:** Preview deployment `*.vercel.app` could not call Render API.

**Fix:** Added wildcard check for `*.vercel.app` in `Program.cs` CORS policy (commit `bd3a8a9`).

---

## Bug 6: Password reset 503 on Render

**Found:** "SendGrid is not configured" despite setting API key.

**Cause:** Missing `SendGrid__SenderEmail` env var (only ApiKey was set).

**Fix:** Added sender email in Render dashboard, redeployed.

---

## Bug 7: Password reset code never validated

**Found:** Code sent (in dev console) but confirm always failed on Render.

**Cause:** `PasswordResetService` used in-memory `ConcurrentDictionary` with `AddScoped` — new instance per HTTP request.

**Fix:** Moved tokens to PostgreSQL `password_reset_token` table.

---

## UX Iteration: Study Page v1 → v2

| Version | Input method | Problem |
|---------|-------------|---------|
| v1 | Manual duration dropdown | Users picked wrong duration |
| v2 | Live stopwatch + history | Accurate; matches real behaviour |

Redesign triggered after I used the app daily for one week and noticed inaccurate logs.

---

## Test Coverage Added After Bugs

| Bug area | Test added |
|----------|-----------|
| Badge reconcile | `CheckinRecord_DoesNotUnlockSpecialBadges` |
| Minute double-count | `ThirtyMinutes_DoesNotUnlockHourStarterBadge` |
| Delete revokes badge | `DeleteStudyRecord_RevokesScoreBadge` |
| Password token | `PasswordResetToken_ValidateAndConsume` |
| API normalisation | `frontend/src/utils/normalize.test.ts` |

---

## Deployment Checklist (self-verified)

- [x] Frontend loads on Vercel
- [x] Backend health on Render (`/api/users` returns 401/404 as expected)
- [x] Login/register sets cookie
- [x] Study session saves and updates score
- [x] Leaderboard displays names and scores
- [x] Badges reconcile on page load
- [x] Password reset email received (SendGrid)
- [x] Dark mode persists after refresh
- [x] Mobile layout usable (375px viewport)
