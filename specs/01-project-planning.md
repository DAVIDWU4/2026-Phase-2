# Project Planning

**Project:** StudyTracker  
**Author:** David  
**Course:** 2026 Phase 2 Full-Stack Project  
**Last updated:** August 2026

---

## 1. Problem Statement

Many students struggle to maintain consistent study habits. Existing todo apps track tasks but do not reward time spent learning. I wanted to build something that **motivates daily study** through points, streaks, and achievements — similar to fitness apps but for learning.

---

## 2. Core User Stories (written manually before coding)

| ID | As a… | I want to… | So that… |
|----|-------|-----------|----------|
| US-01 | User | Register and log in | My progress is saved securely |
| US-02 | User | Start a timed study session | I don't have to guess how long I studied |
| US-03 | User | See my total score and rank | I feel motivated to improve |
| US-04 | User | Unlock badges | I have milestones to work toward |
| US-05 | User | Reset my password via email | I can recover my account |
| US-06 | User | Switch language (EN / Chinese) | My family members can use the app |

---

## 3. MVP Scope (Week 1–2)

**In scope:**
- User auth (register, login, logout)
- Study record CRUD with scoring (`duration / 10` points)
- Leaderboard sorted by total score
- 15 seed badges across 5 tracks
- Responsive React UI with Tailwind

**Out of scope (deferred):**
- Charts / analytics dashboard
- Admin panel
- Real-time multiplayer
- Mobile native app

---

## 4. Milestone Timeline

| Week | Goal | Outcome |
|------|------|---------|
| 1 | Backend skeleton + EF Core + User CRUD | ✅ Done — chose PostgreSQL for Render compatibility |
| 2 | Frontend pages + React Router | ✅ Done — wireframes sketched on paper first |
| 3 | Study timer UX + badge logic | ✅ Redesigned Study page after finding manual duration was confusing |
| 4 | Deploy Render + Vercel, Docker, tests | ✅ Done |
| 5 | i18n, password reset, bug fixes | ✅ SendGrid configured on Render |
| 6 | README, specs, submission polish | In progress |

---

## 5. Theme Alignment Checklist

- [x] Gamification mechanics (points, levels, badges)
- [x] Habit tracking (streaks, daily check-in)
- [x] Social/competitive element (leaderboard)
- [x] Full-stack with persistent database
- [x] Deployed and accessible online

---

## 6. Risks Identified Early

| Risk | Mitigation |
|------|------------|
| Cross-origin cookies (Vercel ↔ Render) | Researched `SameSite=None; Secure`; tested in Chrome dev tools |
| Badge unlock cheating | Server-side eligibility in `StudyGameService` |
| Render cold starts | Acceptable for coursework; noted in demo script |
| Email delivery | SendGrid with verified sender; fallback console log in dev |

---

## Notes

The initial project name was generic ("Study App"). I renamed it to **StudyTracker** in commit `3c47e42` after deciding the brand should emphasise tracking progress over time.
