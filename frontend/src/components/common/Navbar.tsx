import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../utils/constants';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const isHome = location.pathname === ROUTES.HOME;
  const isAdmin = location.pathname === ROUTES.ADMIN;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className={`w-full z-50 ${isHome ? 'absolute top-0 left-0 bg-transparent' : 'bg-yildiz-dark border-b border-white/10 sticky top-0'}`}>
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to={ROUTES.HOME} className="text-xl sm:text-2xl font-bold text-bilkent-gold tracking-wider hover:text-bilkent-blue transition-colors" style={{ 
            textShadow: isHome ? '0 0 5px rgba(255, 215, 0, 0.4)' : 'none'
          }}>
            {t('common.appName')}
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <>
                <Link to={ROUTES.DASHBOARD} className="text-gray-300 hover:text-bilkent-gold transition-colors font-medium text-sm lg:text-base">
                  {t('common.dashboard')}
                </Link>
                <Link to={ROUTES.PROFILE} className="text-gray-300 hover:text-bilkent-blue transition-colors font-medium text-sm lg:text-base">
                  {t('common.profile')}
                </Link>
                {user?.is_staff && (
                  <Link to={ROUTES.ADMIN} className="text-gray-300 hover:text-bilkent-gold transition-colors font-medium text-sm lg:text-base">
                    {t('common.admin')}
                  </Link>
                )}
                <span className="text-xs lg:text-sm text-gray-400 border-l border-gray-600 pl-4 hidden lg:inline">{user?.email}</span>
                <button
                  onClick={logout}
                  className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-3 lg:px-4 py-2 rounded-lg transition-all duration-300 border border-red-500/20 text-sm"
                >
                  {t('common.logout')}
                </button>
              </>
            ) : (
              <>
                {!isHome && (
                  <>
                    <Link to={ROUTES.LOGIN} className="text-gray-300 hover:text-yildiz-gold transition-colors font-medium text-sm lg:text-base">
                      {t('common.login')}
                    </Link>
                    <Link
                      to={ROUTES.REGISTER}
                      className="bg-yildiz-gold text-yildiz-dark px-4 lg:px-5 py-2 rounded-full font-bold hover:bg-white transition-all duration-300 shadow-lg shadow-yildiz-gold/20 text-sm"
                    >
                      {t('common.register')}
                    </Link>
                  </>
                )}
                {isHome && (
                  <div className="flex gap-3 lg:gap-4">
                    <Link
                      to={ROUTES.LOGIN}
                      className="px-6 lg:px-8 py-2 lg:py-2.5 border border-yildiz-gold text-yildiz-gold hover:bg-yildiz-gold hover:text-yildiz-dark transition-all duration-300 rounded-full font-semibold tracking-wide shadow-[0_0_15px_rgba(255,215,0,0.2)] hover:shadow-[0_0_25px_rgba(255,215,0,0.4)] text-sm lg:text-base"
                    >
                      {t('common.login')}
                    </Link>
                    <Link
                      to={ROUTES.REGISTER}
                      className="px-6 lg:px-8 py-2 lg:py-2.5 bg-yildiz-gold text-yildiz-dark hover:bg-white transition-all duration-300 rounded-full font-semibold tracking-wide shadow-[0_0_15px_rgba(255,215,0,0.2)] hover:shadow-[0_0_25px_rgba(255,215,0,0.4)] text-sm lg:text-base"
                    >
                      {t('common.register')}
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-yildiz-gold hover:text-white transition-colors p-2"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/10 pt-4">
            {isAuthenticated ? (
              <div className="flex flex-col gap-3">
                <Link
                  to={ROUTES.DASHBOARD}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-300 hover:text-yildiz-gold transition-colors font-medium py-2"
                >
                  {t('common.dashboard')}
                </Link>
                <Link
                  to={ROUTES.PROFILE}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-300 hover:text-yildiz-gold transition-colors font-medium py-2"
                >
                  {t('common.profile')}
                </Link>
                {user?.is_staff && (
                  <Link
                    to={ROUTES.ADMIN}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-300 hover:text-yildiz-gold transition-colors font-medium py-2"
                  >
                    {t('common.admin')}
                  </Link>
                )}
                <div className="text-xs text-gray-400 py-2 border-t border-gray-600 mt-2 pt-2">{user?.email}</div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg transition-all duration-300 border border-red-500/20 text-left"
                >
                  {t('common.logout')}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  to={ROUTES.LOGIN}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-300 hover:text-yildiz-gold transition-colors font-medium py-2"
                >
                  {t('common.login')}
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-yildiz-gold text-yildiz-dark px-4 py-2 rounded-full font-bold hover:bg-white transition-all duration-300 text-center"
                >
                  {t('common.register')}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
