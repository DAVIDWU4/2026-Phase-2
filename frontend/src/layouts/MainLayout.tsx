import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function MainLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen">
      <nav className="flex items-center gap-6 p-4 bg-slate-100">
        <Link to="/study">学习打卡</Link>
        <Link to="/badges">徽章</Link>
        <Link to="/leaderboard">排行榜</Link>
        <Link to="/profile">个人中心</Link>
        {user ? (
          <>
            <span>欢迎，{user.Nickname}</span>
            <button onClick={logout}>退出登录</button>
          </>
        ) : (
          <Link to="/login">登录/注册</Link>
        )}
      </nav>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}