import { useEffect, useMemo, useState } from 'react';
import { getAllBadges, getUserUnlockedBadges } from '../api';
import { useAuthStore } from '../stores/authStore';
import type { Badge, UserBadge } from '../types';

export default function Badges() {
  const user = useAuthStore(state => state.user);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!user?.Id) {
        setBadges([]);
        setUserBadges([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const [allBadges, unlocked] = await Promise.all([
          getAllBadges(),
          getUserUnlockedBadges(user.Id),
        ]);
        setBadges(allBadges);
        setUserBadges(unlocked);
      } catch (err) {
        console.error('Failed to load badges:', err);
        setError('Failed to load badges. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [user?.Id]);

  const unlockedBadgeIds = useMemo(
    () => new Set(userBadges.map(ub => ub.BadgeId)),
    [userBadges]
  );

  const unlockedCount = unlockedBadgeIds.size;
  const totalCount = badges.length;

  const getProgress = (badge: Badge) => {
    if (!user) return 0;
    if (badge.RequiredScore > 0) {
      return Math.min(100, (user.TotalScore / badge.RequiredScore) * 100);
    }
    return unlockedBadgeIds.has(badge.Id) ? 100 : 0;
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏅</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Badges</h1>
            <p className="text-gray-500 dark:text-gray-400">Collect achievements and unlock rewards</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
          <span className="text-2xl">🎯</span>
          <span className="font-semibold text-primary-600 dark:text-primary-400">
            {unlockedCount}/{totalCount} unlocked
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="card text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading badges...</p>
        </div>
      ) : badges.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-4">🏆</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No badges loaded</h3>
          <p className="text-gray-500 dark:text-gray-400">Check back later for badge updates</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map((badge) => {
            const isUnlocked = unlockedBadgeIds.has(badge.Id);
            const progressLabel = badge.RequiredScore > 0
              ? `${user?.TotalScore ?? 0}/${badge.RequiredScore}`
              : isUnlocked ? 'Unlocked' : 'In progress';

            return (
              <div
                key={badge.Id}
                className={`badge-item ${isUnlocked ? 'badge-unlocked' : 'badge-locked'} relative overflow-hidden`}
              >
                {isUnlocked && (
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">✅</span>
                  </div>
                )}
                <div className="text-4xl mb-3">{badge.Icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{badge.Name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{badge.Description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {badge.RequiredScore > 0 ? `Required: ${badge.RequiredScore} pts` : 'Special achievement'}
                  </span>
                  {!isUnlocked && user && (
                    <span className="text-xs text-primary-500 dark:text-primary-400">
                      {progressLabel}
                    </span>
                  )}
                </div>
                {!isUnlocked && (
                  <div className="mt-2 h-1.5 bg-gray-200 dark:bg-dark-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-500"
                      style={{ width: `${getProgress(badge)}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
