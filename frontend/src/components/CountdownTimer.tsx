import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const CountdownTimer = () => {
    const { t } = useTranslation();
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        // Set the date we're counting down to (e.g., New Year 2026)
        const countDownDate = new Date().getTime() + (18 * 24 * 60 * 60 * 1000) + (20 * 60 * 60 * 1000) + (12 * 60 * 1000);

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = countDownDate - now;

            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            } else {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                setTimeLeft({ days, hours, minutes, seconds });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center text-yildiz-gold w-full" style={{ contain: 'layout style' }}>
            <div className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 tracking-wider whitespace-nowrap text-bilkent-gold" style={{ 
              textShadow: '0 0 5px rgba(255, 215, 0, 0.4)'
            }}>
                {t('countdown.title')}
            </div>
            <div className="flex items-center justify-center space-x-1 sm:space-x-2 md:space-x-3 lg:space-x-4 xl:space-x-6 text-center w-full" style={{ contain: 'layout' }}>
                <div className="flex flex-col items-center" style={{ minWidth: '45px', width: 'auto', flexShrink: 0 }}>
                    <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-none text-bilkent-gold" style={{ 
                      fontVariantNumeric: 'tabular-nums', 
                      display: 'inline-block', 
                      minWidth: '1.2em',
                      textShadow: '0 0 8px rgba(255, 215, 0, 0.5)'
                    }}>{String(timeLeft.days).padStart(2, '0')}</span>
                    <span className="text-[10px] sm:text-xs md:text-sm lg:text-base mt-1 sm:mt-2 whitespace-nowrap">{t('countdown.days')}</span>
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-none text-bilkent-gold" style={{ 
                  textShadow: '0 0 5px rgba(255, 215, 0, 0.4)'
                }}>:</div>
                <div className="flex flex-col items-center" style={{ minWidth: '45px', width: 'auto', flexShrink: 0 }}>
                    <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-none text-bilkent-gold" style={{ 
                      fontVariantNumeric: 'tabular-nums', 
                      display: 'inline-block', 
                      minWidth: '1.2em',
                      textShadow: '0 0 8px rgba(255, 215, 0, 0.5)'
                    }}>{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="text-[10px] sm:text-xs md:text-sm lg:text-base mt-1 sm:mt-2 whitespace-nowrap">{t('countdown.hours')}</span>
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-none text-bilkent-gold" style={{ 
                  textShadow: '0 0 5px rgba(255, 215, 0, 0.4)'
                }}>:</div>
                <div className="flex flex-col items-center" style={{ minWidth: '45px', width: 'auto', flexShrink: 0 }}>
                    <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-none text-bilkent-gold" style={{ 
                      fontVariantNumeric: 'tabular-nums', 
                      display: 'inline-block', 
                      minWidth: '1.2em',
                      textShadow: '0 0 8px rgba(255, 215, 0, 0.5)'
                    }}>{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="text-[10px] sm:text-xs md:text-sm lg:text-base mt-1 sm:mt-2 whitespace-nowrap">{t('countdown.minutes')}</span>
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-none text-bilkent-gold" style={{ 
                  textShadow: '0 0 5px rgba(255, 215, 0, 0.4)'
                }}>:</div>
                <div className="flex flex-col items-center" style={{ minWidth: '45px', width: 'auto', flexShrink: 0 }}>
                    <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-none text-bilkent-gold" style={{ 
                      fontVariantNumeric: 'tabular-nums', 
                      display: 'inline-block', 
                      minWidth: '1.2em',
                      textShadow: '0 0 8px rgba(255, 215, 0, 0.5)'
                    }}>{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="text-[10px] sm:text-xs md:text-sm lg:text-base mt-1 sm:mt-2 whitespace-nowrap">{t('countdown.seconds')}</span>
                </div>
            </div>
        </div>
    );
};

export default CountdownTimer;
