import { useState } from 'react';
import { createStudyRecord, getStudyRecords } from '../api';
import type { StudyRecord } from '../types';
import { useAuthStore } from '../stores/authStore';

export default function Study() {
  const user = useAuthStore(state => state.user);

  const [duration, setDuration] = useState('');
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    const dur = parseInt(duration);
    if (!dur || !subject.trim()) {
      setMessage('Please fill in subject and duration');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    try {
      await createStudyRecord({
        UserId: user!.Id,
        StudyDate: new Date().toISOString(),
        DurationMinutes: dur,
        Subject: subject.trim(),
        EarnedScore: 0,
        StreakCount: 0,
        Notes: notes || null
      });
      setMessage('✅ Study record created successfully!');
      setMessageType('success');
      setDuration('');
      setSubject('');
      setNotes('');
      loadRecords();
    } catch (err) {
      setMessage('❌ Failed to create record');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const data = await getStudyRecords(user!.Id);
      setRecords(data);
    } catch (err) {
      setMessage('❌ Failed to load records');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const getSubjectColor = (subject: string) => {
    const colors = [
      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    ];
    const index = subject.length % colors.length;
    return colors[index];
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">📚</span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Study Tracker</h1>
          <p className="text-gray-500 dark:text-gray-400">Log your study sessions and track progress</p>
        </div>
      </div>

      {message && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg mb-6 ${
          messageType === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
        }`}>
          {message}
        </div>
      )}

      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Add Study Session</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Duration (minutes)</label>
              <input
                type="number"
                placeholder="e.g., 60"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Subject</label>
              <input
                type="text"
                placeholder="e.g., Programming, Math, English"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input-field w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Notes (optional)</label>
            <input
              type="text"
              placeholder="Add notes about what you studied..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field w-full"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                'Submit Record'
              )}
            </button>
            <button
              onClick={loadRecords}
              disabled={isLoading}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Refresh List
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">My Study Records</h2>
        
        {isLoading && records.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading records...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-5xl block mb-4">📝</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No records yet</h3>
            <p className="text-gray-500 dark:text-gray-400">Start studying and track your progress!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <div
                key={record.Id}
                className="p-4 bg-gray-50 dark:bg-dark-700/50 rounded-xl border border-gray-200 dark:border-dark-600 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📚</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {new Date(record.StudyDate).toLocaleDateString()}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSubjectColor(record.Subject)}`}>
                          {record.Subject}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span>⏱️ {formatDuration(record.DurationMinutes)}</span>
                        <span className="text-green-500 dark:text-green-400">📈 +{record.EarnedScore} pts</span>
                        {record.StreakCount > 0 && (
                          <span className="text-orange-500 dark:text-orange-400">🔥 {record.StreakCount} day streak</span>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}