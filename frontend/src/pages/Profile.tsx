import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import type { User } from '../types';

export default function Profile() {
  const currentUser = useAuthStore(state => state.user);
  const [profileInfo, setProfileInfo] = useState<User | null>(null);
  const [msg, setMsg] = useState('');

  const loadProfile = async () => {
    try {
      setProfileInfo(currentUser);
    } catch {
      setMsg('Failed to load profile info');
    }
  };

  useEffect(() => {
    if (currentUser) loadProfile();
  }, [currentUser]);

  if (!profileInfo) {
    return (
      <div className="card text-center py-12 animate-fade-in">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">Loading profile...</p>
      </div>
    );
  }

  const stats = [
    { label: 'Level', value: profileInfo.Level, icon: '📊', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
    { label: 'Total Score', value: profileInfo.TotalScore, icon: '🏆', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' },
    { label: 'Current Streak', value: `${profileInfo.StreakDays} days`, icon: '🔥', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">👤</span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Profile</h1>
          <p className="text-gray-500 dark:text-gray-400">View your personal statistics</p>
        </div>
      </div>

      {msg && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 mb-6">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {msg}
        </div>
      )}

      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-4xl shadow-lg">
            {profileInfo.Nickname.charAt(0).toUpperCase()}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{profileInfo.Nickname}</h2>
            <p className="text-gray-500 dark:text-gray-400">@{profileInfo.Username}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{profileInfo.Email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`p-4 rounded-xl ${stat.color} text-center transition-transform hover:scale-105`}
          >
            <span className="text-2xl block mb-2">{stat.icon}</span>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm opacity-80">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Account Details</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-dark-600">
            <span className="text-gray-500 dark:text-gray-400">Username</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{profileInfo.Username}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-dark-600">
            <span className="text-gray-500 dark:text-gray-400">Nickname</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{profileInfo.Nickname}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-dark-600">
            <span className="text-gray-500 dark:text-gray-400">Email</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{profileInfo.Email}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-dark-600">
            <span className="text-gray-500 dark:text-gray-400">Level</span>
            <span className="font-medium text-blue-600 dark:text-blue-400">Level {profileInfo.Level}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-dark-600">
            <span className="text-gray-500 dark:text-gray-400">Total Score</span>
            <span className="font-medium text-yellow-600 dark:text-yellow-400">{profileInfo.TotalScore} pts</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-dark-600">
            <span className="text-gray-500 dark:text-gray-400">Current Streak</span>
            <span className="font-medium text-orange-600 dark:text-orange-400">🔥 {profileInfo.StreakDays} days</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-dark-600">
            <span className="text-gray-500 dark:text-gray-400">Registered On</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {new Date(profileInfo.CreatedAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-gray-500 dark:text-gray-400">Last Study Date</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {profileInfo.LastStudyDate
                ? new Date(profileInfo.LastStudyDate).toLocaleDateString()
                : 'No study records yet'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}