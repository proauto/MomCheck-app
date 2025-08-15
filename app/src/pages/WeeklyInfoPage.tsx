import React, { useEffect, useState } from 'react';
import { Page } from '../components/layout/Page';
import { TopBar } from '../components/layout/TopBar';
import { BottomNav } from '../components/layout/BottomNav';
import { useStore } from '../app/store';
import { WeeklyInfo } from '../components/common/WeeklyInfo';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import logoImg from '../assets/logo.png';

export const WeeklyInfoPage: React.FC = () => {
  const { form } = useStore();
  const [selectedWeek, setSelectedWeek] = useState<number>(form.week || 20);
  const isLoading = false; // 주수별정보 페이지는 로딩 화면 없음

  useEffect(() => {
    document.title = '주수별 맞춤정보 - MomCheck';
  }, []);

  const handleWeekChange = (week: number) => {
    setSelectedWeek(week);
  };

  return (
    <>
      {/* 웹에서만 TopBar 표시 */}
      <div className="hidden sm:block">
        <TopBar logoSrc={logoImg} title="주수별 맞춤정보" />
      </div>
      
      <Page title="주수별 맞춤정보">
        {/* 모바일 레이아웃 (앱 버전) */}
        <div className="min-h-screen bg-gray-50 sm:hidden overflow-x-hidden">
          {/* 상단 네비게이션 바 - 88px */}
          <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50" style={{ height: '88px' }}>
            <div className="flex items-center justify-between h-full px-4">
              {/* 뒤로가기 버튼 */}
              <button
                onClick={() => window.history.back()}
                className="p-2"
              >
                <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {/* 중앙 타이틀 */}
              <h1 style={{
                fontFamily: 'Noto Sans CJK KR',
                fontWeight: '500',
                fontSize: '24px',
                color: '#000000'
              }}>
                주수별 맞춤정보
              </h1>
              
              {/* 빈 공간 (균형을 위해) */}
              <div className="w-10"></div>
            </div>
          </div>
          
          {isLoading ? (
            /* 앱에서만 로딩 화면 */
            <div style={{ marginTop: '88px' }}>
              <LoadingSpinner message="주수별 맞춤정보를 불러오는 중..." />
            </div>
          ) : (
            <div className="overflow-y-auto overflow-x-hidden" style={{ height: 'calc(100vh - 88px)', marginTop: '88px' }}>
              {/* 주수별 정보 컨텐츠 - 화면 가득 차게 */}
              <div className="px-2 py-4">
                <WeeklyInfo currentWeek={selectedWeek} />
              </div>

              {/* 추가 안내 */}
              <div className="px-2 py-md">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 mb-1">
                        개인차 안내
                      </h4>
                      <p className="text-sm text-blue-700">
                        임신 과정은 개인차가 있을 수 있습니다. 
                        궁금한 사항이나 우려되는 증상이 있다면 반드시 담당 의료진과 상담하세요.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* 웹 레이아웃 (기존 버전) */}
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 pb-20 hidden sm:block">
          {/* 주차 선택 영역 */}
          <div className="bg-white border-b border-gray-200 px-lg py-md">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">임신 주차 선택</h2>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedWeek}
                  onChange={(e) => handleWeekChange(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  {Array.from({ length: 37 }, (_, i) => i + 4).map((week) => (
                    <option key={week} value={week}>
                      {week}주차
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 주수별 정보 컨텐츠 */}
          <div className="px-lg py-md">
            <WeeklyInfo currentWeek={selectedWeek} />
          </div>

          {/* 추가 안내 */}
          <div className="px-lg py-md">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">
                    개인차 안내
                  </h4>
                  <p className="text-sm text-blue-700">
                    임신 과정은 개인차가 있을 수 있습니다. 
                    궁금한 사항이나 우려되는 증상이 있다면 반드시 담당 의료진과 상담하세요.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 관련 기능 바로가기 */}
          <div className="px-lg py-md">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">관련 기능</h3>
              <div className="space-y-2">
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-brand-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">체중 계산기</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Page>
      
      {/* 웹에서만 BottomNav 표시 */}
      <div className="hidden sm:block">
        <BottomNav />
      </div>
    </>
  );
};