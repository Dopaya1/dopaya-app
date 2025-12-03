/**
 * i18n Context Provider
 * Manages language state and provides translation context to the app
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Language } from './types';
import { detectLanguage, saveLanguageToStorage, removeLanguagePrefix } from './utils';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  pathname: string;
  setPathname: (path: string) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  initialLanguage?: Language;
  initialPathname?: string;
}

export function I18nProvider({ 
  children, 
  initialLanguage,
  initialPathname 
}: I18nProviderProps) {
  // Detect initial language from URL or other sources
  const getInitialLanguage = (): Language => {
    if (initialLanguage) return initialLanguage;
    
    if (typeof window !== 'undefined') {
      return detectLanguage(window.location.pathname);
    }
    
    return 'en';
  };

  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const [pathname, setPathnameState] = useState<string>(
    initialPathname || (typeof window !== 'undefined' ? window.location.pathname : '/')
  );

  // Update pathname when window location changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updatePathname = () => {
      setPathnameState(window.location.pathname);
    };

    // Listen to popstate for browser back/forward
    window.addEventListener('popstate', updatePathname);
    
    // Initial pathname
    updatePathname();

    return () => {
      window.removeEventListener('popstate', updatePathname);
    };
  }, []);

  // Detect language from URL when pathname changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const detectedLang = detectLanguage(pathname);
    if (detectedLang !== language) {
      setLanguageState(detectedLang);
    }
  }, [pathname]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    saveLanguageToStorage(lang);
    
    // Update URL if we're in the browser
    if (typeof window !== 'undefined') {
      const currentPath = removeLanguagePrefix(window.location.pathname);
      const newPath = lang === 'en' ? currentPath : `/${lang}${currentPath}`;
      
      // Only update URL if it's different
      if (newPath !== window.location.pathname) {
        window.history.pushState({}, '', newPath);
        setPathnameState(newPath);
      }
    }
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, pathname, setPathname: setPathnameState }}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Hook to access i18n context
 * Must be used within I18nProvider
 */
export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

