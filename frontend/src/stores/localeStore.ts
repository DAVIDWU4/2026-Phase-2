import { create } from 'zustand';
import type { Locale } from '../i18n/translations';

const STORAGE_KEY = 'studytracker-locale';

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  hydrate: () => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: 'zh',

  setLocale: (locale) => {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
    set({ locale });
  },

  hydrate: () => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    const locale = saved === 'en' || saved === 'zh' ? saved : 'zh';
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
    set({ locale });
  },
}));
