import { useState, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import type { User } from '../types';
import { getUserById } from '../api';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTranslation } from '../i18n/useTranslation';

const avatarColors = [
  'bg-gradient-to-br from-red-400 to-red-600',
  'bg-gradient-to-br from-orange-400 to-orange-600',
  'bg-gradient-to-br from-yellow-400 to-yellow-600',
  'bg-gradient-to-br from-green-400 to-green-600',
  'bg-gradient-to-br from-teal-400 to-teal-600',
  'bg-gradient-to-br from-blue-400 to-blue-600',
  'bg-gradient-to-br from-indigo-400 to-indigo-600',
  'bg-gradient-to-br from-purple-400 to-purple-600',
];

export default function Profile() {
  const currentUser = useAuthStore(state => state.user);
  const { t } = useTranslation();
  const [profileInfo, setProfileInfo] = useState<User | null>(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return t('common.noData');
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return t('common.invalidDate');
      return date.toLocaleDateString();
    } catch {
      return t('common.invalidDate');
    }
  };

  const getAvatarColor = (username: string) => {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  const refreshUserData = async () => {
    if (!currentUser?.Id) return;
    try {
      setLoading(true);
      const freshData = await getUserById(currentUser.Id);
      setProfileInfo(freshData);
      setMsg('');
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      setMsg(t('profile.refreshFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAvatarUrl(result);
      setShowAvatarUpload(false);
    };
    reader.readAsDataURL(file);
  };

  if (!profileInfo && !currentUser) {
    return (
      <div className="card text-center py-12 animate-fade-in">
        <div className="text-4xl mb-4">🔄</div>
        <p className="text-gray-500 dark:text-gray-400">{t('profile.loginRequired')}</p>
        <LanguageSwitcher />
      </div>
    );
  }

  const displayUser = profileInfo || currentUser;

  if (!displayUser) {
    return (
      <div className="card text-center py-12 animate-fade-in">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">{t('profile.loading')}</p>
        <LanguageSwitcher />
      </div>
    );
  }

  const stats = [
    { label: t('profile.level'), value: displayUser.Level ?? 1, icon: '📊', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
    { label: t('profile.totalScore'), value: displayUser.TotalScore ?? 0, icon: '🏆', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' },
    { label: t('profile.streak'), value: t('profile.streakValue', { days: displayUser.StreakDays ?? 0 }), icon: '🔥', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">👤</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('profile.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400">{t('profile.subtitle')}</p>
          </div>
        </div>
        <button onClick={refreshUserData} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-700 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors">
          <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {t('profile.refresh')}
        </button>
      </div>

      {msg && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 mb-6">
          {msg}
        </div>
      )}

      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div className={`w-24 h-24 rounded-full ${getAvatarColor(displayUser.Username || 'user')} flex items-center justify-center text-4xl shadow-lg overflow-hidden`}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={t('profile.avatarAlt')} className="w-full h-full object-cover" />
              ) : (
                <span>{displayUser.Nickname?.charAt(0).toUpperCase() || '?'}</span>
              )}
            </div>
            <button onClick={() => setShowAvatarUpload(!showAvatarUpload)}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>

          {showAvatarUpload && (
            <div className="mt-4 sm:mt-0 w-full sm:w-auto">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-800/30 transition-colors">
                {t('profile.selectAvatar')}
              </button>
              <button onClick={() => { setShowAvatarUpload(false); setAvatarUrl(null); }}
                className="w-full sm:w-auto mt-2 px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors">
                {t('common.cancel')}
              </button>
            </div>
          )}

          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{displayUser.Nickname || t('common.unknown')}</h2>
            <p className="text-gray-500 dark:text-gray-400">@{displayUser.Username || 'unknown'}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{displayUser.Email || t('common.noEmail')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className={`p-4 rounded-xl ${stat.color} text-center transition-transform hover:scale-105`}>
            <span className="text-2xl block mb-2">{stat.icon}</span>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm opacity-80">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('profile.accountDetails')}</h2>
        <div className="space-y-4">
          {[
            [t('profile.username'), displayUser.Username || '-'],
            [t('profile.nickname'), displayUser.Nickname || '-'],
            [t('profile.email'), displayUser.Email || '-'],
            [t('profile.role'), displayUser.Role || 'user'],
            [t('profile.level'), `${t('common.level')} ${displayUser.Level || 1}`],
            [t('profile.totalScore'), `${displayUser.TotalScore || 0} ${t('common.pts')}`],
            [t('profile.streak'), `🔥 ${displayUser.StreakDays || 0} ${t('common.days')}`],
            [t('profile.registeredOn'), formatDate(displayUser.CreatedAt)],
            [t('profile.lastStudy'), displayUser.LastStudyDate ? formatDate(displayUser.LastStudyDate) : t('profile.noStudyYet')],
          ].map(([label, value], i, arr) => (
            <div key={String(label)} className={`flex justify-between items-center py-3 ${i < arr.length - 1 ? 'border-b border-gray-200 dark:border-dark-600' : ''}`}>
              <span className="text-gray-500 dark:text-gray-400">{label}</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <LanguageSwitcher />
    </div>
  );
}
