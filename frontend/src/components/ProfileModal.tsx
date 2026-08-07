import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllBadges, getUserById, getUserUnlockedBadges } from '../api';
import type { Badge, User } from '../types';
import { useAuthStore } from '../stores/authStore';
import { useTranslation, getBadgeLabel } from '../i18n/useTranslation';
import { useLocaleStore } from '../stores/localeStore';
import { getAvatarGradient, getDisplayInitial, getDisplayName } from '../utils/normalize';

interface ProfileModalProps {
  userId: number | null;
  onClose: () => void;
}

export default function ProfileModal({ userId, onClose }: ProfileModalProps) {
  const { t } = useTranslation();
  const locale = useLocaleStore(s => s.locale);
  const currentUserId = useAuthStore(s => s.user?.Id);
  const isOwnProfile = currentUserId != null && userId === currentUserId;
  const [user, setUser] = useState<User | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [userData, allBadges, userBadges] = await Promise.all([
          getUserById(userId),
          getAllBadges(),
          getUserUnlockedBadges(userId),
        ]);
        setUser(userData);
        setBadges(allBadges.filter(b => b.Id > 0).sort((a, b) => a.Id - b.Id));
        setUnlockedIds(new Set(userBadges.filter(ub => ub.BadgeId > 0).map(ub => ub.BadgeId)));
      } catch {
        setError(t('profile.refreshFailed'));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [userId, t]);

  if (!userId) return null;

  const unlockedBadges = badges.filter(b => unlockedIds.has(b.Id));
  const displayName = getDisplayName(user?.Nickname, user?.Username, t('common.user'));
  const initial = getDisplayInitial(user?.Nickname, user?.Username);
  const gradient = getAvatarGradient(user?.Username || 'user');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-fade-in"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {isOwnProfile ? t('profile.title') : t('profile.otherTitle')}
            </h2>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none">
              ×
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary-200 border-t-primary-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">{t('profile.loading')}</p>
            </div>
          ) : error ? (
            <p className="text-red-500 text-center py-6">{error}</p>
          ) : user ? (
            <>
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl font-bold text-white shadow-lg`}>
                  {initial}
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{displayName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">@{user.Username}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t('profile.level')}</div>
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{user.Level}</div>
                </div>
                <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t('profile.totalScore')}</div>
                  <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{user.TotalScore}</div>
                </div>
                <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t('profile.streak')}</div>
                  <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{user.StreakDays}</div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t('badges.title')} ({unlockedBadges.length}/{badges.length})
                </h3>
                {unlockedBadges.length === 0 ? (
                  <p className="text-sm text-gray-400">{t('badges.emptyDesc')}</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {unlockedBadges.map(badge => (
                      <div
                        key={badge.Id}
                        title={getBadgeLabel(locale, badge.Id, 'desc', badge.Description)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700"
                      >
                        <span className="text-lg">{badge.Icon}</span>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                          {getBadgeLabel(locale, badge.Id, 'name', badge.Name)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isOwnProfile && (
                <Link
                  to="/profile"
                  onClick={onClose}
                  className="btn-primary w-full py-2.5 text-center block"
                >
                  {t('profile.viewFull')}
                </Link>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
