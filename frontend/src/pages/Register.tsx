import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import ThemeToggle from '../components/ThemeToggle';

type FormErrors = Partial<Record<'Username' | 'Password' | 'Email', string>>;

function validate(form: { Username: string; Password: string; Email: string }): FormErrors {
  const errors: FormErrors = {};
  if (!form.Username.trim()) errors.Username = 'Username is required.';
  else if (form.Username.trim().length < 3) errors.Username = 'Username must be at least 3 characters.';
  if (!form.Password) errors.Password = 'Password is required.';
  else if (form.Password.length < 6) errors.Password = 'Password must be at least 6 characters.';
  if (!form.Email.trim()) errors.Email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.Email.trim())) errors.Email = 'Invalid email address.';
  return errors;
}

export default function Register() {
  const navigate = useNavigate();
  const register = useAuthStore(s => s.register);
  const [form, setForm] = useState<{ Username: string; Password: string; Nickname: string; Email: string }>({
    Username: '',
    Password: '',
    Nickname: '',
    Email: ''
  });
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'Username' || name === 'Password' || name === 'Email') {
      const next = { ...form, [name]: value };
      const errs = validate(next);
      setFieldErrors(prev => ({ ...prev, [name]: errs[name as keyof FormErrors] || undefined }));
      if (errorMsg) setErrorMsg('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const errs = validate(form);
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;
    try {
      await register(form);
      navigate('/login');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setErrorMsg(message || 'Registration failed. Please check your information.');
    }
  };

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
              <span className="text-3xl">🚀</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create Account</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Start your learning journey today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Username
              </label>
              <input
                name="Username"
                value={form.Username}
                onChange={handleChange}
                className={`input-field ${fieldErrors.Username ? 'input-error' : ''}`}
                placeholder="Choose a username (min 3 chars)"
              />
              {fieldErrors.Username && (
                <p className="mt-1 text-xs text-red-500 dark:text-red-400">{fieldErrors.Username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Password
              </label>
              <input
                type="password"
                name="Password"
                value={form.Password}
                onChange={handleChange}
                className={`input-field ${fieldErrors.Password ? 'input-error' : ''}`}
                placeholder="Create a password (min 6 chars)"
              />
              {fieldErrors.Password && (
                <p className="mt-1 text-xs text-red-500 dark:text-red-400">{fieldErrors.Password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Nickname
              </label>
              <input
                name="Nickname"
                value={form.Nickname}
                onChange={handleChange}
                className="input-field"
                placeholder="Your display name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Email
              </label>
              <input
                type="email"
                name="Email"
                value={form.Email}
                onChange={handleChange}
                className={`input-field ${fieldErrors.Email ? 'input-error' : ''}`}
                placeholder="your@email.com"
              />
              {fieldErrors.Email && (
                <p className="mt-1 text-xs text-red-500 dark:text-red-400">{fieldErrors.Email}</p>
              )}
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 text-red-500 dark:text-red-400 text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full btn-primary text-base py-3 mt-2"
            >
              Create Account
            </button>

            <div className="flex items-center gap-2 pt-2">
              <div className="flex-1 h-px bg-gray-200 dark:bg-dark-600"></div>
              <span className="text-sm text-gray-500 dark:text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-dark-600"></div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full btn-outline text-base py-3"
            >
              Already have an account?
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          © 2024 StudyTracker. All rights reserved.
        </p>
      </div>
    </div>
  );
}