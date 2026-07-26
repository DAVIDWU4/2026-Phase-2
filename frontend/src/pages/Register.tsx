import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerApi } from '../api'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    Username: '',
    Password: '',
    Nickname: '',
    Email: ''
  })
  const [errorMsg, setErrorMsg] = useState('')
  const [hasFieldError, setHasFieldError] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setHasFieldError(false)
    try {
      await registerApi(form)
      // 注册成功跳登录
      navigate('/login')
    } catch (err: any) {
      setErrorMsg(err.message || '注册失败，请检查信息')
      setHasFieldError(true)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <h2 className="auth-title">Register Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-item">
            <label>Username</label>
            <input
              name="Username"
              value={form.Username}
              onChange={handleChange}
              className={hasFieldError ? 'input-error' : ''}
            />
          </div>
          <div className="form-item">
            <label>Password</label>
            <input
              type="password"
              name="Password"
              value={form.Password}
              onChange={handleChange}
              className={hasFieldError ? 'input-error' : ''}
            />
          </div>
          <div className="form-item">
            <label>Nickname</label>
            <input
              name="Nickname"
              value={form.Nickname}
              onChange={handleChange}
              className={hasFieldError ? 'input-error' : ''}
            />
          </div>
          <div className="form-item">
            <label>Email</label>
            <input
              name="Email"
              value={form.Email}
              onChange={handleChange}
              className={hasFieldError ? 'input-error' : ''}
            />
          </div>

          {errorMsg && <p className="error-text">{errorMsg}</p>}

          <div className="btn-row">
            <button type="submit">Submit</button>
            <button type="button" onClick={() => navigate('/login')}>
              Switch to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}