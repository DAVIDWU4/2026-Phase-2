import { useState, useEffect, useCallback, useRef } from 'react';
import { createStudyRecord, getStudyRecords } from '../api';
import type { StudyRecord } from '../types';
import { useAuthStore } from '../stores/authStore';
import LanguageSwitcher from '../components/LanguageSwitcher';
import StudyQuiz from '../components/StudyQuiz';
import { useTranslation, getSubjectLabel } from '../i18n/useTranslation';
import { useLocaleStore } from '../stores/localeStore';

const SUBJECTS = [
  { id: 'math', icon: '📐', color: 'bg-blue-500' },
  { id: 'programming', icon: '💻', color: 'bg-green-500' },
  { id: 'english', icon: '📚', color: 'bg-purple-500' },
  { id: 'science', icon: '🔬', color: 'bg-orange-500' },
  { id: 'history', icon: '📜', color: 'bg-pink-500' },
  { id: 'art', icon: '🎨', color: 'bg-cyan-500' },
];

const SCORE_TIERS = [
  { min: 1, pts: 1 },
  { min: 10, pts: 5 },
  { min: 20, pts: 10 },
  { min: 30, pts: 15 },
  { min: 60, pts: 30 },
] as const;

const SESSION_STORAGE_KEY = 'study_active_session';
const CHECKIN_NOTE = 'study-checkin';

interface ActiveSession {
  subject: string;
  startedAt: number;
  checkInDone: boolean;
}

function formatTimer(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function calcEarnedPoints(minutes: number): number {
  if (minutes >= 60) return 30;
  if (minutes >= 30) return 15;
  if (minutes >= 20) return 10;
  if (minutes >= 10) return 5;
  if (minutes >= 1) return 1;
  return 0;
}

function getYesterdayLastSession(records: StudyRecord[]): StudyRecord | null {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  const yesterdayRecords = records
    .filter(r => new Date(r.StudyDate).toDateString() === yesterdayStr)
    .sort((a, b) => new Date(b.StudyDate).getTime() - new Date(a.StudyDate).getTime());
  return yesterdayRecords[0] ?? null;
}

function getLastSession(records: StudyRecord[]): StudyRecord | null {
  if (records.length === 0) return null;
  return [...records].sort(
    (a, b) => new Date(b.StudyDate).getTime() - new Date(a.StudyDate).getTime()
  )[0];
}

function hasCheckedInToday(records: StudyRecord[]): boolean {
  const today = new Date().toDateString();
  return records.some(r => new Date(r.StudyDate).toDateString() === today);
}

function readStoredSession(): ActiveSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActiveSession;
    if (parsed.subject && parsed.startedAt) return parsed;
  } catch { /* ignore corrupt session */ }
  return null;
}

function storeSession(session: ActiveSession | null) {
  if (session) sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  else sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

export default function Study() {
  const user = useAuthStore(state => state.user);
  const refreshUser = useAuthStore(state => state.refreshUser);
  const userId = user?.Id ?? 0;
  const { t } = useTranslation();
  const locale = useLocaleStore(s => s.locale);

  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [checkInModal, setCheckInModal] = useState<{ subjectName: string; isFirstToday: boolean } | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isStudying, setIsStudying] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startedAtRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const formatDuration = useCallback((minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0
        ? t('study.duration.hours', { h: hours, m: mins })
        : t('study.duration.hour', { h: hours });
    }
    return t('study.duration.minutes', { m: minutes });
  }, [t]);

  const subjectLabel = useCallback((subjectId: string) => {
    const found = SUBJECTS.find(s => s.id === subjectId);
    const name = getSubjectLabel(locale, subjectId);
    return {
      id: subjectId,
      name,
      icon: found?.icon ?? '📚',
      color: found?.color ?? 'bg-gray-500',
    };
  }, [locale]);

  const fetchRecords = useCallback(async () => {
    if (!user || !userId) {
      setRecords([]);
      setIsFetching(false);
      return;
    }
    setIsFetching(true);
    try {
      const data = await getStudyRecords(userId);
      setRecords(data);
    } catch (err) {
      console.error('Failed to load records:', err);
      setMessage(t('study.err.loadFailed'));
      setMessageType('error');
    } finally {
      setIsFetching(false);
    }
  }, [user, userId, t]);

  useEffect(() => { void fetchRecords(); }, [fetchRecords]);

  useEffect(() => {
    const stored = readStoredSession();
    if (stored) {
      setSelectedSubject(stored.subject);
      startedAtRef.current = stored.startedAt;
      setElapsedSeconds(Math.floor((Date.now() - stored.startedAt) / 1000));
      setIsStudying(true);
    }
  }, []);

  useEffect(() => {
    if (!isStudying || startedAtRef.current === null) return;
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current!) / 1000));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isStudying]);

  useEffect(() => {
    if (!isStudying) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isStudying]);

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const currentPoints = calcEarnedPoints(elapsedMinutes);
  const nextTier = SCORE_TIERS.find(tier => elapsedMinutes < tier.min);
  const nextTierMin = nextTier?.min;
  const nextTierPts = nextTier?.pts ?? 0;

  const yesterdaySession = getYesterdayLastSession(records);
  const continueSession = yesterdaySession ?? getLastSession(records);
  const isShowingYesterday = yesterdaySession !== null;

  const startStudy = async (subject: string, options?: { skipCheckIn?: boolean }) => {
    if (!subject || !userId || isStudying || isCheckingIn) return;

    if (!options?.skipCheckIn) {
      setIsCheckingIn(true);
      try {
        const isFirstToday = !hasCheckedInToday(records);
        if (isFirstToday) {
          await createStudyRecord({
            UserId: userId,
            StudyDate: new Date().toISOString(),
            DurationMinutes: 1,
            Subject: subject,
            Notes: CHECKIN_NOTE,
          });
          await refreshUser();
          await fetchRecords();
        }
        setCheckInModal({
          subjectName: subjectLabel(subject).name,
          isFirstToday,
        });
      } catch (err) {
        const errText = err instanceof Error ? err.message : t('study.err.saveFailed', { msg: '' });
        setMessage(t('study.err.checkInFailed', { msg: errText }));
        setMessageType('error');
        setIsCheckingIn(false);
        return;
      } finally {
        setIsCheckingIn(false);
      }
    }

    setSelectedSubject(subject);
    const now = Date.now();
    startedAtRef.current = now;
    storeSession({ subject, startedAt: now, checkInDone: true });
    setElapsedSeconds(0);
    setIsStudying(true);
    setMessage('');
  };

  const cancelStudy = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    startedAtRef.current = null;
    storeSession(null);
    setIsStudying(false);
    setElapsedSeconds(0);
  };

  const finishStudy = async () => {
    if (!startedAtRef.current || !selectedSubject || !userId) return;
    const minutes = Math.floor(elapsedSeconds / 60);
    if (minutes < 1) {
      setMessage(t('study.err.tooShort'));
      setMessageType('error');
      return;
    }

    setIsSubmitting(true);
    try {
      await createStudyRecord({
        UserId: userId,
        StudyDate: new Date().toISOString(),
        DurationMinutes: minutes,
        Subject: selectedSubject,
        Notes: notes || null,
      });
      await refreshUser();
      await fetchRecords();
      setMessage(t('study.success.finish', {
        duration: formatDuration(minutes),
        points: calcEarnedPoints(minutes),
      }));
      setMessageType('success');
      setNotes('');
      cancelStudy();
    } catch (err) {
      const errText = err instanceof Error ? err.message : '';
      setMessage(t('study.err.saveFailed', { msg: errText }));
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkInOverlay = checkInModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={() => setCheckInModal(null)}>
      <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl max-w-sm w-full p-6 text-center animate-fade-in"
        onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="text-5xl mb-4">{checkInModal.isFirstToday ? '🎉' : '✅'}</div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {checkInModal.isFirstToday ? t('study.checkIn.titleFirst') : t('study.checkIn.titleAgain')}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-1">
          {checkInModal.isFirstToday ? t('study.checkIn.descFirst') : t('study.checkIn.descAgain')}
        </p>
        <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-6">
          {t('study.checkIn.subject', { name: checkInModal.subjectName })}
        </p>
        <button type="button" onClick={() => setCheckInModal(null)} className="btn-primary w-full py-3">
          {t('study.checkIn.confirm')}
        </button>
      </div>
    </div>
  );

  // Focused practice session: quiz only + compact timer / back controls
  if (isStudying) {
    const subject = subjectLabel(selectedSubject);
    return (
      <div className="animate-fade-in min-h-[70vh] flex flex-col pb-8">
        {checkInOverlay}

        <div className="flex items-center justify-between gap-3 mb-5">
          <button
            type="button"
            onClick={cancelStudy}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
              text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600
              hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors disabled:opacity-50"
          >
            <span aria-hidden>←</span>
            {t('study.backToSubjects')}
          </button>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700">
            <span className="text-sm" aria-hidden>{subject.icon}</span>
            <span className="font-mono text-lg font-bold text-primary-600 dark:text-primary-400 tracking-wide tabular-nums">
              {formatTimer(elapsedSeconds)}
            </span>
            <span className="text-xs text-green-600 dark:text-green-400 font-medium hidden sm:inline">
              +{currentPoints}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t('study.sessionSubject', { subject: subject.name })}
          {nextTierMin && (
            <span className="ml-1">{t('study.nextTier', { mins: nextTierMin - elapsedMinutes, pts: nextTierPts })}</span>
          )}
        </p>

        <div className="card flex-1">
          <StudyQuiz key={selectedSubject} subjectId={selectedSubject} focus />
        </div>

        <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={() => void finishStudy()}
            disabled={isSubmitting || elapsedMinutes < 1}
            className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t('study.saving') : `✅ ${t('study.finish')}`}
          </button>
          {elapsedMinutes < 1 && (
            <p className="text-xs text-center text-gray-400">{t('study.minOneMinute')}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-5 pb-8">
      {checkInOverlay}

      <div className="flex items-center gap-3">
        <span className="text-3xl">📚</span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('study.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('study.subtitle')}</p>
        </div>
      </div>

      {message && (
        <div className={`flex items-center justify-between px-4 py-3 rounded-lg ${
          messageType === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
        }`}>
          <span>{message}</span>
          <button type="button" onClick={() => setMessage('')} className="text-sm hover:underline shrink-0 ml-3">
            {t('common.close')}
          </button>
        </div>
      )}

      <div className="card border-2 border-primary-200 dark:border-primary-700">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
          {isShowingYesterday ? t('study.yesterday') : t('study.continueLast')}
        </h2>
        {isFetching ? (
          <p className="text-gray-400 text-sm">{t('common.loading')}</p>
        ) : continueSession ? (
          <button type="button" onClick={() => void startStudy(continueSession.Subject)}
            disabled={isSubmitting || isCheckingIn || !userId}
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left">
            {(() => {
              const info = subjectLabel(continueSession.Subject);
              return (
                <>
                  <div className={`w-14 h-14 rounded-xl ${info.color} flex items-center justify-center text-2xl shrink-0`}>{info.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{info.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {new Date(continueSession.StudyDate).toLocaleDateString()} · {formatDuration(continueSession.DurationMinutes)} · +{continueSession.EarnedScore} {t('common.pts')}
                    </p>
                  </div>
                  <span className="shrink-0 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium text-sm">{t('study.continueBtn')}</span>
                </>
              );
            })()}
          </button>
        ) : (
          <div className="text-center py-6 text-gray-400 dark:text-gray-500">
            <span className="text-3xl block mb-2">🌱</span>
            <p>{t('study.noRecords')}</p>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {t('study.pickSubject')}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t('study.durationHint')}
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {SUBJECTS.map(subject => (
              <button key={subject.id} type="button" onClick={() => setSelectedSubject(subject.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedSubject === subject.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 shadow-md ring-2 ring-primary-300'
                    : 'border-gray-200 dark:border-dark-600 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                }`}>
                <span className="text-2xl">{subject.icon}</span>
                <span className="text-xs text-gray-600 dark:text-gray-300">{subjectLabel(subject.id).name}</span>
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t('study.notes')}</label>
            <input type="text" placeholder={t('study.notesPlaceholder')} value={notes}
              onChange={e => setNotes(e.target.value)} className="input-field w-full" />
          </div>
          <button type="button" onClick={() => void startStudy(selectedSubject)}
            disabled={!selectedSubject || !userId || isCheckingIn}
            className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed">
            {isCheckingIn ? t('study.checkingIn') : selectedSubject
              ? t('study.startSubject', { subject: subjectLabel(selectedSubject).name })
              : t('study.pickSubjectFirst')}
          </button>
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-dark-700/50 text-xs text-gray-500 dark:text-gray-400">
            <p className="font-medium text-gray-600 dark:text-gray-300 mb-1">{t('study.scoreRules')}</p>
            <p>{t('study.scoreRulesDesc')}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('study.history')}</h2>
          <button type="button" onClick={() => void fetchRecords()} disabled={isFetching}
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50">
            {isFetching ? t('common.refreshing') : t('common.refresh')}
          </button>
        </div>
        {isFetching && records.length === 0 ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary-200 border-t-primary-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-10">
            <span className="text-4xl block mb-3">📝</span>
            <p className="text-gray-500 dark:text-gray-400">{t('study.noHistory')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map(record => {
              const info = subjectLabel(record.Subject);
              const isYesterday = new Date(record.StudyDate).toDateString() === (() => {
                const d = new Date(); d.setDate(d.getDate() - 1); return d.toDateString();
              })();
              return (
                <button key={record.Id} type="button" onClick={() => void startStudy(record.Subject)}
                  disabled={isSubmitting || isCheckingIn}
                  className="w-full p-4 bg-gray-50 dark:bg-dark-700/50 rounded-xl border border-gray-200 dark:border-dark-600 hover:border-primary-300 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${info.color} flex items-center justify-center text-white shrink-0`}>{info.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{info.name}</span>
                        {isYesterday && <span className="text-xs px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded">{t('study.yesterdayTag')}</span>}
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(record.StudyDate).toLocaleDateString()}{' '}
                          {new Date(record.StudyDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span>⏱ {formatDuration(record.DurationMinutes)}</span>
                        <span className="text-green-500 dark:text-green-400 font-medium">+{record.EarnedScore} {t('common.pts')}</span>
                        {record.StreakCount > 1 && <span className="text-orange-500">🔥 {t('study.streakDays', { count: record.StreakCount })}</span>}
                      </div>
                      {record.Notes && record.Notes !== CHECKIN_NOTE && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 truncate">{record.Notes}</p>
                      )}
                    </div>
                    <span className="shrink-0 text-xs text-primary-500 dark:text-primary-400">{t('study.studyAgain')}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <LanguageSwitcher />
    </div>
  );
}
