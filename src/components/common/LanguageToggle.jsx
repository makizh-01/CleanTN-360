import React from 'react';
import { Languages, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageToggle({ compact = false, style = {} }) {
  const { language, setLanguage, toggleLanguage } = useLanguage();

  return (
    <div
      className="language-toggle-pill"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1.5px solid #a3d4b2',
        borderRadius: '24px',
        padding: '2px',
        boxShadow: '0 2px 6px rgba(10, 80, 40, 0.08)',
        userSelect: 'none',
        flexShrink: 0,
        whiteSpace: 'nowrap',
        ...style
      }}
      title="Switch Language / மொழியை மாற்றுக (English ⟷ தமிழ்)"
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        aria-label="Switch to English"
        style={{
          border: 'none',
          borderRadius: '20px',
          padding: compact ? '4px 8px' : '4px 10px',
          fontSize: compact ? '9.5px' : '10.5px',
          fontWeight: 800,
          background: language === 'en' ? 'linear-gradient(135deg, #16a34a, #087a3c)' : 'transparent',
          color: language === 'en' ? '#ffffff' : '#4b5563',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          transition: 'all 0.18s ease',
          boxShadow: language === 'en' ? '0 1px 4px rgba(8, 122, 60, 0.25)' : 'none'
        }}
      >
        <Globe size={11} style={{ opacity: language === 'en' ? 1 : 0.6 }} />
        <span>English</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('ta')}
        aria-label="தமிழுக்கு மாறுக"
        style={{
          border: 'none',
          borderRadius: '20px',
          padding: compact ? '4px 8px' : '4px 10px',
          fontSize: compact ? '9.5px' : '10.5px',
          fontWeight: 800,
          background: language === 'ta' ? 'linear-gradient(135deg, #16a34a, #087a3c)' : 'transparent',
          color: language === 'ta' ? '#ffffff' : '#4b5563',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          transition: 'all 0.18s ease',
          boxShadow: language === 'ta' ? '0 1px 4px rgba(8, 122, 60, 0.25)' : 'none'
        }}
      >
        <span>தமிழ்</span>
      </button>
    </div>
  );
}
