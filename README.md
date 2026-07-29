# Study Gamification,Project?,,

### Deployment

- Frontend: **[Add your deployed frontend URL here]**
- Backend API root: `https://two026-phase-2.onrender.com/api`

---

## Pro?ect Intro

This project is a study gamification platform that helps users track learning sessions, earn points, unlock badges, and compare progress on a leaderboard. It combines authentication, study logging, streak tracking, and reward mechanics in a full-stack app.

## Theme Relationship

This project relates to the theme by turning daily study habits into a gamified experience. Users earn points for completed study sessions, maintain streaks, and unlock achievement badges, which encourages consistent learning through game-like progress and rewards.

## What Makes This Project Unique

- Full user authentication with registration, login, and password reset.
- Study records are scored and used to rank users in a leaderboard.
- Badge system with unlock progress and milestone tracking.
- Study streaks are displayed as part of the user profile and leaderboard details.
- Frontend and backend are decoupled with environment-driven API configuration.

## Top 3 Advanced Features

The following advanced features are explicitly implemented in this project:

- [x] State management with Zustand for authentication state and session persistence.
- [x] Dark/light theme switching with a persistent theme toggle.
- [x] Dockerized full-stack deployment with backend and frontend containers.

## Why These Features Matter

- **Zustand state management** keeps auth state consistent across pages and helps avoid prop drilling. It also simplifies restoring the user session from `localStorage`.
- **Theme switching** improves user experience by supporting both light and dark modes, and the chosen mode persists across refreshes.
- **Dockerization** ensures the application can run in a consistent environment, making deployment and local setup easier.

## Security and Validation

- **Password hashing** is implemented using `BCrypt.Net.BCrypt.HashPassword` for secure storage of user passwords.
- **Input validation** is enforced with data annotations like `[Required]` and `[EmailAddress]` on DTO classes.

## If I Did This Project Again

If I built this again, I would:

1. Add a dedicated user dashboard with charts for progress, streaks, and points over time.
2. Implement real email delivery for password reset codes instead of simulated verification.
3. Add automated frontend and backend tests for critical flows such as auth, study logging, and badge unlocks.

---

## Quick Start

### Run the backend

```bash
cd backend
dotnet run
```

### Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.
