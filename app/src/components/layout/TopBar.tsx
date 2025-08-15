import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../../app/store';

interface TopBarProps {
  logoSrc: string;
  title?: string;
  activeTab?: 'result' | 'weekly';
  onTabChange?: (tab: 'result' | 'weekly') => void;
}

export const TopBar: React.FC<TopBarProps> = ({ logoSrc, activeTab, onTabChange }) => {
  const resetForm = useStore(state => state.resetForm);
  const location = useLocation();
  const isResultPage = location.pathname === '/result';
  
  const handleLogoClick = () => {
    resetForm();
  };
  
  return (
    <header 
      className="sticky top-0 z-50 bg-white border-b border-border-subtle"
      role="banner"
    >
      <div className="w-full px-0">
        <div className="flex items-center justify-between h-16 relative">
          <div className="absolute left-8">
            <Link to="/" onClick={handleLogoClick} className="flex items-center gap-sm">
              <img 
                src={logoSrc} 
                alt="Logo" 
                className="w-7 h-7 rounded-md"
                style={{ borderRadius: '6px' }}
              />
              <div className="flex items-center">
                <span 
                  style={{ 
                    fontFamily: 'Montserrat',
                    fontWeight: '300',
                    fontSize: '20px',
                    color: '#EC407A'
                  }}
                >
                  Mom
                </span>
                <span 
                  style={{ 
                    fontFamily: 'Montserrat',
                    fontWeight: '600',
                    fontSize: '20px',
                    color: '#EC407A'
                  }}
                >
                  Check
                </span>
              </div>
            </Link>
          </div>
          
          <nav className="absolute right-8 flex items-center" style={{ gap: '46px' }}>
            {isResultPage && (
              <>
                <button 
                  onClick={() => onTabChange?.('result')}
                  className={`transition-colors text-sm ${
                    activeTab === 'result' 
                      ? 'text-brand-500 font-medium' 
                      : 'text-text-default hover:text-brand-500'
                  }`}
                >
                  체중 관리
                </button>
                <button 
                  onClick={() => onTabChange?.('weekly')}
                  className={`transition-colors text-sm ${
                    activeTab === 'weekly' 
                      ? 'text-brand-500 font-medium' 
                      : 'text-text-default hover:text-brand-500'
                  }`}
                >
                  주수별 맞춤정보
                </button>
              </>
            )}
{/* 첫페이지에서는 주수별 맞춤정보 숨김 */}
          </nav>
        </div>
      </div>
    </header>
  );
};