import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ROUTES } from '../utils/constants';

interface PartnerProfile {
  initials: string;
  department: string;
  study_level: string;
  about_text: string;
}

const MatchRevealPage: React.FC = () => {
  const navigate = useNavigate();
  const [partnerData, setPartnerData] = useState<PartnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement[]>([]);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLHeadingElement>(null);
  const initialsRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/matching/me/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.partner_profile) {
            setPartnerData(data.partner_profile);

            // Mark as seen after animation
            setTimeout(async () => {
              await fetch(`${import.meta.env.VITE_API_BASE_URL}/matching/seen/`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });
            }, 8000);
          } else {
            navigate(ROUTES.DASHBOARD);
          }
        } else {
          navigate(ROUTES.DASHBOARD);
        }
      } catch (error) {
        console.error('Error fetching match:', error);
        navigate(ROUTES.DASHBOARD);
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [navigate]);

  useEffect(() => {
    if (!partnerData || !containerRef.current) return;

    const container = containerRef.current;
    const isMobile = window.innerWidth < 640;
    const numberOfPanels = isMobile ? 8 : 12;
    const elHeight = window.innerHeight / numberOfPanels;
    const elWidth = window.innerWidth / numberOfPanels;

    // Clear existing panels
    panelsRef.current.forEach(panel => panel?.remove());
    panelsRef.current = [];

    // Create panels
    for (let i = 0; i < numberOfPanels; i++) {
      const panel1 = document.createElement('div');
      panel1.className = 'panel panel1';
      panel1.style.cssText = `
        width: 100vw; height: 100vh; position: absolute;
        background: linear-gradient(105deg,
          rgba(255, 149, 236, 1) 0%,
          rgba(255, 89, 226, 1) 6%,
          rgba(255, 0, 211, 1) 19%,
          rgba(220, 20, 60, 1) 72%,
          rgba(0, 0, 0, ${1 - i * 0.01}) 100%);
        z-index: ${i};
      `;
      container.appendChild(panel1);
      panelsRef.current.push(panel1);
    }

    const tl = gsap.timeline({
      onComplete: () => {
        // Show partner info after animation
        if (initialsRef.current && infoRef.current) {
          gsap.to(initialsRef.current, { opacity: 1, scale: 1, duration: 1, ease: 'back.out(1.7)' });
          gsap.to(infoRef.current, { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: 'power2.out' });

          // Navigate to dashboard after 5 seconds
          setTimeout(() => {
            navigate(ROUTES.DASHBOARD);
          }, 5000);
        }
      }
    });

    // Title animation
    tl.fromTo(
      titleRef.current,
      { x: '100%', opacity: 0 },
      { x: '0%', opacity: 1, duration: 1.2, ease: 'power4.out' },
      0
    );

    tl.to(
      titleRef.current,
      { y: isMobile ? -40 : -60, duration: 0.5, ease: 'sine.out' },
      1.5
    );

    // Subtitle animation
    tl.fromTo(
      subtitleRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'sine.out' },
      2
    );

    // Title exit
    tl.to(
      [titleRef.current, subtitleRef.current],
      { x: '-100%', opacity: 0, duration: 0.8, ease: 'power2.in' },
      3.5
    );

    // Panel animations
    panelsRef.current.forEach((panel, i) => {
      const wi = window.innerWidth - elWidth * (numberOfPanels - i) + elWidth;
      const he = window.innerHeight - elHeight * (numberOfPanels - i) + elHeight;

      tl.fromTo(
        panel,
        {
          y: elHeight * 5.5,
          x: elWidth * 5.5,
          width: 0,
          height: 0,
          rotation: -360,
        },
        {
          width: wi,
          height: he,
          y: -elHeight / 1.33 + ((numberOfPanels - i) * elHeight) / 1.33,
          x: 0,
          duration: 1 + 0.1 * (numberOfPanels - i),
          ease: 'sine.inOut',
          rotation: 0,
        },
        0
      );

      tl.to(
        panel,
        {
          rotation: numberOfPanels * 5 - (i + 1) * 5,
          duration: 2,
          ease: 'linear',
        },
        '>'
      );

      tl.to(
        panel,
        {
          rotation: 360,
          y: -elHeight / 6 + ((numberOfPanels - i) * elHeight) / 6,
          x: -elWidth / 1.2 + ((numberOfPanels - i) * elWidth) / 1.2,
          ease: 'sine.inOut',
          duration: 1,
        },
        '>'
      );

      tl.to(
        panel,
        {
          rotation: numberOfPanels * 5 - (i + 1) * 5 + 360,
          duration: 1.5,
          ease: 'linear',
        },
        '>'
      );

      tl.to(
        panel,
        {
          scale: 0,
          opacity: 0,
          duration: 0.5,
          ease: 'power2.in',
        },
        4.2
      );
    });

    return () => {
      panelsRef.current.forEach(panel => panel?.remove());
    };
  }, [partnerData, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-4">
        <div className="text-white text-xl sm:text-2xl text-center">Loading your match...</div>
      </div>
    );
  }

  if (!partnerData) {
    return null;
  }

  const getDepartmentLabel = (dept: string) => {
    const deptMap: Record<string, string> = {
      'EDU_PRIMARY': 'Primary Education',
      'EDU_SCIENCES': 'Educational Sciences',
      'EDU_TEFL': 'TEFL',
      'PHYS': 'Physics',
      'CHEM': 'Chemistry',
      'MATH': 'Mathematics',
      'MBG': 'Molecular Biology & Genetics',
      'GD': 'Graphic Design',
      'FA': 'Fine Arts',
      'IAED': 'Interior Architecture & Environmental Design',
      'CD': 'Communication Design',
      'UDLA': 'Urban Design & Landscape Architecture',
      'ARCH': 'Architecture',
      'ECON': 'Economics',
      'PSYC': 'Psychology',
      'POL': 'Political Science',
      'HIST': 'History',
      'IR': 'International Relations',
      'ACL': 'American Culture & Literature',
      'ARCHAE': 'Archaeology',
      'PHIL': 'Philosophy',
      'ELIT': 'English Literature',
      'TRANS': 'Translation',
      'TLIT': 'Turkish Literature',
      'BUS': 'Business',
      'LAW': 'Law',
      'CS': 'Computer Engineering',
      'EE': 'Electrical & Electronics Engineering',
      'IE': 'Industrial Engineering',
      'ME': 'Mechanical Engineering',
      'MUSIC': 'Music',
      'THEATRE': 'Theatre',
      'IST': 'Information Systems',
      'TOH': 'Tourism & Hotel Management',
    };
    return deptMap[dept] || dept;
  };

  const getStudyLevelLabel = (level: string) => {
    const levelMap: Record<string, string> = {
      'UG': 'Undergraduate',
      'GR': 'Graduate',
      'PHD': 'PhD',
    };
    return levelMap[level] || level;
  };

  return (
    <div ref={containerRef} className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Animated Title */}
      <h1
        ref={titleRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-white text-center px-4 z-50 leading-tight"
      >
        You Have a New Match!
      </h1>
      <h2
        ref={subtitleRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-16 sm:mt-20 text-lg sm:text-2xl md:text-3xl font-normal text-white text-center z-50"
      >
        Match Reveal
      </h2>

      {/* Partner Info - Hidden initially */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-40 pointer-events-none px-4">
        <div
          ref={initialsRef}
          className="opacity-0 scale-0 w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-red-600 flex items-center justify-center shadow-2xl shadow-purple-500/50"
        >
          <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white">
            {partnerData.initials}
          </span>
        </div>

        <div
          ref={infoRef}
          className="opacity-0 translate-y-10 mt-6 sm:mt-8 text-center w-full max-w-lg"
        >
          <p className="text-gray-400 text-sm sm:text-base md:text-lg mb-2 px-4">
            {getDepartmentLabel(partnerData.department)} • {getStudyLevelLabel(partnerData.study_level)}
          </p>
          <p className="text-white text-base sm:text-lg md:text-xl px-4 leading-relaxed">
            "{partnerData.about_text}"
          </p>
        </div>
      </div>

      {/* Skip Button */}
      <button
        onClick={() => navigate(ROUTES.DASHBOARD)}
        className="absolute bottom-6 right-4 sm:bottom-8 sm:right-8 z-50 px-4 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs sm:text-sm font-medium hover:bg-white/20 transition-colors"
      >
        Skip →
      </button>
    </div>
  );
};

export default MatchRevealPage;
