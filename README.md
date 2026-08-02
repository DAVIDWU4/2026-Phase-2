# StudyTracker — Study Gamification Platform

A full-stack web application that turns daily learning into a gamified experience: track study sessions, earn points, unlock badges, maintain streaks, and compete on a leaderboard.

## Deployment

| Service | URL |
|---------|-----|
| **Frontend** | https://2026-phase-2.vercel.app |
| **Backend API** | https://two026-phase-2.onrender.com/api |
| **API Docs (Scalar, local dev)** | http://localhost:5000/scalar/v1 |

> The frontend is hosted on Vercel; the backend and PostgreSQL database run on Render. Password reset emails are sent via SendGrid.

---

## Introduction

**StudyTracker** helps students and self-learners build consistent study habits. Users log learning sessions with a live timer, earn points based on duration, unlock achievement badges across five progression tracks, and compare progress on a global leaderboard. The app supports English and Chinese, light/dark themes, and full authentication including password reset via email verification codes.

---

## Theme Relationship

This project aligns with the **gamification / habit-building** theme by:

- Converting study time into **points** and **levels**, giving immediate feedback for effort
- Using **streaks** and **badges** as long-term motivation (similar to game achievement systems)
- Providing a **leaderboard** for friendly competition among learners
- Making progress **visible** through profiles, badge grids, and rank displays

The core loop mirrors game design: action (study) → reward (points/badges) → progression (level/rank) → retention (streaks).

---

## Unique Features Worth Highlighting

1. **Live study timer with session resume** — The Study page remembers yesterday's or your last incomplete session and lets you continue with a real stopwatch instead of manually entering duration. This was redesigned after initial user testing showed manual entry was error-prone.

2. **Five-track badge system (15 badges)** — Badges cover score milestones, streaks, total study hours, subject diversity, and cumulative check-in days. Eligibility is reconciled server-side so unlock state always matches actual progress.

3. **Bilingual UI (EN / 中文)** — Added as a personal requirement for bilingual users; every page includes a language switcher and badge labels are translated.

4. **Clickable profile avatars** — Leaderboard and navbar avatars open a quick profile modal showing level, score, streak, and unlocked badges.

5. **Cross-origin auth** — Cookie-based authentication works between Vercel (frontend) and Render (backend) with `SameSite=None` and CORS configured for production domains.

---

## Advanced Features Checklist

> **Important:** Only the **top 3** features below are marked for assessment.

| # | Feature | Status | Location |
|---|---------|--------|----------|
| 1 | **State management (Zustand)** | ✅ Implemented | `frontend/src/stores/authStore.ts`, `localeStore.ts` |
| 2 | **Theme switching (light / dark)** | ✅ Implemented | `frontend/src/components/ThemeToggle.tsx`, Tailwind `dark:` classes |
| 3 | **Dockerized deployment** | ✅ Implemented | `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile` |

### Feature 1: Zustand State Management

Auth user state and locale preference are managed with Zustand instead of prop drilling. This satisfies the advanced requirement for a **state management library** with minimal boilerplate so UI pages (Study, Badges, Leaderboard) could be rewritten without a heavy Redux layer. The auth store persists the user to `localStorage` and exposes `authenticate`, `logout`, and `refreshUser` actions.

See [`specs/02-design-decisions.md`](specs/02-design-decisions.md) for why Zustand was chosen over Redux.

### Feature 2: Light / Dark Theme

A toggle in the header and auth pages switches between light and dark modes. The selected theme is saved to `localStorage` and applied via a `dark` class on `<html>`. Tailwind `dark:` variants style all major components. Theme switching was easier to own after moving from an early **MUI prototype** to Tailwind for unconstrained styling (documented in specs).

### Feature 3: Docker

`docker-compose.yml` builds and runs both the .NET backend and Nginx-served React frontend on a shared network. Useful for consistent local demos and deployment prototyping.

---

## Security Measures

Two security measures are implemented with justification:

### 1. Password Hashing (BCrypt)

**Why it matters:** Passwords must never be stored in plain text. If the database is compromised, hashed passwords prevent immediate credential theft.

**Implementation:** `UsersController` hashes passwords with `BCrypt.Net.BCrypt.HashPassword` on registration and password reset. Login compares via `BCrypt.Verify`.

### 2. Cookie-Based Authentication + Authorised Endpoints

**Why it matters:** Study records and user badges are private data. Without server-side auth, any client could read or write another user's records.

**Implementation:** ASP.NET Core Cookie Authentication (`Program.cs`). Login/register call `SignInAsync`. Protected controllers (`StudyRecordsController`, `BadgesController` user endpoint) use `[Authorize]` and validate the current user ID from claims.

Additional validation: DTOs use `[Required]`, `[EmailAddress]`, and `[StringLength]` data annotations on registration and password reset requests.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Router, Zustand, Vitest |
| Backend | C# .NET 10, ASP.NET Core, EF Core, PostgreSQL |
| Email | SendGrid |
| Hosting | Vercel (frontend), Render (backend + DB) |
| API Docs | Scalar (development) |

---

## Testing

```bash
# Backend (12 unit tests)
cd backend.UnitTests
dotnet test

# Frontend (13 unit tests)
cd frontend
npm test
```

Frontend tests cover auth store, Login, Badges, Leaderboard, and API normalisation utilities.

---

## Quick Start

### Backend

```bash
cd backend
dotnet run
# API: http://localhost:5000/api
# Scalar docs: http://localhost:5000/scalar/v1
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App: http://localhost:5173
```

### Docker

```bash
docker-compose up --build
```

---

## SendGrid Setup (Password Reset)

Password reset codes are stored in PostgreSQL and emailed via SendGrid.

1. Verify a sender in SendGrid (Single Sender or Domain Authentication).
2. Create an API key with **Mail Send** permission.
3. Set on **Render backend** Environment:

| Variable | Description |
|----------|-------------|
| `SendGrid__ApiKey` | API key (`SG.xxxx`) |
| `SendGrid__SenderEmail` | Verified sender email |
| `SendGrid__SenderName` | Display name (optional) |

4. Redeploy backend. Logs should show: `[Email] SendGrid configured. Sender: ...`

See [`backend/.env.example`](backend/.env.example) for all environment variables.

---

## Self-Reflection

If I were to build this project again, I would:

1. **Add a progress dashboard with charts** — Visualising points and streaks over time would make long-term progress clearer than numbers alone.

2. **Introduce proper RBAC** — Currently all authenticated users share the same role. An admin role for moderation would be useful at scale.

3. **Expand E2E tests with Cypress** — Unit tests cover key logic, but end-to-end flows (register → study → badge unlock) would catch integration regressions earlier.

4. **Plan API response shapes upfront** — The camelCase vs PascalCase mismatch caused frontend display bugs that took extra time to debug. A shared OpenAPI contract from day one would have prevented this.

5. **Enable Scalar in staging** — API docs are dev-only today; a staging environment with Scalar would help markers and collaborators explore endpoints without running locally.

---

## Planning & AI Development Evidence

**Most submission evidence is in [`specs/`](specs/)** — README is the summary; detailed planning, design rationale, and AI logs are in the spec files below.

AI usage is documented **in chronological order** (Phase 1–10):

1. Requirements → AI framework → **hand-written entities & database**
2. **Controllers & DTOs** (implemented by me)
3. AI backend audit → **I applied fixes**
4. Frontend start → **backend/entity changes**
5. Deploy → repeated fixes (Render/Vercel)
6. **UI rewrite** (Study page; earlier **MUI prototype → Tailwind** for design freedom)
7. Frontend/backend integration debug
8. Second UI pass (leaderboard, i18n, profile)
9. SendGrid / password reset email
10. Submission polish — **README summary + full detail in `specs/` + tests**

Start with [`specs/04-ai-prompts-log.md`](specs/04-ai-prompts-log.md); design choices (Tailwind, Zustand, Scalar) in [`specs/02-design-decisions.md`](specs/02-design-decisions.md).

---

## Repository Structure

```
2026-Phase-2/
├── backend/           # .NET 10 API, EF Core, services
├── backend.UnitTests/ # xUnit tests
├── frontend/          # React + TypeScript SPA
├── specs/             # Planning, design, AI development docs
├── docker-compose.yml
└── README.md
```
