import { useState, useEffect } from 'react';
import { createStudyRecord, getStudyRecords } from '../api';
import type { StudyRecord } from '../types';
import { useAuthStore } from '../stores/authStore';

const subjects = [
  { id: 'math', name: 'Math', icon: '📐', color: 'bg-blue-500' },
  { id: 'programming', name: 'Programming', icon: '💻', color: 'bg-green-500' },
  { id: 'english', name: 'English', icon: '📚', color: 'bg-purple-500' },
  { id: 'science', name: 'Science', icon: '🔬', color: 'bg-orange-500' },
  { id: 'history', name: 'History', icon: '📜', color: 'bg-pink-500' },
  { id: 'art', name: 'Art', icon: '🎨', color: 'bg-cyan-500' },
];

export default function Study() {
  const user = useAuthStore(state => state.user);
  const userId = user?.Id ?? (user as any)?.id ?? 0;
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    const dur = parseInt(duration);
    if (!selectedSubject || !dur) {
      setMessage('Please select a subject and enter duration');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    try {
      await createStudyRecord({
        UserId: userId,
        StudyDate: new Date().toISOString(),
        DurationMinutes: dur,
        Subject: selectedSubject,
        EarnedScore: 0,
        StreakCount: 0,
        Notes: notes || null
      });
      setMessage('✅ Study session logged successfully!');
      setMessageType('success');
      setDuration('');
      setSelectedSubject('');
      setNotes('');
      loadRecords();
    } catch (err) {
      console.error('Failed to create record:', err);
      setMessage('❌ Failed to log study session. Is backend running?');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecords = async () => {
    if (!user || !userId) return;
    setIsLoading(true);
    try {
      const data = await getStudyRecords(userId);
      setRecords(data);
      setMessage('');
    } catch (err) {
      console.error('Failed to load records:', err);
      setMessage('❌ Failed to load records. Please check backend connection.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [user]);

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const getSubjectInfo = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId) || { id: subjectId, name: subjectId.charAt(0).toUpperCase() + subjectId.slice(1), icon: '📚', color: 'bg-gray-500' };
  };

  const calculateScore = (duration: number) => {
    return Math.floor(duration / 10);
  };

  // Statistics
  const totalMinutes = records.reduce((sum, r) => sum + r.DurationMinutes, 0);
  const totalScore = records.reduce((sum, r) => sum + r.EarnedScore, 0);
  const todayRecords = records.filter(r => new Date(r.StudyDate).toDateString() === new Date().toDateString());
  const todayMinutes = todayRecords.reduce((sum, r) => sum + r.DurationMinutes, 0);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">📚</span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Study Tracker</h1>
          <p className="text-gray-500 dark:text-gray-400">Log your study sessions and track progress</p>
        </div>
      </div>

      {message && (
        <div className={`flex items-center justify-between px-4 py-3 rounded-lg ${
          messageType === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
        }`}>
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-sm hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Study Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatDuration(totalMinutes)}</p>
            </div>
            <span className="text-3xl">⏱️</span>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Score Earned</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalScore} pts</p>
            </div>
            <span className="text-3xl">🏆</span>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Today's Study</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatDuration(todayMinutes)}</p>
            </div>
            <span className="text-3xl">🌟</span>
          </div>
        </div>
      </div>

      {/* Add Study Session Card */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Add Study Session</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Subject</label>
              <div className="grid grid-cols-3 gap-2">
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all duration-200 ${
                      selectedSubject === subject.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 shadow-md'
                        : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500'
                    }`}
                  >
                    <span className="text-xl">{subject.icon}</span>
                    <span className="text-xs text-gray-600 dark:text-gray-300">{subject.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Duration</label>
              <div className="space-y-2">
                {[15, 30, 45, 60, 90, 120].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setDuration(mins.toString())}
                    className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      duration === mins.toString()
                        ? 'bg-primary-600 text-white dark:bg-primary-700'
                        : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                    }`}
                  >
                    {mins < 60 ? `${mins} min` : `${mins / 60} hour${mins > 60 ? 's' : ''}`}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-end">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 border border-primary-200 dark:border-primary-700">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Estimated Score</div>
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  +{selectedSubject && duration ? calculateScore(parseInt(duration)) : '0'} pts
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  ({selectedSubject && duration ? parseInt(duration) : 0} minutes × 1pt/10min)
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Notes (optional)</label>
            <input
              type="text"
              placeholder="What did you study today?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field w-full"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !selectedSubject || !duration || !userId}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                'Log Study Session'
              )}
            </button>
            <button
              onClick={loadRecords}
              disabled={isLoading}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Study History */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Study History</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">{records.length} sessions</span>
        </div>
        
        {isLoading && records.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading records...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-5xl block mb-4">📝</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No study sessions yet</h3>
            <p className="text-gray-500 dark:text-gray-400">Start studying to track your progress!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => {
              const subjectInfo = getSubjectInfo(record.Subject);
              return (
                <div
                  key={record.Id}
                  className="p-4 bg-gray-50 dark:bg-dark-700/50 rounded-xl border border-gray-200 dark:border-dark-600 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${subjectInfo.color} flex items-center justify-center text-white`}>
                        <span>{subjectInfo.icon}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {new Date(record.StudyDate).toLocaleDateString()}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(record.StudyDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            📚 {subjectInfo.name}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            ⏱️ {formatDuration(record.DurationMinutes)}
                          </span>
                          <span className="text-green-500 dark:text-green-400 font-medium">
                            +{record.EarnedScore} pts
                          </span>
                          {record.StreakCount > 1 && (
                            <span className="text-orange-500 dark:text-orange-400">
                              🔥 {record.StreakCount} day streak
                            </span>
                          )}
                        </div>
                        {record.Notes && (
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 pl-1">
                            💡 {record.Notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}