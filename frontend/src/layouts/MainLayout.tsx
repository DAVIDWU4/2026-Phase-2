import { Link, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore'

export default function MainLayout() {
  const { user, logout } = useAuthStore();
  return (
    <div className="min-h-screen">
      <nav className="flex items-center gap-6 p-4 bg-slate-100">
        <Link to="/study">Study Tracker</Link>
        <Link to="/badges">Badges</Link>
        <Link to="/leaderboard">Leaderboard</Link>
        <Link to="/profile">Profile</Link>
        {user ? (
          <>
            <span>Welcome, {user.Nickname}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login / Register</Link>
        )}
      </nav>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}