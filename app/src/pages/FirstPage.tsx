import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '../components/layout/Page';
import { TopBar } from '../components/layout/TopBar';
import { BottomNav } from '../components/layout/BottomNav';
import { InputPanel } from '../components/form/InputPanel';
import { PregnancyWeekCalculator } from '../components/common/PregnancyWeekCalculator';
import { useStore } from '../app/store';
import logoImg from '../assets/logo.png';

export const FirstPage: React.FC = () => {
  const navigate = useNavigate();
  const { form, setForm } = useStore();
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  
  useEffect(() => {
    document.title = '임신 체중 계산기';
  }, []);
  
  const handleSubmit = () => {
    if (form.week && form.height && form.weight && form.preWeight && form.type) {
      const params = new URLSearchParams({
        week: form.week.toString(),
        height: form.height.toString(),
        weight: form.weight.toString(),
        preWeight: form.preWeight.toString(),
        type: form.type
      });
      navigate(`/result?${params.toString()}`);
    }
  };

  const handleWeekCalculated = (week: number) => {
    setForm({ week });
  };
  
  return (
    <>
      {/* 웹에서만 TopBar 표시 */}
      <div className="hidden sm:block">
        <TopBar logoSrc={logoImg} title="MomCheck" />
      </div>
      
      <Page title="임신 체중 계산기">
        {/* 모바일 레이아웃 (앱 버전) */}
        <div className="min-h-screen flex flex-col bg-gray-50 sm:hidden">
          {/* 메인 콘텐츠 영역 */}
          <div className="flex flex-col items-center px-lg">
            {/* 로고 및 타이틀 - 상단 여백 */}
            <div className="text-center mt-8 mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden">
                <img 
                  src={logoImg} 
                  alt="MomCheck Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 
                className="text-center" 
                style={{ 
                  fontFamily: 'Noto Sans KR',
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#1E1B1C'
                }}
              >
                맘체크 <span style={{ color: '#EC407A' }}>MomCheck</span>
              </h1>
            </div>
            
            {/* 입력 폼 */}
            <div className="w-full">
              <InputPanel
                values={form}
                onChange={setForm}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
          
          {/* 중간 영역 - 임신주차 링크만 */}
          <div className="flex-grow flex flex-col items-center justify-center px-lg py-8">
            {/* 임신주차 링크 */}
            <div className="text-center">
              <button 
                onClick={() => setIsCalculatorOpen(true)}
                className="text-base text-gray-600 hover:text-brand-500 transition-colors"
                style={{ fontWeight: '500' }}
              >
                임신 주수를 알고싶어요
              </button>
            </div>
          </div>
          
          {/* 광고 영역 - 하단 고정 */}
          <div className="bg-white py-4 border-t border-gray-200 flex-shrink-0">
            <div className="max-w-md mx-auto px-lg">
              <div className="text-center">
                <div className="bg-gray-100 rounded-xl p-4 border border-gray-200">
                  <div className="text-gray-500 text-sm">
                    광고 영역
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 웹 레이아웃 (기존 버전) */}
        <div className="min-h-[calc(100vh-64px)] flex flex-col hidden sm:flex">
          {/* 메인 콘텐츠 영역 */}
          <div className="flex flex-col items-center px-lg">
            {/* 텍스트 - 네비게이션으로부터 48px */}
            <div className="text-center" style={{ marginTop: '48px' }}>
              <h1 
                className="text-center" 
                style={{ 
                  fontFamily: 'Noto Sans KR',
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#1E1B1C'
                }}
              >
                맘체크 <span style={{ color: '#EC407A' }}>MomCheck</span>
              </h1>
            </div>
            
            {/* 텍스트 아래 48px에 입력 폼 */}
            <div className="w-full" style={{ marginTop: '48px' }}>
              <InputPanel
                values={form}
                onChange={setForm}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
          
          {/* 가운데 공간 - flex-grow로 남은 공간 차지 */}
          <div className="flex-grow flex items-center justify-center">
            {/* 임신주차 링크 */}
            <div className="text-center">
              <button 
                onClick={() => setIsCalculatorOpen(true)}
                className="text-sm text-text-muted hover:text-brand-500 transition-colors underline"
              >
                임신 주수를 알고싶어요
              </button>
            </div>
          </div>
          
          {/* 광고 영역 - 하단 고정 */}
          <div className="bg-bg-subtle py-sm border-t border-border-subtle flex-shrink-0">
            <div className="max-w-4xl mx-auto px-lg">
              <div className="text-center">
                <div className="text-xs text-text-muted mb-xs">광고 위치</div>
                <div className="bg-white rounded-lg p-sm border border-border-subtle">
                  <div className="text-text-muted text-xs">
                    광고
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Page>
      
      {/* 웹에서만 BottomNav 표시 */}
      <div className="hidden sm:block">
        <BottomNav />
      </div>
      
      {/* 임신 주수 계산기 토스트 */}
      <PregnancyWeekCalculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onWeekSelected={handleWeekCalculated}
      />
    </>
  );
};