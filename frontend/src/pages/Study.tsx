import { useState, useEffect, useCallback, useRef } from 'react';
import { createStudyRecord, getStudyRecords } from '../api';
import type { StudyRecord } from '../types';
import { useAuthStore } from '../stores/authStore';

const subjects = [
  { id: 'math', name: '数学', icon: '📐', color: 'bg-blue-500' },
  { id: 'programming', name: '编程', icon: '💻', color: 'bg-green-500' },
  { id: 'english', name: '英语', icon: '📚', color: 'bg-purple-500' },
  { id: 'science', name: '科学', icon: '🔬', color: 'bg-orange-500' },
  { id: 'history', name: '历史', icon: '📜', color: 'bg-pink-500' },
  { id: 'art', name: '艺术', icon: '🎨', color: 'bg-cyan-500' },
];

/** 积分档位：满 N 分钟获得对应积分（与后端 duration/10 一致） */
const SCORE_TIERS = [
  { minutes: 10, points: 1, label: '10 分钟' },
  { minutes: 30, points: 3, label: '30 分钟' },
  { minutes: 60, points: 6, label: '1 小时' },
  { minutes: 90, points: 9, label: '1.5 小时' },
  { minutes: 120, points: 12, label: '2 小时' },
];

const SESSION_STORAGE_KEY = 'study_active_session';

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

function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分` : `${hours}小时`;
  }
  return `${minutes}分钟`;
}

function calcEarnedPoints(minutes: number): number {
  return Math.floor(minutes / 10);
}

function getSubjectInfo(subjectId: string) {
  const found = subjects.find(s => s.id === subjectId);
  if (found) return found;
  return {
    id: subjectId,
    name: subjectId.charAt(0).toUpperCase() + subjectId.slice(1),
    icon: '📚',
    color: 'bg-gray-500',
  };
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
  } catch { /* ignore */ }
  return null;
}

function storeSession(session: ActiveSession | null) {
  if (session) {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } else {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

export default function Study() {
  const user = useAuthStore(state => state.user);
  const refreshUser = useAuthStore(state => state.refreshUser);
  const userId = user?.Id ?? 0;

  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [checkInModal, setCheckInModal] = useState<{
    subjectName: string;
    isFirstToday: boolean;
  } | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Timer state
  const [isStudying, setIsStudying] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startedAtRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      setMessage('加载学习记录失败，请重新登录后再试。');
      setMessageType('error');
    } finally {
      setIsFetching(false);
    }
  }, [user, userId]);

  useEffect(() => {
    void fetchRecords();
  }, [fetchRecords]);

  // Restore in-progress session after refresh
  useEffect(() => {
    const stored = readStoredSession();
    if (stored) {
      setSelectedSubject(stored.subject);
      startedAtRef.current = stored.startedAt;
      const elapsed = Math.floor((Date.now() - stored.startedAt) / 1000);
      setElapsedSeconds(elapsed);
      setIsStudying(true);
    }
  }, []);

  // Timer tick
  useEffect(() => {
    if (!isStudying || startedAtRef.current === null) return;

    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current!) / 1000));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStudying]);

  // Warn before leaving during active session
  useEffect(() => {
    if (!isStudying) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isStudying]);

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const currentPoints = calcEarnedPoints(elapsedMinutes);
  const nextTier = SCORE_TIERS.find(t => elapsedMinutes < t.minutes);

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
            Notes: '开始学习打卡',
          });
          await refreshUser();
          await fetchRecords();
        }
        setCheckInModal({
          subjectName: getSubjectInfo(subject).name,
          isFirstToday,
        });
      } catch (err) {
        const errText = err instanceof Error ? err.message : '打卡失败';
        setMessage(`❌ 自动打卡失败：${errText}`);
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
      setMessage('学习时间不足 1 分钟，请继续学习或取消本次记录。');
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

      const points = calcEarnedPoints(minutes);
      setMessage(`✅ 学习完成！本次 ${formatDuration(minutes)}，获得 ${points} 积分`);
      setMessageType('success');
      setNotes('');
      cancelStudy();
    } catch (err) {
      const errText = err instanceof Error ? err.message : '提交失败';
      setMessage(`❌ 保存失败：${errText}`);
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (!continueSession || isStudying) return;
    void startStudy(continueSession.Subject);
  };

  return (
    <div className="animate-fade-in space-y-5 pb-8">
      {/* 打卡成功弹窗 */}
      {checkInModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setCheckInModal(null)}
        >
          <div
            className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl max-w-sm w-full p-6 text-center animate-fade-in"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkin-modal-title"
          >
            <div className="text-5xl mb-4">
              {checkInModal.isFirstToday ? '🎉' : '✅'}
            </div>
            <h3 id="checkin-modal-title" className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {checkInModal.isFirstToday ? '今日打卡成功！' : '已开始学习！'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-1">
              {checkInModal.isFirstToday
                ? '恭喜你完成今日首次打卡，连续学习天数已更新。'
                : '今日已打卡，计时已开始，继续加油！'}
            </p>
            <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-6">
              科目：{checkInModal.subjectName}
            </p>
            <button
              type="button"
              onClick={() => setCheckInModal(null)}
              className="btn-primary w-full py-3"
            >
              知道了，开始学习
            </button>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">📚</span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">学习打卡</h1>
          <p className="text-gray-500 dark:text-gray-400">计时学习，按实际时长获得积分</p>
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
            关闭
          </button>
        </div>
      )}

      {/* ── 顶部：昨日 / 上次学习，点击继续 ── */}
      <div className="card border-2 border-primary-200 dark:border-primary-700">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
          {isShowingYesterday ? '昨日学习' : '继续上次学习'}
        </h2>

        {isFetching ? (
          <p className="text-gray-400 text-sm">加载中…</p>
        ) : continueSession ? (
          <button
            type="button"
            onClick={handleContinue}
            disabled={isStudying || isSubmitting || isCheckingIn || !userId}
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
          >
            {(() => {
              const info = getSubjectInfo(continueSession.Subject);
              return (
                <>
                  <div className={`w-14 h-14 rounded-xl ${info.color} flex items-center justify-center text-2xl shrink-0`}>
                    {info.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{info.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {new Date(continueSession.StudyDate).toLocaleDateString()} · {formatDuration(continueSession.DurationMinutes)} · +{continueSession.EarnedScore} 分
                    </p>
                  </div>
                  <span className="shrink-0 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium text-sm">
                    继续学习 →
                  </span>
                </>
              );
            })()}
          </button>
        ) : (
          <div className="text-center py-6 text-gray-400 dark:text-gray-500">
            <span className="text-3xl block mb-2">🌱</span>
            <p>还没有学习记录，选择下方科目开始第一次学习吧</p>
          </div>
        )}
      </div>

      {/* ── 中部：选科目 + 计时学习 ── */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {isStudying ? '正在学习' : '选择科目开始学习'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {isStudying
            ? '计时进行中，学完后点击「结束学习」保存记录'
            : '时长由计时器自动记录，每满 10 分钟获得 1 积分'}
        </p>

        {isStudying ? (
          /* Active timer view */
          <div className="space-y-5">
            <div className="text-center py-6 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 border border-primary-200 dark:border-primary-700">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4 ${getSubjectInfo(selectedSubject).color} text-white`}>
                <span>{getSubjectInfo(selectedSubject).icon}</span>
                <span>{getSubjectInfo(selectedSubject).name}</span>
              </div>
              <div className="text-5xl font-mono font-bold text-primary-600 dark:text-primary-400 tracking-wider">
                {formatTimer(elapsedSeconds)}
              </div>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                当前可获得 <span className="font-bold text-green-600 dark:text-green-400">{currentPoints} 积分</span>
                {nextTier && (
                  <span> · 再学 {nextTier.minutes - elapsedMinutes} 分钟可达 {nextTier.points} 积分</span>
                )}
              </p>
            </div>

            {/* Tier progress */}
            <div className="flex gap-1">
              {SCORE_TIERS.map(tier => (
                <div key={tier.minutes} className="flex-1 text-center">
                  <div className={`h-2 rounded-full mb-1 ${elapsedMinutes >= tier.minutes ? 'bg-primary-500' : 'bg-gray-200 dark:bg-dark-600'}`} />
                  <span className="text-xs text-gray-400">{tier.label}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => void finishStudy()}
                disabled={isSubmitting || elapsedMinutes < 1}
                className="btn-primary flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '保存中…' : '✅ 结束学习'}
              </button>
              <button
                type="button"
                onClick={cancelStudy}
                disabled={isSubmitting}
                className="btn-secondary py-3"
              >
                取消
              </button>
            </div>
            {elapsedMinutes < 1 && (
              <p className="text-xs text-center text-gray-400">至少学习 1 分钟才能保存记录</p>
            )}
          </div>
        ) : (
          /* Subject selection view */
          <div className="space-y-4">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {subjects.map(subject => (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => setSelectedSubject(subject.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedSubject === subject.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 shadow-md ring-2 ring-primary-300'
                      : 'border-gray-200 dark:border-dark-600 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                  }`}
                >
                  <span className="text-2xl">{subject.icon}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-300">{subject.name}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">备注（可选）</label>
              <input
                type="text"
                placeholder="今天打算学什么？"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="input-field w-full"
              />
            </div>

            <button
              type="button"
              onClick={() => void startStudy(selectedSubject)}
              disabled={!selectedSubject || !userId || isCheckingIn}
              className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCheckingIn
                ? '打卡中…'
                : selectedSubject
                  ? `▶ 开始学${getSubjectInfo(selectedSubject).name}`
                  : '请先选择科目'}
            </button>

            {/* Score tier reference */}
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-dark-700/50 text-xs text-gray-500 dark:text-gray-400">
              <p className="font-medium text-gray-600 dark:text-gray-300 mb-1">积分规则</p>
              <p>每满 10 分钟获得 1 积分 · 30 分钟 = 3 分 · 1 小时 = 6 分 · 2 小时 = 12 分</p>
            </div>
          </div>
        )}
      </div>

      {/* ── 底部：历史记录 ── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">学习历史</h2>
          <button
            type="button"
            onClick={() => void fetchRecords()}
            disabled={isFetching}
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50"
          >
            {isFetching ? '刷新中…' : '刷新'}
          </button>
        </div>

        {isFetching && records.length === 0 ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary-200 border-t-primary-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">加载中…</p>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-10">
            <span className="text-4xl block mb-3">📝</span>
            <p className="text-gray-500 dark:text-gray-400">还没有学习记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map(record => {
              const info = getSubjectInfo(record.Subject);
              const isYesterday = new Date(record.StudyDate).toDateString() === (() => {
                const d = new Date(); d.setDate(d.getDate() - 1); return d.toDateString();
              })();
              return (
                <button
                  key={record.Id}
                  type="button"
                  onClick={() => void startStudy(record.Subject)}
                  disabled={isStudying || isSubmitting || isCheckingIn}
                  className="w-full p-4 bg-gray-50 dark:bg-dark-700/50 rounded-xl border border-gray-200 dark:border-dark-600 hover:border-primary-300 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${info.color} flex items-center justify-center text-white shrink-0`}>
                      {info.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{info.name}</span>
                        {isYesterday && (
                          <span className="text-xs px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded">昨日</span>
                        )}
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(record.StudyDate).toLocaleDateString()}{' '}
                          {new Date(record.StudyDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span>⏱ {formatDuration(record.DurationMinutes)}</span>
                        <span className="text-green-500 dark:text-green-400 font-medium">+{record.EarnedScore} 分</span>
                        {record.StreakCount > 1 && (
                          <span className="text-orange-500">🔥 连续 {record.StreakCount} 天</span>
                        )}
                      </div>
                      {record.Notes && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 truncate">{record.Notes}</p>
                      )}
                    </div>
                    {!isStudying && (
                      <span className="shrink-0 text-xs text-primary-500 dark:text-primary-400">再学一次 →</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
