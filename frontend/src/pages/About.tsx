export default function About() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 1rem" }}>
      <h2>About Study Tracker</h2>

      <p style={{margin: "1rem 0"}}>
        Study Tracker is a full-stack web application built to record daily learning time, track continuous study streaks, and motivate users through points and badge achievements.
      </p>

      <h3>Core Features</h3>
      <ul style={{paddingLeft:"1.5rem", lineHeight:1.8}}>
        <li>Log study sessions with subject and duration</li>
        <li>Automatic continuous streak calculation</li>
        <li>Score accumulation and leaderboard ranking</li>
        <li>Badge unlock system based on learning achievements</li>
        <li>Personal profile to view statistics</li>
      </ul>

      <h3>Tech Stack</h3>
      <ul style={{paddingLeft:"1.5rem", lineHeight:1.8}}>
        <li>Frontend: React + TypeScript, React Router, Zustand</li>
        <li>Backend: .NET 10 Web API, Entity Framework Core</li>
        <li>Database: SQLite</li>
      </ul>

      <p style={{marginTop:"2rem", color:"#555"}}>
        This project is developed for learning practice.
      </p>
    </div>
  )
}