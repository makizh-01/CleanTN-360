import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS, translate } from '../lib/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem('cleantn_language') || 'en';
    } catch (e) {
      return 'en';
    }
  });

  const setLanguage = (lang) => {
    const validLang = lang === 'ta' ? 'ta' : 'en';
    setLanguageState(validLang);
    try {
      localStorage.setItem('cleantn_language', validLang);
    } catch (e) {
      console.warn('Unable to persist language choice to localStorage:', e);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ta' : 'en');
  };

  const t = (key, fallback = '') => {
    return translate(language, key, fallback);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        isTamil: language === 'ta',
        isEnglish: language === 'en',
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
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
