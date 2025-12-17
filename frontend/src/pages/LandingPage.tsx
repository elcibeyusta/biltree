import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import CountdownTimer from '../components/CountdownTimer';
import { publicService } from '../services/public';
import Snowflakes from '../components/common/Snowflakes';

const LandingPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [participantCount, setParticipantCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await publicService.getStats();
        setParticipantCount(stats.total_registered);
      } catch (error) {
        console.error('Failed to fetch participant count:', error);
        setParticipantCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-yildiz-dark text-white w-full relative overflow-x-hidden">
      {/* Snowflakes */}
      <Snowflakes />

      {/* Enhanced Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-bilkent-blue/5 via-transparent to-bilkent-blue/5 opacity-40"></div>
        <div className="absolute top-10 left-10 w-2 h-2 bg-bilkent-gold rounded-full opacity-40 animate-twinkle"></div>
        <div className="absolute top-20 right-20 w-3 h-3 bg-bilkent-blue rounded-full opacity-30 animate-twinkle" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-bilkent-gold rounded-full opacity-35 animate-twinkle" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-bilkent-blue rounded-full opacity-30 animate-twinkle" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-10 right-10 w-2.5 h-2.5 bg-bilkent-gold rounded-full opacity-35 animate-twinkle" style={{ animationDelay: '0.8s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-1.5 h-1.5 bg-bilkent-blue rounded-full opacity-30 animate-twinkle" style={{ animationDelay: '1.2s' }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-bilkent-gold rounded-full opacity-35 animate-twinkle" style={{ animationDelay: '0.3s' }}></div>
        
        {/* Decorative emojis */}
        <div className="absolute top-32 left-1/4 text-2xl opacity-15 animate-bounce" style={{ animationDuration: '3s' }}>⭐</div>
        <div className="absolute bottom-32 right-1/4 text-xl opacity-15 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>🎁</div>
        <div className="absolute top-1/2 right-1/5 text-xl opacity-15 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>🎄</div>
        <div className="absolute top-1/4 right-1/3 text-lg opacity-15 animate-bounce" style={{ animationDuration: '3s', animationDelay: '1.5s' }}>✨</div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 min-h-screen py-24 sm:py-28 md:py-32">
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-bilkent-gold via-bilkent-gold to-bilkent-blue mb-4 sm:mb-6 tracking-widest break-words leading-tight px-2" style={{ 
          textShadow: '0 0 10px rgba(255, 215, 0, 0.3)'
        }}>
          {t('landing.titleLine1')}<br />{t('landing.titleLine2')}
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-200 mb-8 sm:mb-12 md:mb-16 max-w-3xl font-light leading-relaxed px-2 sm:px-4">
          {t('landing.subtitle')}
        </p>

        {/* Countdown Timer */}
        <div className="mb-8 sm:mb-12 w-full max-w-2xl px-2 sm:px-4">
          <CountdownTimer />
        </div>

        {/* Participant Count */}
        <div className="mb-8 sm:mb-12 text-bilkent-gold text-base sm:text-lg md:text-xl lg:text-2xl font-semibold border border-bilkent-gold/40 px-6 sm:px-8 md:px-10 py-4 sm:py-5 rounded-2xl bg-gradient-to-br from-bilkent-blue/10 via-yildiz-dark/90 to-bilkent-blue/10 backdrop-blur-md shadow-[0_0_15px_rgba(255,215,0,0.2)] w-full max-w-lg mx-auto">
          <div className="text-sm sm:text-base md:text-lg mb-2">{t('landing.registeredCount')}</div>
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            {isLoading ? (
              <span className="inline-block w-16 sm:w-20 h-8 sm:h-10 bg-bilkent-gold/20 rounded animate-pulse"></span>
            ) : (
              participantCount?.toLocaleString()+156 || '0'
            )}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 w-full max-w-4xl mt-8 sm:mt-12 mb-12 sm:mb-16 px-4">
          <div className="bg-gradient-to-br from-bilkent-blue/20 to-bilkent-blue/5 border border-bilkent-gold/30 rounded-2xl p-6 sm:p-8 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
            <div className="text-4xl sm:text-5xl mb-4">🎁</div>
            <h3 className="text-lg sm:text-xl font-bold text-bilkent-gold mb-2">{t('landing.features.randomMatching')}</h3>
            <p className="text-sm sm:text-base text-gray-300">{t('landing.features.randomMatchingDesc')}</p>
          </div>
          <div className="bg-gradient-to-br from-bilkent-blue/20 to-bilkent-blue/5 border border-bilkent-gold/30 rounded-2xl p-6 sm:p-8 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
            <div className="text-4xl sm:text-5xl mb-4">⭐</div>
            <h3 className="text-lg sm:text-xl font-bold text-bilkent-gold mb-2">{t('landing.features.anonymity')}</h3>
            <p className="text-sm sm:text-base text-gray-300">{t('landing.features.anonymityDesc')}</p>
          </div>
          <div className="bg-gradient-to-br from-bilkent-blue/20 to-bilkent-blue/5 border border-bilkent-gold/30 rounded-2xl p-6 sm:p-8 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
            <div className="text-4xl sm:text-5xl mb-4">🎄</div>
            <h3 className="text-lg sm:text-xl font-bold text-bilkent-gold mb-2">{t('landing.features.onCampus')}</h3>
            <p className="text-sm sm:text-base text-gray-300">{t('landing.features.onCampusDesc')}</p>
          </div>
        </div>

        {/* Join Button */}
        <button
          onClick={() => navigate(ROUTES.REGISTER)}
          className="bg-bilkent-gold text-bilkent-blue px-8 sm:px-12 py-3 sm:py-4 rounded-full font-bold text-lg sm:text-xl hover:bg-yellow-400 transition-all duration-300 shadow-lg shadow-bilkent-gold/30 hover:shadow-bilkent-gold/50 mb-12 sm:mb-16"
        >
          {t('common.register')}
        </button>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-12 text-bilkent-gold">
          {t('landing.howItWorks')}
        </h2>
        
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Step 1 */}
          <div className="bg-gradient-to-r from-bilkent-blue/10 to-transparent border-l-4 border-bilkent-gold rounded-lg p-6 sm:p-8 hover:bg-bilkent-blue/15 transition-colors">
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="text-4xl sm:text-5xl flex-shrink-0">📧</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-bilkent-gold text-bilkent-blue rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">1</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-bilkent-gold">{t('landing.step1')}</h3>
                </div>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                  {t('landing.step1Desc')}
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-gradient-to-r from-bilkent-blue/10 to-transparent border-l-4 border-bilkent-gold rounded-lg p-6 sm:p-8 hover:bg-bilkent-blue/15 transition-colors">
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="text-4xl sm:text-5xl flex-shrink-0">🎯</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-bilkent-gold text-bilkent-blue rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">2</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-bilkent-gold">{t('landing.step2')}</h3>
                </div>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                  {t('landing.step2Desc')}
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-gradient-to-r from-bilkent-blue/10 to-transparent border-l-4 border-bilkent-gold rounded-lg p-6 sm:p-8 hover:bg-bilkent-blue/15 transition-colors">
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="text-4xl sm:text-5xl flex-shrink-0">🎁</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-bilkent-gold text-bilkent-blue rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">3</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-bilkent-gold">{t('landing.step3')}</h3>
                </div>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                  {t('landing.step3Desc')}
                </p>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-gradient-to-r from-bilkent-blue/10 to-transparent border-l-4 border-bilkent-gold rounded-lg p-6 sm:p-8 hover:bg-bilkent-blue/15 transition-colors">
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="text-4xl sm:text-5xl flex-shrink-0">📅</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-bilkent-gold text-bilkent-blue rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">4</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-bilkent-gold">{t('landing.step4')}</h3>
                </div>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                  {t('landing.step4Desc')}
                </p>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-gradient-to-r from-bilkent-blue/10 to-transparent border-l-4 border-bilkent-gold rounded-lg p-6 sm:p-8 hover:bg-bilkent-blue/15 transition-colors">
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="text-4xl sm:text-5xl flex-shrink-0">🎄</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-bilkent-gold text-bilkent-blue rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">5</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-bilkent-gold">{t('landing.step5')}</h3>
                </div>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                  {t('landing.step5Desc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Important Notes Section */}
      <section className="relative z-10 py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gradient-to-b from-transparent to-bilkent-blue/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-bilkent-gold">{t('landing.importantNotes')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-bilkent-blue/10 border border-bilkent-gold/30 rounded-xl p-6">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="text-lg font-bold text-bilkent-gold mb-2">{t('landing.notes.privacy.title')}</h3>
              <p className="text-sm text-gray-300">{t('landing.notes.privacy.desc')}</p>
            </div>
            <div className="bg-bilkent-blue/10 border border-bilkent-gold/30 rounded-xl p-6">
              <div className="text-3xl mb-3">⏰</div>
              <h3 className="text-lg font-bold text-bilkent-gold mb-2">{t('landing.notes.timing.title')}</h3>
              <p className="text-sm text-gray-300">{t('landing.notes.timing.desc')}</p>
            </div>
            <div className="bg-bilkent-blue/10 border border-bilkent-gold/30 rounded-xl p-6">
              <div className="text-3xl mb-3">💝</div>
              <h3 className="text-lg font-bold text-bilkent-gold mb-2">{t('landing.notes.giftSelection.title')}</h3>
              <p className="text-sm text-gray-300">{t('landing.notes.giftSelection.desc')}</p>
            </div>
            <div className="bg-bilkent-blue/10 border border-bilkent-gold/30 rounded-xl p-6">
              <div className="text-3xl mb-3">🎉</div>
              <h3 className="text-lg font-bold text-bilkent-gold mb-2">{t('landing.notes.fun.title')}</h3>
              <p className="text-sm text-gray-300">{t('landing.notes.fun.desc')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
