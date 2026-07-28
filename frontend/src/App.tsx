import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import type { ReactNode } from 'react'
import Leaderboard from './pages/Leaderboard'
import About from './pages/About'
import Study from './pages/Study'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Badges from './pages/Badges'
import Profile from './pages/Profile'
import MainLayout from './layouts/MainLayout'
import { useAuthStore } from './stores/authStore'


function RequireAuth({ children }: { children: ReactNode }) {
  const user = useAuthStore(state => state.user);
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppContent() {
  const { loading, restoreSession } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      {/* 登录/注册页面：独立布局，不需要导航栏 */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* 需要登录 + 共用导航布局的页面 */}
      <Route element={
        <RequireAuth>
          <MainLayout />
        </RequireAuth>
      }>
        <Route path="/" element={<Leaderboard />} />
        <Route path="/study" element={<Study />} />
        <Route path="/about" element={<About />} />
        <Route path="/badges" element={<Badges />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* 访问不存在路径时重定向首页 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}