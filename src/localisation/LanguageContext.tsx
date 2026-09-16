import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import i18n from './i18n';

const STORAGE_KEY = '@memora/language';

type LanguageContextValue = {
  language: string;
  setLanguage: (code: string) => void;
  isHydrated: boolean;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState(i18n.language);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(stored => {
        if (stored) {
          i18n.changeLanguage(stored);
          setLanguageState(stored);
        }
      })
      .finally(() => setIsHydrated(true));
  }, []);

  const setLanguage = useCallback((code: string) => {
    i18n.changeLanguage(code);
    setLanguageState(code);
    AsyncStorage.setItem(STORAGE_KEY, code).catch(() => {});
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isHydrated }}>
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
