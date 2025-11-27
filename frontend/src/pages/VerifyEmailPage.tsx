import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/auth';
import { ROUTES } from '../utils/constants';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      const decodedToken = decodeURIComponent(token);
      verifyEmail(decodedToken);
    } else {
      setMessage(t('auth.verifyEmailMessage'));
    }
  }, [searchParams, t]);

  const verifyEmail = async (token: string) => {
    try {
      await authService.verifyEmail(token);
      setMessage(t('auth.verifyEmailSuccess'));
      setTimeout(() => {
        navigate(ROUTES.PROFILE);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.verifyEmailError'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-yildiz-dark py-8 sm:py-12 px-4">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-yildiz-gold">{t('auth.verifyEmail')}</h2>
        {message && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg mb-4 text-sm sm:text-base">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm sm:text-base">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
