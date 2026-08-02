import { useEffect, useState } from 'react';
import { getLeaderboard } from '../api';
import { useAuthStore } from '../stores/authStore';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTranslation } from '../i18n/useTranslation';

interface LeaderboardEntry {
  UserId: number;
  Amount: number;
  Reason: string;
  Username: string;
  Nickname: string;
  Level: number;
  StreakDays: number;
}

export default function Leaderboard() {
  const user = useAuthStore(state => state.user);
  const { t } = useTranslation();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const data = await getLeaderboard();
        setLeaderboard(data);
        setLoadFailed(false);
      } catch {
        setLoadFailed(true);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchLeaderboard();
  }, []);

  const getRankIcon = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const getRankBg = (index: number) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 dark:from-yellow-900/20 dark:border-yellow-800';
    if (index === 1) return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 dark:from-gray-800 dark:border-gray-700';
    if (index === 2) return 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 dark:from-orange-900/20 dark:border-orange-800';
    return 'bg-gray-50 dark:bg-dark-700/50 border-gray-200 dark:border-dark-600';
  };

  const getRankTextColor = (index: number) => {
    if (index === 0) return 'text-yellow-600 dark:text-yellow-400';
    if (index === 1) return 'text-gray-600 dark:text-gray-400';
    if (index === 2) return 'text-orange-600 dark:text-orange-400';
    return 'text-gray-700 dark:text-gray-300';
  };

  const userRank = user
    ? (() => {
        const idx = leaderboard.findIndex(entry => entry.UserId === user.Id);
        return idx >= 0 ? idx + 1 : null;
      })()
    : null;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏆</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('leaderboard.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400">{t('leaderboard.subtitle')}</p>
          </div>
        </div>
        {user && userRank && (
          <div className="flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <span className="text-primary-600 dark:text-primary-400">{t('leaderboard.yourRank')}</span>
            <span className="text-xl font-bold text-primary-700 dark:text-primary-300">
              {userRank === 1 ? '🥇' : userRank === 2 ? '🥈' : userRank === 3 ? '🥉' : `#${userRank}`}
            </span>
          </div>
        )}
      </div>

      {loadFailed && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 mb-6">
          {t('leaderboard.error')}
        </div>
      )}

      {isLoading && leaderboard.length === 0 ? (
        <div className="card text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">{t('leaderboard.loading')}</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-4">📊</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('leaderboard.emptyTitle')}</h3>
          <p className="text-gray-500 dark:text-gray-400">{t('leaderboard.emptyDesc')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, index) => {
            const isCurrentUser = user?.Id === entry.UserId;
            return (
              <div
                key={entry.UserId}
                className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${getRankBg(index)} ${isCurrentUser ? 'ring-2 ring-primary-500' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold w-10">{getRankIcon(index)}</span>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                      {entry.Nickname?.charAt(0).toUpperCase() || entry.Username?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {entry.Nickname || entry.Username}
                        {isCurrentUser && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">
                            {t('common.you')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('common.level')} {entry.Level} | {t('leaderboard.streak', { days: entry.StreakDays })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getRankTextColor(index)}`}>
                      {entry.Amount} {t('common.pts')}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t('leaderboard.totalScore')}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <LanguageSwitcher />
    </div>
  );
}
