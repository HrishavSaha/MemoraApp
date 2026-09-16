import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { storage } from '../storage/mmkv';
import i18n from './i18n';

const STORAGE_KEY = '@memora/language';

type LanguageContextValue = {
  language: string;
  setLanguage: (code: string) => void;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState(() => {
    const stored = storage.getString(STORAGE_KEY);
    if (stored) {
      i18n.changeLanguage(stored);
      return stored;
    }
    return i18n.language;
  });

  const setLanguage = useCallback((code: string) => {
    i18n.changeLanguage(code);
    setLanguageState(code);
    storage.set(STORAGE_KEY, code);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
