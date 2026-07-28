import { useEffect, useState } from 'react';
import { getLeaderboard } from '../api';
import { useAuthStore } from '../stores/authStore';

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
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 获取用户分数排行榜（按总分排序）
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const data = await getLeaderboard();
        setLeaderboard(data);
        setError('');
      } catch {
        setError('Could not reach the backend. Is it running on port 5000?');
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

  // 计算当前用户排名
  const getUserRank = () => {
    if (!user) return null;
    const userEntryIndex = leaderboard.findIndex(entry => entry.UserId === user.Id);
    return userEntryIndex >= 0 ? userEntryIndex + 1 : null;
  };

  const userRank = getUserRank();

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏆</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Score Leaderboard</h1>
            <p className="text-gray-500 dark:text-gray-400">Track your progress and compete with others</p>
          </div>
        </div>
        {user && userRank && (
          <div className="flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <span className="text-primary-600 dark:text-primary-400">Your Rank:</span>
            <span className="text-xl font-bold text-primary-700 dark:text-primary-300">
              {userRank === 1 ? '🥇' : userRank === 2 ? '🥈' : userRank === 3 ? '🥉' : `#${userRank}`}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 mb-6">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {isLoading && leaderboard.length === 0 ? (
        <div className="card text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading leaderboard...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-4">📊</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No users yet</h3>
          <p className="text-gray-500 dark:text-gray-400">Be the first to start studying!</p>
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
                          <span className="ml-2 px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">You</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Level {entry.Level} | {entry.StreakDays} day streak
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getRankTextColor(index)}`}>
                      {entry.Amount} pts
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {entry.Reason}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}