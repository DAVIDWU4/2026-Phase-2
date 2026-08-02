import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { confirmPasswordReset, requestPasswordReset } from '../api';
import ThemeToggle from '../components/ThemeToggle';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTranslation } from '../i18n/useTranslation';

const RESEND_COOLDOWN_SEC = 60;

export default function ResetPassword() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') ?? '';
  const [email] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email || resending || cooldown > 0) return;
    setResending(true);
    setErrorMsg('');
    setStatus('');
    try {
      await requestPasswordReset({ Email: email });
      setStatus(t('reset.resendSuccess'));
      setCooldown(RESEND_COOLDOWN_SEC);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setErrorMsg(message || t('reset.sendFailed'));
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setStatus('');

    if (newPassword !== confirmPassword) {
      setErrorMsg(t('reset.errorMismatch'));
      return;
    }

    setSubmitting(true);
    try {
      await confirmPasswordReset({ Email: email, Code: code, NewPassword: newPassword });
      setStatus(t('reset.success'));
      navigate('/login');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setErrorMsg(message || t('reset.errorDefault'));
    } finally {
      setSubmitting(false);
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
              <span className="text-3xl">🔐</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('reset.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">{t('reset.subtitle')}</p>
            {email && (
              <p className="text-sm text-primary-600 dark:text-primary-400 mt-3">
                {t('reset.sentTo', { email })}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t('reset.email')}</label>
              <input
                type="email"
                value={email}
                readOnly
                className="input-field bg-gray-50 dark:bg-dark-700 cursor-not-allowed"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{t('reset.code')}</label>
                <button
                  type="button"
                  onClick={() => void handleResend()}
                  disabled={!email || resending || cooldown > 0}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                >
                  {resending
                    ? t('reset.resending')
                    : cooldown > 0
                      ? t('reset.resendCooldown', { seconds: cooldown })
                      : t('reset.resend')}
                </button>
              </div>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="input-field"
                placeholder={t('reset.codePlaceholder')}
                inputMode="numeric"
                autoComplete="one-time-code"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t('reset.newPassword')}</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
                placeholder={t('reset.newPasswordPlaceholder')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t('reset.confirmPassword')}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder={t('reset.confirmPasswordPlaceholder')}
                required
              />
            </div>

            {errorMsg && <div className="text-sm text-red-500 dark:text-red-400">{errorMsg}</div>}
            {status && <div className="text-sm text-green-600 dark:text-green-400">{status}</div>}

            <button type="submit" disabled={submitting || !email} className="w-full btn-primary text-base py-3 disabled:opacity-60">
              {submitting ? t('reset.resending') : t('reset.submit')}
            </button>
            <button type="button" onClick={() => navigate('/forgot-password')} className="w-full btn-outline text-base py-3">
              {t('reset.backForgot')}
            </button>
            <button type="button" onClick={() => navigate('/login')} className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
              {t('reset.backLogin')}
            </button>
          </form>
        </div>

        <LanguageSwitcher />
      </div>
    </div>
  );
}
