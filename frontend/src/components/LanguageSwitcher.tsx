import { useTranslation } from '../i18n/useTranslation';
import { useLocaleStore } from '../stores/localeStore';
import type { Locale } from '../i18n/translations';

export default function LanguageSwitcher() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  const options: { value: Locale; label: string }[] = [
    { value: 'zh', label: t('lang.zh') },
    { value: 'en', label: t('lang.en') },
  ];

  return (
    <div className="flex flex-col items-center gap-2 pt-6 mt-6 border-t border-gray-200 dark:border-dark-600">
      <span className="text-xs text-gray-400 dark:text-gray-500">{t('lang.label')}</span>
      <div className="inline-flex rounded-lg border border-gray-200 dark:border-dark-600 overflow-hidden">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setLocale(opt.value)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              locale === opt.value
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-dark-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
