import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { matchingService, Match } from '../services/matching';
import { ROUTES } from '../utils/constants';

const DashboardPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadMatch();
    }
  }, [isAuthenticated]);

  const loadMatch = async () => {
    try {
      const data = await matchingService.getMyMatch();
      setMatch(data);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        console.error('Error loading match:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yildiz-dark text-white px-4">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-yildiz-dark text-white flex items-center justify-center px-4">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yildiz-dark text-white">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">{t('dashboard.title')}</h1>

        {match ? (
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl p-4 sm:p-6 mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-yildiz-gold">{t('dashboard.yourMatch')}</h2>
            {match.partner_profile ? (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <p className="text-sm sm:text-base text-gray-300 mb-1">
                    <strong className="text-yildiz-gold">{t('dashboard.partnerInitials')}:</strong>{' '}
                    <span className="text-white">{match.partner_profile.initials}</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm sm:text-base text-gray-300 mb-1">
                    <strong className="text-yildiz-gold">{t('dashboard.partnerDepartment')}:</strong>{' '}
                    <span className="text-white">{match.partner_profile.department}</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm sm:text-base text-gray-300 mb-1">
                    <strong className="text-yildiz-gold">{t('dashboard.partnerStudyLevel')}:</strong>{' '}
                    <span className="text-white">{match.partner_profile.study_level}</span>
                  </p>
                </div>
                {match.partner_profile.about_text && (
                  <div>
                    <p className="text-sm sm:text-base text-gray-300 mb-1">
                      <strong className="text-yildiz-gold">{t('dashboard.partnerAbout')}:</strong>
                    </p>
                    <p className="text-white text-sm sm:text-base">{match.partner_profile.about_text}</p>
                  </div>
                )}
                {match.partner_profile.interests.length > 0 && (
                  <div>
                    <p className="text-sm sm:text-base text-gray-300 mb-2">
                      <strong className="text-yildiz-gold">{t('dashboard.partnerInterests')}:</strong>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {match.partner_profile.interests.map((interest) => (
                        <span
                          key={interest.id}
                          className="bg-yildiz-gold/20 text-yildiz-gold border border-yildiz-gold/30 px-3 py-1 rounded-full text-xs sm:text-sm"
                        >
                          {interest.display_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="pt-4">
                  <Link
                    to={ROUTES.MEETING}
                    className="inline-block bg-yildiz-gold text-yildiz-dark px-6 py-2.5 rounded-xl hover:bg-yellow-400 transition-colors font-semibold text-sm sm:text-base"
                  >
                    {t('dashboard.scheduleMeeting')}
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-gray-300">{t('common.loading')}</p>
            )}
          </div>
        ) : (
          <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-400 px-4 py-3 rounded-lg mb-6 text-sm sm:text-base">
            <p>{t('dashboard.noMatch')}</p>
          </div>
        )}

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-yildiz-gold">{t('dashboard.quickLinks')}</h2>
          <div className="flex flex-col gap-3">
            <Link
              to={ROUTES.PROFILE}
              className="text-gray-300 hover:text-yildiz-gold transition-colors text-sm sm:text-base"
            >
              {t('dashboard.updateProfile')}
            </Link>
            <Link
              to={ROUTES.MEETING}
              className="text-gray-300 hover:text-yildiz-gold transition-colors text-sm sm:text-base"
            >
              {t('dashboard.meetingSchedule')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
