import { useState } from 'react'
import { createStudyRecord, getStudyRecords } from '../api'
import type { StudyRecord } from '../types'
import { useAuthStore } from '../stores/authStore'

export default function Study() {
  const user = useAuthStore(state => state.user);

  const [duration, setDuration] = useState('')
  const [subject, setSubject] = useState('')
  const [notes, setNotes] = useState('')
  const [records, setRecords] = useState<StudyRecord[]>([])
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    const dur = parseInt(duration)
    if (!dur || !subject.trim()) {
      setMessage('Please fill in subject and duration')
      return
    }

    try {
      await createStudyRecord({
        UserId: user!.Id,
        StudyDate: new Date().toISOString(),
        DurationMinutes: dur,
        Subject: subject.trim(),
        EarnedScore: 0,
        StreakCount: 0,
        Notes: notes || null
      })
      setMessage('✅ Study record created successfully!')
      setDuration('')
      setSubject('')
      setNotes('')
      loadRecords()
    } catch (err) {
      setMessage('❌ Failed to create record')
    }
  }

  const loadRecords = async () => {
    try {
      const data = await getStudyRecords(user!.Id)
      setRecords(data)
    } catch (err) {
      setMessage('❌ Failed to load records')
    }
  }

  return (
    <div style={{maxWidth: "900px", margin: "2rem auto", padding: "0 1rem"}}>
      <h2>📚 Study Tracker</h2>
      
      {message && <p style={{ color: message.includes('✅') ? 'green' : 'red' }}>{message}</p>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', flexDirection: 'column' }}>
        <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
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
        </div>
        <input
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div style={{display:"flex", gap:8}}>
          <button onClick={handleSubmit}>Submit Record</button>
          <button onClick={loadRecords}>Refresh List</button>
        </div>
      </div>

      <h3>My Study Records</h3>
      {records.length === 0 ? (
        <p>No records yet. Start studying!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {records.map((record) => (
            <li key={record.Id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <strong>{new Date(record.StudyDate).toLocaleDateString()}</strong> - 
              {record.Subject}: {record.DurationMinutes} min
              <span style={{ marginLeft: 12, color: 'green' }}>📈 +{record.EarnedScore} pts</span>
              <span style={{ marginLeft: 12, color: 'orange' }}>🔥 Streak: {record.StreakCount}</span>
              {record.Notes && <p style={{fontSize:"0.9rem", color:"#555", margin:"4px 0 0 0"}}>Note: {record.Notes}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}