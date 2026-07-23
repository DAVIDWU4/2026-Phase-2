import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    // 从 localStorage 获取保存的主题，默认为 light
    const saved = localStorage.getItem('theme')
    return (saved as Theme) || 'light'
  })

  useEffect(() => {
    // 保存主题到 localStorage
    localStorage.setItem('theme', theme)
    // 应用主题到 HTML
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <button 
      onClick={toggleTheme}
      style={{
        background: 'transparent',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        padding: '8px',
        fontSize: '1.2rem',
        cursor: 'pointer',
        color: 'var(--header-text)',
        transition: 'all 0.3s'
      }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}