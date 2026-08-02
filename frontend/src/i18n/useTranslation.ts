import { useCallback } from 'react';
import { translations, type Locale, type TranslationKey } from './translations';
import { useLocaleStore } from '../stores/localeStore';

type Interpolation = Record<string, string | number>;

export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  const t = useCallback(
    (key: TranslationKey, params?: Interpolation): string => {
      let text: string = translations[locale][key] ?? translations.en[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          text = text.replaceAll(`{{${k}}}`, String(v));
        }
      }
      return text;
    },
    [locale]
  );

  return { t, locale, setLocale };
}

export function getSubjectLabel(locale: Locale, subjectId: string): string {
  const key = `subject.${subjectId}` as TranslationKey;
  return translations[locale][key] ?? translations.en[key] ?? subjectId;
}

export function getBadgeLabel(
  locale: Locale,
  badgeId: number,
  field: 'name' | 'desc',
  fallback: string
): string {
  const key = `badge.${badgeId}.${field}` as TranslationKey;
  return translations[locale][key] ?? fallback;
}
