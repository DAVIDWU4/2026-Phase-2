import { useEffect, useMemo, useState } from 'react';
import { getLeaderboard, getAllBadges, getUserUnlockedBadges } from '../api';
import type { LeaderboardEntry } from '../api';
import type { Badge } from '../types';
import { useAuthStore } from '../stores/authStore';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ProfileModal from '../components/ProfileModal';
import { useTranslation, getBadgeLabel } from '../i18n/useTranslation';
import { useLocaleStore } from '../stores/localeStore';
import { getAvatarGradient, getDisplayInitial, getDisplayName } from '../utils/normalize';

export default function Leaderboard() {
  const user = useAuthStore(state => state.user);
  const locale = useLocaleStore(s => s.locale);
  const { t } = useTranslation();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileUserId, setProfileUserId] = useState<number | null>(null);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [myBadgeIds, setMyBadgeIds] = useState<Set<number>>(new Set());

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

  useEffect(() => {
    if (!user?.Id) {
      setAllBadges([]);
      setMyBadgeIds(new Set());
      return;
    }
    const loadBadges = async () => {
      try {
        const [badges, unlocked] = await Promise.all([
          getAllBadges(),
          getUserUnlockedBadges(user.Id),
        ]);
        setAllBadges(badges.filter(b => b.Id > 0));
        setMyBadgeIds(new Set(unlocked.filter(ub => ub.BadgeId > 0).map(ub => ub.BadgeId)));
      } catch {
        setAllBadges([]);
        setMyBadgeIds(new Set());
      }
    };
    void loadBadges();
  }, [user?.Id]);

  const myUnlockedBadges = useMemo(
    () => allBadges.filter(b => myBadgeIds.has(b.Id)).slice(0, 5),
    [allBadges, myBadgeIds]
  );

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
      <ProfileModal userId={profileUserId} onClose={() => setProfileUserId(null)} />

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
            const name = getDisplayName(entry.Nickname, entry.Username, t('common.user'));
            const initial = getDisplayInitial(entry.Nickname, entry.Username);
            const gradient = getAvatarGradient(entry.Username || String(entry.UserId));

            return (
              <div
                key={entry.UserId}
                className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${getRankBg(index)} ${isCurrentUser ? 'ring-2 ring-primary-500' : ''}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-2xl font-bold w-10 shrink-0">{getRankIcon(index)}</span>
                    <button
                      type="button"
                      onClick={() => setProfileUserId(entry.UserId)}
                      title={t('profile.title')}
                      className={`w-11 h-11 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shrink-0 hover:ring-2 hover:ring-primary-400 hover:scale-105 transition-all cursor-pointer`}
                    >
                      {initial}
                    </button>
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => setProfileUserId(entry.UserId)}
                        className="font-semibold text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 text-left truncate block max-w-full"
                      >
                        {name}
                        {isCurrentUser && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">
                            {t('common.you')}
                          </span>
                        )}
                      </button>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('common.level')} {entry.Level} · {t('leaderboard.streak', { days: entry.StreakDays })}
                      </p>
                      {isCurrentUser && myUnlockedBadges.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {myUnlockedBadges.map(badge => (
                            <span
                              key={badge.Id}
                              title={getBadgeLabel(locale, badge.Id, 'name', badge.Name)}
                              className="text-base leading-none"
                            >
                              {badge.Icon}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
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
