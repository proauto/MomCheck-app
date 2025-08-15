import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface BottomNavProps {
  active?: 'home' | 'my';
}

export const BottomNav: React.FC<BottomNavProps> = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-bg-panel border-t border-border-subtle sm:hidden"
      role="navigation"
    >
      <div className="flex h-16">
        <Link
          to="/"
          className={`flex-1 flex flex-col items-center justify-center gap-xs ${
            isHome ? 'text-brand-500' : 'text-text-muted'
          }`}
          aria-current={isHome ? 'page' : undefined}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
            />
          </svg>
          <span className="text-xs">홈</span>
        </Link>
        
        <Link
          to="/weekly-info"
          className={`flex-1 flex flex-col items-center justify-center gap-xs ${
            location.pathname === '/weekly-info' ? 'text-brand-500' : 'text-text-muted'
          }`}
          aria-current={location.pathname === '/weekly-info' ? 'page' : undefined}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          <span className="text-xs">주수별정보</span>
        </Link>
      </div>
    </nav>
  );
};