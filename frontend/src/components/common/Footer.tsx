import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full py-6 sm:py-8 mt-auto border-t border-white/10 bg-yildiz-dark text-center">
      <div className="container mx-auto px-4">
        <p className="text-gray-400 text-xs sm:text-sm">
          &copy; 2025 {t('common.appName')}. Tüm hakları saklıdır.
        </p>
        <p className="mt-2 text-xs text-gray-500">
          Bilkent Üniversitesi öğrencileri için ❤️ ile yapıldı
        </p>
      </div>
    </footer>
  );
};

export default Footer;
