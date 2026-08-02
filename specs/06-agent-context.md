# Agent Context & Development Phases

How Cursor Agent was used across the project lifecycle, aligned with [`04-ai-prompts-log.md`](04-ai-prompts-log.md).

---

## Phase Map (Chronological)

| Phase | Focus | AI role | My role |
|-------|--------|---------|---------|
| **1** | Requirements & framework | Suggest module/entity layout | Hand-write entities, DbContext, badge seed |
| **2** | Controllers & DTOs | Occasional DTO snippets | Implement all controllers and validation |
| **3** | Backend debug | Scan codebase, list issues | Apply fixes one by one, write unit tests |
| **4** | Frontend + backend churn | Generate React pages | Find API mismatches, change backend/entities |
| **5** | Deploy (Render/Vercel) | CORS/cookie code suggestions | Configure dashboards, redeploy, read logs |
| **6** | UI rewrite | Implement Study page redesign | Define UX, reject library swaps (MUI) |
| **7** | Integration debug | Fix normalize, auth, 500 errors | Reproduce bugs in browser first |
| **8** | Second UI pass | Leaderboard, i18n, ProfileModal | Edit Chinese translations manually |
| **9** | Email / SendGrid | Token DB + reset UI | SendGrid account, Render env vars |
| **10** | Submission | README, specs, tests | Review all docs before hand-in |

---

## Workspace Rules Used With Agent

1. **Minimise scope** — one phase / one file group per session
2. **Match existing conventions** — Tailwind, Zustand, EF patterns
3. **I commit manually** — agent does not push to remote
4. **Run tests after backend edits** — `dotnet test`, `npm test`
5. **Comments in English** — UI supports English/Chinese separately via i18n

---

## Typical Session (Phases 3–7)

```
1. I reproduce the bug locally or on Render
2. I paste the error / Network response into chat
3. Agent searches backend or frontend
4. I review the diff — reject if scope is too large
5. I test manually and run automated tests
6. I git commit with my own message
```

---

## Files Touched Most by Agent (After My Review)

| File | Phase |
|------|-------|
| `backend/Services/StudyGameService.cs` | 3, 7, 9 |
| `backend/Program.cs` | 4, 5 |
| `frontend/src/pages/Study.tsx` | 6, 8 |
| `frontend/src/utils/normalize.ts` | 7 |
| `frontend/src/i18n/translations.ts` | 8 |
| `backend/Services/PasswordResetService.cs` | 9 |

---

## Files I Kept Human-First

| File | Why |
|------|-----|
| `backend/Models/*` | Phase 1 — hand-written |
| `backend/Data/AppDbContext.cs` | Phase 1 — seed data is my design |
| `backend/Controllers/*` (initial) | Phase 2 — I implemented |
| Render / Vercel env vars | Phases 5, 9 — no agent access |
| SendGrid sender verification | Phase 9 |
| `specs/01-project-planning.md` | Written before heavy AI use |

---

## Example Phase-3 Prompt (Backend Audit)

```markdown
Audit the entire backend project and list: EF relationship issues, unauthenticated endpoints,
badge logic bugs, JSON serialization risks. Give me a checklist first — do not change all files at once.
```

## Example Phase-6 Prompt (UI Rewrite)

```markdown
Rewrite the Study page: continue-last-session at top, subject + timer in the middle, history at bottom.
Auto check-in popup on first visit today. Do not switch to MUI — keep Tailwind.
```

---

## Honesty Statement

Development followed a **non-linear** path: frontend work forced backend changes (Phase 4), deployment forced another round (Phase 5), and the UI was rewritten twice (Phases 6 & 8). AI accelerated implementation and search; **I** owned requirements, entities, deployment, SendGrid, and final verification.

This project was **AI-assisted**, not **AI-only**.
