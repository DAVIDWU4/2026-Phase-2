import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { requestPasswordReset } from '../api'
import ThemeToggle from '../components/ThemeToggle'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('')
    setErrorMsg('')

    try {
      await requestPasswordReset({ Email: email })
      setStatus('If the email exists, a reset code has been sent. Check the app logs or your inbox.')
      navigate(`/reset-password?email=${encodeURIComponent(email)}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setErrorMsg(message || 'Unable to send reset code. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full blur-3xl dark:bg-primary-900/30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-100 rounded-full blur-3xl dark:bg-secondary-900/30"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="flex justify-end mb-6">
          <ThemeToggle />
        </div>

        <div className="card shadow-auth animate-scale-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl mb-4">
              <span className="text-3xl">✉️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Forgot Password</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Enter your email and we will send you a verification code.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="your@email.com"
                required
              />
            </div>

            {errorMsg && (
              <div className="text-sm text-red-500 dark:text-red-400">{errorMsg}</div>
            )}
            {status && (
              <div className="text-sm text-green-600 dark:text-green-400">{status}</div>
            )}

            <button type="submit" className="w-full btn-primary text-base py-3">
              Send Reset Code
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full btn-outline text-base py-3"
            >
              Back to Login
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
