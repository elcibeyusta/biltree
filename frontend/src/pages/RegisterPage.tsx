import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/auth';
import { ROUTES, DEPARTMENTS, STUDY_LEVELS } from '../utils/constants';
import { validateBilkentEmail, validatePassword } from '../utils/validation';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
    department: '',
    study_level: '',
    about_text: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateBilkentEmail(formData.email)) {
      setError('Please use a valid Bilkent email address.');
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.error || 'Invalid password');
      return;
    }

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match.');
      return;
    }

    if (!formData.department || !formData.study_level) {
      setError('Please fill out all required profile fields.');
      return;
    }

    setLoading(true);

    try {
      await authService.register(formData);
      navigate(ROUTES.VERIFY_EMAIL, { state: { email: formData.email } });
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-yildiz-dark py-8 sm:py-12 px-4 font-sans">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-yildiz-gold tracking-wide">
          {t('auth.registerTitle')}
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded mb-4 sm:mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-2 ml-1">
              Bilkent {t('auth.email')}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-christmas-green/50 focus:border-transparent transition-all duration-300 text-base sm:text-base"
              placeholder="ornek@bilkent.edu.tr"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2 ml-1">
                {t('auth.firstName')}
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-christmas-green/50 focus:border-transparent transition-all duration-300 text-base sm:text-base"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2 ml-1">
                {t('auth.lastName')}
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-christmas-green/50 focus:border-transparent transition-all duration-300 text-base sm:text-base"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-2 ml-1">
              {t('auth.password')}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-christmas-green/50 focus:border-transparent transition-all duration-300 text-base sm:text-base"
              placeholder="••••••••"
            />
          </div>

          <div className="mb-6 sm:mb-8">
            <label className="block text-gray-300 text-sm font-medium mb-2 ml-1">
              {t('auth.passwordConfirm')}
            </label>
            <input
              type="password"
              name="password_confirm"
              value={formData.password_confirm}
              onChange={handleChange}
              required
              className="w-full px-4 py-3.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-christmas-green/50 focus:border-transparent transition-all duration-300 text-base sm:text-base"
              placeholder="••••••••"
            />
          </div>

          {/* Profile Section */}
          <div className="border-t border-white/10 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-christmas-green mb-4">{t('profile.title')}</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2 ml-1">
                  {t('profile.department')} <span className="text-red-400">*</span>
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-christmas-green/50 focus:border-transparent transition-all duration-300 text-base sm:text-base"
                >
                  <option value="" className="bg-yildiz-dark">{t('profile.department')}</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept.value} value={dept.value} className="bg-yildiz-dark">
                      {t(dept.labelKey)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2 ml-1">
                  {t('profile.studyLevel')} <span className="text-red-400">*</span>
                </label>
                <select
                  name="study_level"
                  value={formData.study_level}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-christmas-green/50 focus:border-transparent transition-all duration-300 text-base sm:text-base"
                >
                  <option value="" className="bg-yildiz-dark">{t('profile.studyLevel')}</option>
                  {STUDY_LEVELS.map((level) => (
                    <option key={level.value} value={level.value} className="bg-yildiz-dark">
                      {t(level.labelKey)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-2 ml-1">
                {t('profile.aboutMe')}
              </label>
              <textarea
                name="about_text"
                value={formData.about_text}
                onChange={handleChange}
                maxLength={500}
                rows={4}
                className="w-full px-4 py-3.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-christmas-green/50 focus:border-transparent transition-all duration-300 text-base sm:text-base resize-none"
                placeholder={t('profile.aboutMePlaceholder')}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-christmas-red text-white font-bold py-3.5 sm:py-3 rounded-xl hover:bg-red-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-christmas-red/40 text-base sm:text-base"
          >
            {loading ? t('common.loading') : t('common.register')}
          </button>
        </form>

        <div className="mt-4 sm:mt-6 text-center">
          <Link to={ROUTES.LOGIN} className="text-gray-400 hover:text-yildiz-gold transition-colors duration-300 text-xs sm:text-sm">
            {t('auth.hasAccount')} <span className="font-semibold underline decoration-yildiz-gold/50 hover:decoration-yildiz-gold">{t('common.login')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
