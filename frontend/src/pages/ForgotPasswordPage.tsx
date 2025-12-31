import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/auth';
import { ROUTES } from '../utils/constants';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-yildiz-dark py-8 sm:py-12 px-4 font-sans">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-yildiz-gold tracking-wide">
          {t('auth.forgotPasswordTitle')}
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded mb-4 sm:mb-6 text-sm">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center">
            <div className="bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-3 rounded mb-6 text-sm">
              If the email exists, a password reset link has been sent.
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Check your email inbox and follow the instructions to reset your password.
            </p>
            <Link
              to={ROUTES.LOGIN}
              className="inline-block bg-christmas-green text-white font-bold py-3 px-6 rounded-xl hover:bg-green-600 transition-colors duration-300 text-sm"
            >
              {t('common.backToLogin')}
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-400 text-center mb-6 text-sm">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-6 sm:mb-8">
                <label className="block text-gray-300 text-sm font-medium mb-2 ml-1">
                  {t('auth.email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yildiz-gold/50 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                  placeholder="ornek@bilkent.edu.tr"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-christmas-green text-white font-bold py-3 sm:py-3.5 rounded-xl hover:bg-green-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-christmas-green/30 text-sm sm:text-base"
              >
                {loading ? t('common.loading') : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-4 sm:mt-6 text-center">
              <Link to={ROUTES.LOGIN} className="text-gray-400 hover:text-christmas-red transition-colors duration-300 text-xs sm:text-sm">
                {t('common.backToLogin')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
