import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import ThemeToggle from '../components/ThemeToggle';
import { useTranslation } from '../i18n/useTranslation';

export default function MainLayout() {
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: `🏆 ${t('nav.leaderboard')}` },
    { path: '/study', label: `📚 ${t('nav.study')}` },
    { path: '/badges', label: `🏅 ${t('nav.badges')}` },
    { path: '/profile', label: `👤 ${t('nav.profile')}` },
    { path: '/about', label: `ℹ️ ${t('nav.about')}` },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-dark-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">📖</span>
              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                StudyTracker
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-700'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {user && (
                <div className="hidden md:flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                      {(user.Nickname || user.Username)?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {t('nav.hi')}{' '}
                      <span className="font-semibold text-primary-600 dark:text-primary-400">
                        {user.Nickname || user.Username || t('common.user')}
                      </span>
                    </span>
                  </div>
                  <button
                    onClick={() => void logout()}
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400 transition-colors"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              )}
              <ThemeToggle />

              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-700 animate-slide-up">
            <nav className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-700'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {user && (
                <button
                  onClick={() => {
                    void logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left font-medium text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg"
                >
                  {t('nav.logout')}
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="pt-20 pb-10 px-4 sm:px-6 max-w-6xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
