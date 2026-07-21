import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import Leaderboard from './pages/Leaderboard'
import About from './pages/About'
import Study from './pages/Study'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <header>
        <h1>Study Tracker App</h1>
        <nav>
          <NavLink to="/" end>Leaderboard</NavLink>
          <NavLink to="/study">Study</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Leaderboard />} />
          <Route path="/study" element={<Study />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
