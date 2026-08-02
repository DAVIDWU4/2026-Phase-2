# Design Decisions

This document records **human-led** design and architecture choices. AI tools were consulted for implementation details, but the direction below was decided by me before or during review.

---

## 1. UI Framework: Tailwind CSS (not MUI)

**Decision:** Custom Tailwind styling with a purple/indigo primary palette.

**Context — advanced features & design freedom:**  
The course asks for a **visually appealing UI with a unique visual identity**, plus advanced items like **theme switching**. I wanted full control over layout, gradients, dark mode, and responsive breakpoints without fighting a component library’s defaults.

**What actually happened:**
1. **Early prototype used MUI (Material UI)** — fast to scaffold login forms and cards.
2. I hit limits quickly: hard to get a distinct look, heavy default styling, and awkward overrides for dark mode and custom gamification visuals (badge grids, leaderboard ranks, gradient auth pages).
3. **I migrated to Tailwind** for more **unconstrained design space** — utility classes let me implement theme toggling (`dark:` variants) and a cohesive custom identity while still meeting responsiveness requirements.

**Why this supports the project goals:**
- **Theme switching (advanced feature):** Tailwind `dark:` + a `dark` class on `<html>` integrates cleanly with my `ThemeToggle`.
- **Unique UI (basic requirement):** Gradients, emoji badges, and card styles are easier to own end-to-end.
- **Responsive layout:** Breakpoints (`sm:`, `md:`) on my own components, e.g. mobile nav in `MainLayout.tsx`.

**Rejected later AI suggestion:** Switch to shadcn/ui mid-project — migration cost was high; Tailwind already matched my wireframes after the MUI → Tailwind move.

---

## 2. State Management: Zustand (not Redux)

**Decision:** Zustand for auth and locale stores.

**Context — advanced feature requirement:**  
One of the listed advanced features is **“Use a state management library (e.g. Zustand, Redux).”** I needed a real global store, not only `useState` + prop drilling, for auth session and later for locale (i18n).

**Why Zustand over Redux:**
- **Less structural constraint** — Redux wants actions, reducers, and often middleware; for two small domains (user + language) that felt like ceremony without benefit.
- **Fits the app size** — login state must persist across routes and sync with `localStorage`; Zustand does this in one file (`authStore.ts`) without boilerplate.
- **Easier to evolve the UI freely** — when I rewrote pages (Study timer, Badges, Leaderboard), I did not want every UI change to pass through a large Redux layer.

**Advanced features enabled:**
- **Zustand (marked advanced #1 in README)** — `authenticate`, `logout`, `refreshUser`, session restore on reload.
- **Theme + i18n** — locale store works the same pattern; components stay presentational.

I wrote the initial `authStore.ts` structure myself; AI later helped with camelCase normalisation after an API bug.

---

## 3. Study Page UX: Timer-First (redesign in Week 3)

**Original design:** Dropdown to select duration manually (15 / 30 / 60 min).

**Problem found during manual testing:** I accidentally selected 60 min after studying only 10 minutes. Scores were inflated.

**New design (my decision):**
1. Top section — "Continue yesterday's session" shortcut
2. Middle — subject picker + live stopwatch
3. Bottom — history list with delete

The daily check-in popup was my idea to encourage streaks without requiring a full study session.

---

## 4. Scoring Formula

**Decision:** `points = durationMinutes / 10` (integer division).

Example: 25 minutes → 2 points. I chose this over `duration / 6` because round numbers made badge thresholds easier to explain in the README (100 pts ≈ ~16 hours at this rate).

---

## 5. Badge Tracks (designed on paper first)

Five progression paths, 15 badges total:

1. **Score** — 100 / 300 / 500 / 1000 pts
2. **Streak** — 3 / 7 / 15 / 30 consecutive days
3. **Time** — 60 / 300 / 600 total minutes
4. **Subjects** — 3 / 5 distinct subjects
5. **Milestone** — 100 cumulative study days

Seed data is in `AppDbContext.cs`. I mapped each badge ID to a specific rule in `StudyGameService.IsBadgeEligible` rather than using a generic rules engine — simpler to debug.

---

## 6. Authentication: Cookie Sessions (not JWT in localStorage)

**Decision:** HTTP-only-style cookie auth via ASP.NET `SignInAsync`.

**Why:** Storing JWT in `localStorage` is vulnerable to XSS. Cookies with `SameSite=None; Secure` work for Vercel → Render cross-origin when credentials are included in fetch calls.

I manually verified this in Chrome Application tab → Cookies after login.

---

## 7. API Documentation: Scalar (not Swagger UI)

**Decision:** Scalar via `MapScalarApiReference()` in `Program.cs` (development environment).

**Context — basic course requirement:**  
The backend spec says to **expose Scalar API documentation UI instead of Swagger UI**. That is a hard requirement, not an optional extra.

**Why Scalar (and why it fit this project):**
- **Compliance** — satisfies the assignment without adding Swashbuckle/Swagger UI.
- **Clearer exploration while building** — during Phases 2–4 I was iterating controllers and DTOs; Scalar gave a readable doc UI when testing endpoints locally.
- **Less opinionated than baking docs into Swagger’s ecosystem** — I kept docs on the dev server only so production Render does not expose write endpoints publicly.

Local URL after `dotnet run`: `http://localhost:5000/scalar/v1`

---

## 8. Internationalisation

Not a course requirement — I added English/Chinese support because the app is used by bilingual family members. Translation keys live in a single `translations.ts` file rather than i18next, to keep bundle size small.

---

## Colour Palette (chosen manually)

| Token | Light | Dark |
|-------|-------|------|
| Primary | `#7c3aed` (violet-600) | `#a78bfa` (violet-400) |
| Background | `#f9fafb` | `#0f172a` |
| Card | white / shadow | `#1e293b` |

Reference: `frontend/tailwind.config.js`
