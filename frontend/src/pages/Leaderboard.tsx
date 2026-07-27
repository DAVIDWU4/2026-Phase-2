import { useEffect, useState } from 'react';
import { getScores, createScore, deleteScore } from '../api';
import type { ScoreEntry } from '../types';
import { useAuthStore } from '../stores/authStore';

export default function Leaderboard() {
  const user = useAuthStore(state => state.user);
  const [scoreList, setScoreList] = useState<ScoreEntry[]>([]);
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadScores = async () => {
    setIsLoading(true);
    try {
      const data = await getScores();
      setScoreList(data);
      setError('');
    } catch {
      setError('Could not reach the backend. Is it running on port 5000?');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadScores();
  }, []);

  const handleAddScore = async () => {
    const numAmount = parseInt(amount);
    if (!reason.trim() || isNaN(numAmount)) {
      setError('Please fill in both reason and amount');
      return;
    }
    setIsLoading(true);
    try {
      await createScore({
        UserId: user!.Id,
        Amount: numAmount,
        Reason: reason.trim(),
      });
      setReason('');
      setAmount('');
      setError('');
      loadScores();
    } catch {
      setError('Failed to add score entry');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteScore = async (entryId: number) => {
    setIsLoading(true);
    try {
      await deleteScore(entryId);
      loadScores();
    } catch {
      setError('Failed to delete score entry');
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🏆</span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Score Leaderboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Track your progress and compete with others</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 mb-6">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Add New Score</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Reason for score"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-field w-full"
            />
          </div>
          <div className="w-[120px]">
            <input
              type="number"
              placeholder="Points"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field w-full"
            />
          </div>
          <button
            onClick={handleAddScore}
            disabled={isLoading}
            className="btn-primary whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Adding...
              </span>
            ) : (
              'Add Score'
            )}
          </button>
        </div>
      </div>

      {isLoading && scoreList.length === 0 ? (
        <div className="card text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading scores...</p>
        </div>
      ) : scoreList.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-4">📊</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No score records yet</h3>
          <p className="text-gray-500 dark:text-gray-400">Be the first to add a score!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {scoreList.map((entry, index) => (
            <div
              key={entry.Id}
              className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${getRankBg(index)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold w-10">{getRankIcon(index)}</span>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      User {entry.UserId}
                      {user?.Id === entry.UserId && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">You</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{entry.Reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-2xl font-bold ${
                    index === 0 ? 'text-yellow-600 dark:text-yellow-400' :
                    index === 1 ? 'text-gray-600 dark:text-gray-400' :
                    index === 2 ? 'text-orange-600 dark:text-orange-400' :
                    'text-gray-700 dark:text-gray-300'
                  }`}>
                    +{entry.Amount} pts
                  </span>
                  <button
                    onClick={() => handleDeleteScore(entry.Id)}
                    disabled={isLoading}
                    className="btn-danger disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}