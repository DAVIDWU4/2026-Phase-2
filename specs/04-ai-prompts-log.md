# AI Prompts Log

This file records how AI (Cursor Agent) was used during **StudyTracker**, in the **actual order** the work happened. AI helped with scaffolding and debugging; core entities, database rules, deployment, and many fixes were done or verified by me.

> **Disclaimer:** This project was **AI-assisted**, not fully AI-generated. I reviewed every diff, ran tests manually, and rejected suggestions that did not fit the assignment or my design.

---

## Development Timeline Overview

```
Phase 1   Requirements → AI framework design → I hand-wrote entities & database logic
Phase 2   I implemented Controllers and DTOs
Phase 3   AI scanned the entire backend for bugs → I applied fixes
Phase 4   Frontend work started → backend issues found → changed backend and even entities
Phase 5   Deployment → many issues → repeated fixes
Phase 6   Better web UI patterns → rewrote parts of the frontend
Phase 7   Frontend/backend integration debug (camelCase, auth, 500 errors)
Phase 8   Second UI pass (Study timer, leaderboard, badges, profile)
Phase 9   Email / SendGrid / forgot-password flow
Phase 10  Submission polish (README, specs, unit tests)
```

---

## Phase 1 — Requirements & Framework (I Led Entities & Database)

**What I did first (no AI):**
- Read the course requirements and chose a **study gamification** theme: points, badges, leaderboard, streaks
- Sketched page layout and five badge progression tracks on paper

**My prompt to AI:**
```
I need to build a full-stack study check-in gamification app that motivates daily learning.
Backend: .NET 10 + EF Core + PostgreSQL. Frontend: React + TypeScript.
Please design the overall project framework: modules, entity relationships, and rough API layout.
Do not write all the code yet — give me an architecture overview first.
```

**AI output:**
- Suggested layering: `Models` / `Controllers` / `Services` / `Data`
- Listed entities: User, StudyRecord, Badge, UserBadge, ScoreEntry
- Recommended `StudyGameService` for scoring and badge unlock logic

**What I did myself after the AI framework:**
- **Hand-wrote** all entity classes (`User.cs`, `StudyRecord.cs`, `Badge.cs`, `UserBadge.cs`, `ScoreEntry.cs`)
- **Hand-wrote** `AppDbContext.cs`: relationships, cascade delete, **15 badge seed records** (AI only suggested 3 examples; I expanded to five tracks)
- **Hand-wrote** the initial migration and scoring rule: `points = durationMinutes / 10`
- Chose PostgreSQL for Render deployment; **rejected** AI suggestion to use SQLite

**Files mostly human-written:** `backend/Models/*`, `backend/Data/AppDbContext.cs`, badge seed IDs 1–15

---

## Phase 2 — Controllers & DTOs (I Implemented)

**What I did (minimal AI):**
- Implemented `UsersController`, `StudyRecordsController`, `BadgesController`, `ScoresController` myself
- Wrote DTOs: `RegisterRequest`, `LoginRequest`, `PasswordResetRequestDto`, etc.
- Added validation attributes: `[Required]`, `[EmailAddress]`, etc.

**Occasional AI use:**
```
Generate a PasswordResetConfirmDto with Email, Code, NewPassword fields and validation attributes.
```

**My review:** Only adopted the DTO field structure; naming and route prefix `/api/users` followed my own conventions.

---

## Phase 3 — Full Backend Debug (AI Found, I Fixed)

The first backend version compiled, but had issues before integration. I asked AI to **scan the entire backend** for bugs.

**My prompt:**
```
Please audit the entire backend project and list potential issues: EF relationships, API routes,
null references, badge unlock logic, JSON serialization, etc.
Do not fix everything at once — give me a problem list first.
```

**AI findings (examples):**
- Badge unlock conditions in one switch could cause false unlocks
- Navigation properties could cause JSON circular references
- `StudyRecordsController` was not authorised

**What I did:**
- **Fixed items one by one** manually, or asked AI to change only specific files
- Rewrote badge logic in `StudyGameService` (per badge ID rules)
- Added scoring and badge tests in `CoreBusinessTests.cs` — **mostly written by me**

**Prompt for targeted fix:**
```
Only modify IsBadgeEligible in StudyGameService.cs.
Use the 15 badge IDs from seed data — score badges via RequiredScore,
others via streak/duration/subject rules. Do not touch the frontend.
```

---

## Phase 4 — Frontend + Reverse Backend Changes

After starting the React frontend, many issues were **frontend/backend contract mismatches**, forcing backend and even entity changes.

**My prompt (frontend start):**
```
Create Login, Register, Study, Leaderboard, Badges, and Profile pages with
React + TypeScript + Tailwind and React Router. API base URL from env vars.
```

**Problems found during frontend work:**

| Symptom | Root cause | My fix |
|---------|------------|--------|
| POST StudyRecords 500 | JSON circular reference | `[JsonIgnore]` on navigation properties |
| Study submit failed | No auth / no cookie | Cookie Authentication + `[Authorize]` |
| Fields show `undefined` | API camelCase vs frontend PascalCase | Added `normalize.ts` |
| Register but cannot save records | Register did not SignIn | Updated `UsersController` register flow |

**My prompt when backend changed again:**
```
After frontend normalize, TotalScore is correct but LastStudyDate and Level are still out of sync.
Check the User entity and what StudyGameService updates after submit.
```

**Note:** This phase involved **more backend changes than frontend** — entities, controllers, and services all changed. Frontend was not “done in one pass.”

---

## Phase 5 — Deployment & Repeated Fixes

Deploying to **Render (backend) + Vercel (frontend)** exposed issues not seen locally.

**Issues found (mostly by me in browser / Render logs):**

1. **CORS** — Vercel preview domains blocked → updated `Program.cs` to allow `*.vercel.app`
2. **Cross-origin cookies** — `SameSite=None; Secure` + `credentials: 'include'`
3. **PostgreSQL connection** — Render env var `ConnectionStrings__DefaultConnection`
4. **Docker dependencies (libgssapi, etc.)** — Dockerfile fix (commit `8758bc0`)
5. **Cold start timeout** — added loading states on the frontend myself

**My prompt:**
```
After deploying to Render, frontend OPTIONS preflight fails.
Check CORS and CookiePolicy in Program.cs; AllowedOrigins should come from env vars.
```

**What AI could NOT do:** Log into the Render Dashboard to set environment variables — **all manual**.

---

## Phase 6 — Better Web UI (Partial Page Rewrites)

The first frontend version “worked but felt bad.” After looking at other study apps, **I decided to rewrite the Study page**.

**My prompt:**
```
Redesign the Study page UX:
1. Top: show yesterday/last session with one-click continue
2. Middle: subject picker + real stopwatch (not manual duration)
3. Bottom: history list
4. Auto check-in popup on first visit today
```

**AI output:** New three-section `Study.tsx` with timer

**My manual changes:**
- Subject list and check-in `notes: study-checkin` were **my design**
- Timer pause on tab switch — **I hand-wrote** `visibilitychange` handler
- Leaderboard / Badges pages got a **second UI polish** (avatars, ProfileModal, badge icons)

**Rejected AI suggestion:** Switch to MUI mid-project — I had **already moved away from MUI to Tailwind** earlier for design freedom; I kept Tailwind for a consistent custom UI and theme switching.

---

## Phase 7 — Frontend/Backend Integration Debug

After deployment and page rewrites, I ran a dedicated integration pass.

**My prompts (examples):**
```
POST /api/StudyRecords still returns 500 — check backend logs and JSON serialization.
```
```
Leaderboard shows "undefined day streak" and empty scores — check API fields and normalize.
```
```
Badges page shows "Special achievement" for every badge — check getAllBadges and getUserUnlockedBadges.
```

**Fixes applied:**
- `frontend/src/utils/normalize.ts` — unified camelCase / PascalCase
- `authStore` normalises user after login
- Badges page calls `refreshUser()` aligned with backend reconcile

**Who found bugs first:** Mostly me via browser Network tab / React DevTools, then I described symptoms to AI for code changes.

---

## Phase 8 — Second UI Pass

After integration passed, I improved UI quality for submission:

| Page | Changes |
|------|---------|
| Leaderboard | Clickable avatars, level/streak/score, unlocked badge icons |
| Badges | Locked/unlocked styling, progress bars, translated badge names |
| Profile / ProfileModal | Click avatar to open profile popup |
| Site-wide | English/Chinese i18n + bottom LanguageSwitcher |

**My prompt:**
```
All UI text in English and Chinese; language switcher at bottom of every page.
Keep code comments in English.
```

**My manual work:** I edited several Chinese strings myself (more natural tone); AI translations were too formal.

---

## Phase 9 — Email & Forgot Password (SendGrid)

**My prompt:**
```
Forgot password codes not received on Render multi-instance deploy.
Store codes in PostgreSQL, add resend button, do not silently succeed when SendGrid fails.
```

**AI output:**
- `PasswordResetToken` table + migration
- Rewrote `PasswordResetService`
- `ResetPassword.tsx` resend + cooldown timer

**What I did myself (critical):**
- Registered SendGrid and verified sender email
- Added `SendGrid__ApiKey` and **`SendGrid__SenderEmail`** on Render (missing the latter caused 503)
- Manual redeploy; confirmed `[Email] SendGrid configured` in logs

---

## Phase 10 — Submission Polish

**My prompt:**
```
Update README for submission requirements, strengthen frontend tests,
create specs folder documenting planning and AI usage.
```

**Where most of this work lives:**  
The **majority of submission documentation is in the `specs/` folder**, not only in README:

| Deliverable | Primary location |
|-------------|------------------|
| Planning & user stories | `specs/01-project-planning.md` |
| Design rationale (MUI→Tailwind, Zustand, Scalar) | `specs/02-design-decisions.md` |
| Database & badge rules | `specs/03-database-design.md` |
| AI usage timeline (Phases 1–10) | `specs/04-ai-prompts-log.md` |
| Manual bug-fix evidence | `specs/05-iteration-bugfix-notes.md` |
| Agent boundaries | `specs/06-agent-context.md` |

**README** holds the marker-facing summary: deployment links, theme relation, top 3 advanced features, security, quick start, and pointers into `specs/`.

**Tests:** 13 frontend Vitest + 12 backend xUnit (see README Testing section).

**My role:** I reviewed all spec text for accuracy (especially Phase order and MUI→Tailwind story) before hand-in.

---

## Summary: AI vs Human

| Task | Primary owner |
|------|----------------|
| Project theme & badge system design | Me |
| Entity classes, DbContext, seed data | Me |
| Controllers / DTOs (initial) | Me |
| Architecture framework suggestion | AI → filtered by me |
| Backend bug list | AI found → I fixed |
| Frontend page scaffolding | AI assisted → I revised multiple times |
| Deploy / Render / SendGrid | Me |
| Study page UX redesign | Me specified → AI implemented → I refined |
| Integration bugs (camelCase, auth) | Me found → AI helped fix |
| Unit tests | Me + AI for some additional cases |

---

## Prompting Tips (Personal Notes)

1. **Ask AI for a plan first, then write core code yourself** — Phase 1 worked best this way
2. **Phase 3: use a “full codebase audit” prompt** to catch missed issues
3. **During frontend work, expect to change the backend** — do not assume the API is final
4. **Paste Render/Vercel logs into chat for deploy issues** — AI cannot log into your accounts
5. **Limit scope:** “only change file X” / “do not touch entities” — avoids AI over-rewriting
