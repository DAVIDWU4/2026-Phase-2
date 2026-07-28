import { useMemo } from 'react';
import { useAuthStore } from '../stores/authStore';
import type { Badge } from '../types';

const mockBadges: Badge[] = [
  { Id: 1, Name: 'Newbie', Description: 'Complete your first study session', RequiredScore: 0, Icon: '🌱' },
  { Id: 2, Name: 'Week Warrior', Description: 'Study for 7 consecutive days', RequiredScore: 50, Icon: '💪' },
  { Id: 3, Name: 'Book Worm', Description: 'Complete 100 study sessions', RequiredScore: 100, Icon: '🐛' },
  { Id: 4, Name: 'Expert', Description: 'Reach 500 total points', RequiredScore: 500, Icon: '🎓' },
  { Id: 5, Name: 'Master', Description: 'Reach 1000 total points', RequiredScore: 1000, Icon: '👑' },
  { Id: 6, Name: 'Early Bird', Description: 'Study before 9 AM', RequiredScore: 20, Icon: '🌅' },
  { Id: 7, Name: 'Night Owl', Description: 'Study after 11 PM', RequiredScore: 20, Icon: '🦉' },
  { Id: 8, Name: 'Marathon', Description: 'Study for more than 4 hours in one day', RequiredScore: 100, Icon: '🏃' },
];

export default function Badges() {
  const user = useAuthStore(state => state.user);
  const unlockedBadgeIds = useMemo(
    () => user ? mockBadges.filter(b => b.RequiredScore <= user.TotalScore).map(b => b.Id) : [],
    [user]
  );
  const unlockedCount = unlockedBadgeIds.length;
  const totalCount = mockBadges.length;

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

      {mockBadges.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-4">🏆</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No badges loaded</h3>
          <p className="text-gray-500 dark:text-gray-400">Check back later for badge updates</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockBadges.map((badge) => {
            const isUnlocked = unlockedBadgeIds.includes(badge.Id);
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
                  <span className="text-xs text-gray-400 dark:text-gray-500">Required: {badge.RequiredScore} pts</span>
                  {!isUnlocked && user && (
                    <span className="text-xs text-primary-500 dark:text-primary-400">
                      {user.TotalScore}/{badge.RequiredScore}
                    </span>
                  )}
                </div>
                {!isUnlocked && (
                  <div className="mt-2 h-1.5 bg-gray-200 dark:bg-dark-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (user?.TotalScore || 0) / badge.RequiredScore * 100)}%` }}
                    ></div>
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