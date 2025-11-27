import React, { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { ROUTES } from '../../utils/constants';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isHome = location.pathname === ROUTES.HOME;
  
  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden" style={{ position: 'relative' }}>
      <Navbar />
      <main className={`flex-grow ${isHome ? 'pt-0' : ''}`} style={{ position: 'relative', width: '100%' }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
