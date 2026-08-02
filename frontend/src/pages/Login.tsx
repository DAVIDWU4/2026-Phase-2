import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import ThemeToggle from '../components/ThemeToggle';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTranslation } from '../i18n/useTranslation';

export default function Login() {
  const navigate = useNavigate();
  const authenticate = useAuthStore(s => s.authenticate);
  const { t } = useTranslation();

  const [form, setForm] = useState<{ Username: string; Password: string }>({
    Username: '',
    Password: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [hasFieldError, setHasFieldError] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setHasFieldError(false);
    try {
      await authenticate(form);
      navigate('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setErrorMsg(message || t('login.errorDefault'));
      setHasFieldError(true);
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
              <span className="text-3xl">📖</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('login.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">{t('login.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {t('login.username')}
              </label>
              <input
                name="Username"
                value={form.Username}
                onChange={handleChange}
                className={`input-field ${hasFieldError ? 'input-error' : ''}`}
                placeholder={t('login.usernamePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {t('login.password')}
              </label>
              <input
                type="password"
                name="Password"
                value={form.Password}
                onChange={handleChange}
                className={`input-field ${hasFieldError ? 'input-error' : ''}`}
                placeholder={t('login.passwordPlaceholder')}
              />
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 text-red-500 dark:text-red-400 text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errorMsg}
              </div>
            )}

            <button type="submit" className="w-full btn-primary text-base py-3">
              {t('login.submit')}
            </button>

            <div className="flex items-center gap-2 pt-2">
              <div className="flex-1 h-px bg-gray-200 dark:bg-dark-600"></div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{t('common.or')}</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-dark-600"></div>
            </div>

            <button type="button" onClick={() => navigate('/register')} className="w-full btn-outline text-base py-3">
              {t('login.createAccount')}
            </button>

            <button type="button" onClick={() => navigate('/forgot-password')} className="w-full btn-secondary text-base py-3">
              {t('login.forgotPassword')}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          {t('common.copyright')}
        </p>
        <LanguageSwitcher />
      </div>
    </div>
  );
}
