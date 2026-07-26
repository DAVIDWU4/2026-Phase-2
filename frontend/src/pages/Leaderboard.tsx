import { useEffect, useState } from 'react'
import { getScores, createScore, deleteScore } from '../api'
import type { ScoreEntry } from '../types'
import { useAuthStore } from '../stores/authStore'

export default function Leaderboard() {
  const user = useAuthStore(state => state.user);

  const [scoreList, setScoreList] = useState<ScoreEntry[]>([])
  const [reason, setReason] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  const loadScores = async () => {
    try {
      const data = await getScores()
      setScoreList(data)
    } catch {
      setError('Could not reach the backend. Is it running on port 5000?')
    }
  }

  useEffect(() => {
    loadScores()
  }, [])

  // 添加积分：自动带上当前登录UserId，不再手动填名字
  const handleAddScore = async () => {
    const numAmount = parseInt(amount)
    if (!reason.trim() || isNaN(numAmount)) {
      setError('Fill reason and amount');
      return;
    }
    try {
      await createScore({
        UserId: user!.Id,
        Amount: numAmount,
        Reason: reason.trim(),
      })
      setReason('')
      setAmount('')
      setError('')
      loadScores()
    } catch {
      setError('Failed to add score entry')
    }
  }

  const handleDeleteScore = async (entryId: number) => {
    await deleteScore(entryId)
    loadScores()
  }

  return (
    <div style={{maxWidth: "900px", margin: "2rem auto", padding: "0 1rem"}}>
      <h2>🏆 Score Leaderboard</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        <input
          placeholder="Reason for score"
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
        <input
          placeholder="Points"
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={{ width: 100 }}
        />
        <button onClick={handleAddScore}>Add Score Record</button>
      </div>

      {scoreList.length === 0 && !error && <p>No score records yet.</p>}

      <ol>
        {scoreList.map((entry, index) => (
          <li key={entry.Id} style={{ marginBottom: 8 }}>
            <strong>#{index + 1}</strong>
            User {entry.UserId} | {entry.Amount} pts
            &nbsp; — {entry.Reason}
            <button
              onClick={() => handleDeleteScore(entry.Id)}
              style={{ marginLeft: 12, fontSize: 12 }}
            >
              Remove
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}