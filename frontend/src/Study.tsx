import { useState } from 'react'
import { createStudyRecord, getStudyRecords } from '../api'
import type { StudyRecord } from '../types'

export default function Study() {
  const [userId, setUserId] = useState('1')
  const [duration, setDuration] = useState('')
  const [subject, setSubject] = useState('')
  const [records, setRecords] = useState<StudyRecord[]>([])
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    const dur = parseInt(duration)
    if (!dur || !subject.trim()) {
      setMessage('Please fill in all fields')
      return
    }

    try {
      await createStudyRecord({
        rID: parseInt(userId),
        Date: new Date().toISOString(),
        Duration: dur,
        Subject: subject.trim(),
      })
      setMessage('✅ Study record created successfully!')
      setDuration('')
      setSubject('')
      loadRecords()
    } catch (err) {
      setMessage('❌ Failed to create record')
    }
  }

  const loadRecords = async () => {
    try {
      const data = await getStudyRecords(parseInt(userId))
      setRecords(data)
    } catch (err) {
      setMessage('❌ Failed to load records')
    }
  }

  return (
    <div>
      <h2>📚 Study Tracker</h2>
      
      {message && <p style={{ color: message.includes('✅') ? 'green' : 'red' }}>{message}</p>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          type="number"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{ width: 80 }}
        />
        <input
          type="number"
          placeholder="Duration (minutes)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
        <input
          placeholder="Subject (e.g., Programming)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <button onClick={handleSubmit}>Submit</button>
        <button onClick={loadRecords}>Refresh</button>
      </div>

      <h3>My Study Records</h3>
      {records.length === 0 ? (
        <p>No records yet. Start studying!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {records.map((record) => (
            <li key={record.RecordID} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <strong>{new Date(record.Date).toLocaleDateString()}</strong> - 
              {record.Subject}: {record.Duration} min
              <span style={{ marginLeft: 12, color: 'green' }}>📈 +{record.EarnedPoints} pts</span>
              <span style={{ marginLeft: 12, color: 'orange' }}>🔥 {record.StreakCount} days</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}