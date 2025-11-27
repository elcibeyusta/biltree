import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLang = i18n.language || 'tr';

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <button
        onClick={() => changeLanguage('tr')}
        className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors ${
          currentLang === 'tr' || currentLang.startsWith('tr')
            ? 'bg-yildiz-gold text-yildiz-dark'
            : 'text-gray-300 hover:text-yildiz-gold'
        }`}
      >
        TR
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors ${
          currentLang === 'en' || currentLang.startsWith('en')
            ? 'bg-yildiz-gold text-yildiz-dark'
            : 'text-gray-300 hover:text-yildiz-gold'
        }`}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;

