import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '../layout/Card';
import { ShareButton } from './ShareButton';
import { 
  getCachedWeeklyData, 
  clearCache,
  forceRefresh
} from '../../services/weeklyDataCache';
import type { WeeklyData } from '../../services/markdownLoader';

interface WeeklyInfoProps {
  currentWeek: number;
}

export const WeeklyInfo: React.FC<WeeklyInfoProps> = ({ currentWeek }) => {
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  // 마크다운 파일에서 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await getCachedWeeklyData();
        setWeeklyData(data);
        console.log(`마크다운에서 ${data.length}개의 주차 데이터 로드`);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    
    // 개발용: 전역 함수 등록
    if (typeof window !== 'undefined') {
      (window as any).clearMarkdownCache = clearCache;
      (window as any).forceRefreshMarkdown = async () => {
        setLoading(true);
        const success = await forceRefresh();
        if (success) {
          const updatedData = await getCachedWeeklyData();
          setWeeklyData(updatedData);
          console.log('마크다운 강제 갱신 완료!');
        }
        setLoading(false);
        return success;
      };
      console.log('개발용 함수 등록: clearMarkdownCache(), forceRefreshMarkdown()');
    }
  }, []);
  
  // 주수별 데이터 찾기 (없으면 기본 데이터)
  const currentData = weeklyData.find(data => data.week === selectedWeek) || {
    week: selectedWeek,
    title: `${selectedWeek}주차 맞춤 정보`,
    content1: `임신 ${selectedWeek}주차의 맞춤 정보를 준비 중입니다.`,
    content2: '곧 더 자세한 정보를 제공할 예정입니다.',
    tipTitle: '이번 주 팁',
    tipContent: '규칙적인 산전 검사를 받고 건강한 생활습관을 유지하세요.'
  };

  // 주수 슬라이더 생성 (4주~40주) - 마크다운 파일과 매칭
  const weeks = Array.from({ length: 37 }, (_, i) => i + 4);
  
  const handleWeekChange = (week: number) => {
    setSelectedWeek(week);
  };

  const scrollToWeek = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    
    const container = sliderRef.current;
    const buttonWidth = window.innerWidth >= 640 ? 56 : 48; // sm에서는 56px (w-12 + space-x-2), 모바일에서는 48px (w-11 + space-x-1)
    const scrollAmount = buttonWidth * 3; // 3개 버튼만큼 스크롤
    const currentScroll = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    let newScrollPosition;
    if (direction === 'right') {
      newScrollPosition = Math.min(currentScroll + scrollAmount, maxScroll);
    } else {
      newScrollPosition = Math.max(currentScroll - scrollAmount, 0);
    }
    
    // CSS smooth scroll 제거하고 직접 애니메이션
    container.style.scrollBehavior = 'auto';
    container.scrollTo({
      left: newScrollPosition,
      behavior: 'smooth'
    });
    
    // 애니메이션 후 CSS smooth scroll 복원
    setTimeout(() => {
      if (container) {
        container.style.scrollBehavior = 'smooth';
      }
    }, 300);
  };

  // 드래그 스크롤 기능 (웹에서만, useCallback으로 최적화)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!sliderRef.current || typeof window === 'undefined' || window.innerWidth < 640) return;
    
    // 버튼 클릭은 무시
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return;
    }
    
    const slider = sliderRef.current;
    const rect = slider.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startScrollLeft = slider.scrollLeft;
    
    // 드래그 상태 플래그 (ref 사용으로 클로저 문제 해결)
    const dragState = { isDragging: true };
    
    slider.style.cursor = 'grabbing';
    slider.style.scrollBehavior = 'auto';
    slider.style.userSelect = 'none';
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragState.isDragging || !slider) return;
      
      moveEvent.preventDefault();
      const rect = slider.getBoundingClientRect();
      const x = moveEvent.clientX - rect.left;
      const walk = (x - startX) * 2;
      const newScrollLeft = startScrollLeft - walk;
      
      const maxScroll = slider.scrollWidth - slider.clientWidth;
      slider.scrollLeft = Math.max(0, Math.min(newScrollLeft, maxScroll));
    };
    
    const handleMouseUp = () => {
      dragState.isDragging = false;
      if (slider) {
        slider.style.cursor = 'grab';
        slider.style.scrollBehavior = 'smooth';
        slider.style.userSelect = '';
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <div className="space-y-xl sm:px-24 px-0">
      {/* 제목 */}
      <h2 
        style={{ 
          fontFamily: 'Noto Sans KR',
          fontWeight: '700',
          fontSize: '24px',
          color: '#1E1B1C',
          textAlign: 'center'
        }}
      >
        임신 주수별 맞춤정보
        {loading && (
          <span style={{ fontSize: '14px', fontWeight: '400', color: '#EC407A', marginLeft: '8px' }}>
            (마크다운 로딩 중...)
          </span>
        )}
      </h2>

      {/* 주수 슬라이더 */}
      <div className="relative">
        {/* 좌측 화살표 - 웹에서만 표시 */}
        <button
          onClick={() => scrollToWeek('left')}
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white shadow-lg rounded-full hover:shadow-xl transition-shadow"
          style={{ color: '#EC407A' }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div 
          id="week-slider"
          ref={sliderRef}
          className="overflow-x-auto sm:mx-12 mx-0 week-slider-container"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
            cursor: typeof window !== 'undefined' && window.innerWidth >= 640 ? 'grab' : 'auto'
          }}
          onMouseDown={handleMouseDown}
        >
          <div className="flex space-x-1 sm:space-x-2 py-2" style={{ minWidth: 'max-content' }}>
            {weeks.map(week => (
              <button
                key={week}
                onClick={() => handleWeekChange(week)}
                className={`flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all select-none ${
                  selectedWeek === week 
                    ? 'text-white shadow-md scale-110' 
                    : 'text-text-default hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor: selectedWeek === week ? '#EC407A' : 'transparent',
                  fontFamily: 'Noto Sans KR',
                  fontWeight: selectedWeek === week ? '600' : '400',
                  fontSize: '14px',
                  userSelect: 'none'
                }}
              >
                {week}
              </button>
            ))}
          </div>
        </div>

        {/* 우측 화살표 - 웹에서만 표시 */}
        <button
          onClick={() => scrollToWeek('right')}
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white shadow-lg rounded-full hover:shadow-xl transition-shadow"
          style={{ color: '#EC407A' }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 정보 카드들 */}
      <div className="space-y-4">
        {/* 첫 번째 하얀 카드 */}
        <Card className="p-6">
          <h3 
            style={{ 
              fontFamily: 'Noto Sans KR',
              fontWeight: '600',
              fontSize: '18px',
              color: '#1E1B1C',
              marginBottom: '16px'
            }}
          >
            {currentData.title}
          </h3>
          <div 
            style={{ 
              fontFamily: 'Noto Sans KR',
              fontWeight: '400',
              fontSize: '14px',
              color: '#1E1B1C',
              lineHeight: '1.6',
              whiteSpace: 'pre-line' // 줄바꿈 보존
            }}
            dangerouslySetInnerHTML={{
              __html: currentData.content1.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            }}
          />
        </Card>

        {/* 두 번째 하얀 카드 */}
        <Card className="p-6">
          <div 
            style={{ 
              fontFamily: 'Noto Sans KR',
              fontWeight: '400',
              fontSize: '14px',
              color: '#1E1B1C',
              lineHeight: '1.6',
              whiteSpace: 'pre-line' // 줄바꿈 보존
            }}
            dangerouslySetInnerHTML={{
              __html: currentData.content2.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            }}
          />
        </Card>

        {/* 세 번째 연한 분홍 카드 */}
        <Card 
          className="p-6"
          style={{ backgroundColor: '#E8DEDF' }}
        >
          {currentData.tipTitle && (
            <h4 
              style={{ 
                fontFamily: 'Noto Sans KR',
                fontWeight: '600',
                fontSize: '16px',
                color: '#1E1B1C',
                marginBottom: '12px'
              }}
            >
              {currentData.tipTitle}
            </h4>
          )}
          <div 
            style={{ 
              fontFamily: 'Noto Sans KR',
              fontWeight: '400',
              fontSize: '14px',
              color: '#1E1B1C',
              lineHeight: '1.6',
              whiteSpace: 'pre-line' // 줄바꿈 보존
            }}
            dangerouslySetInnerHTML={{
              __html: currentData.tipContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            }}
          />
        </Card>
      </div>

      {/* 공유하기 버튼 */}
      <div className="flex justify-center">
        <ShareButton />
      </div>
    </div>
  );
};