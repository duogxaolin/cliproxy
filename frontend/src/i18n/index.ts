import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations, Language, TranslationKeys } from './translations';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',
      setLanguage: (lang: Language) => set({ language: lang, t: translations[lang] }),
      t: translations.en,
    }),
    {
      name: 'language-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.t = translations[state.language];
        }
      },
    }
  )
);

// Hook to get translations
export const useTranslation = () => {
  const { language, t, setLanguage } = useLanguageStore();
  return { language, t, setLanguage };
};

