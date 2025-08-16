import React, { useState, useEffect, useRef } from 'react';
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
    if (!sliderRef.current || typeof window === 'undefined') return;
    
    const container = sliderRef.current;
    const buttonWidth = window.innerWidth >= 640 ? 56 : 48;
    const scrollAmount = buttonWidth * 3;
    
    if (window.innerWidth >= 640) {
      // 웹: transform 기반
      const maxTranslate = Math.min(0, -(container.scrollWidth - container.clientWidth));
      let newTranslateX = translateX;
      
      if (direction === 'right') {
        newTranslateX = Math.max(maxTranslate, translateX - scrollAmount);
      } else {
        newTranslateX = Math.min(0, translateX + scrollAmount);
      }
      
      setTranslateX(newTranslateX);
      
      const content = container.querySelector('.week-slider-content') as HTMLElement;
      if (content) {
        content.style.transform = `translateX(${newTranslateX}px)`;
        content.style.transition = 'transform 0.3s ease';
      }
    } else {
      // 모바일: 기존 scrollLeft 방식 유지
      const currentScroll = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.clientWidth;
      
      let newScrollPosition;
      if (direction === 'right') {
        newScrollPosition = Math.min(currentScroll + scrollAmount, maxScroll);
      } else {
        newScrollPosition = Math.max(currentScroll - scrollAmount, 0);
      }
      
      container.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  // CSS Transform 기반 드래그 구현 (웹에서만)
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth < 640) return;

    const slider = sliderRef.current;
    if (!slider) return;

    let startX = 0;
    let startTranslateX = 0;
    let animationId: number;

    const updateTransform = (newTranslateX: number) => {
      const maxTranslate = Math.min(0, -(slider.scrollWidth - slider.clientWidth));
      const clampedTranslate = Math.max(maxTranslate, Math.min(0, newTranslateX));
      setTranslateX(clampedTranslate);
      
      const content = slider.querySelector('.week-slider-content') as HTMLElement;
      if (content) {
        content.style.transform = `translateX(${clampedTranslate}px)`;
        content.style.transition = isDragging ? 'none' : 'transform 0.3s ease';
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button')) return;

      setIsDragging(true);
      startX = e.clientX;
      startTranslateX = translateX;
      slider.style.cursor = 'grabbing';
      
      if (animationId) cancelAnimationFrame(animationId);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      e.preventDefault();
      const deltaX = e.clientX - startX;
      const newTranslateX = startTranslateX + deltaX;
      
      animationId = requestAnimationFrame(() => updateTransform(newTranslateX));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      slider.style.cursor = 'grab';
    };

    // 전역 이벤트로 드래그 추적
    const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();

    slider.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      slider.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [translateX, isDragging]);

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
            // 모바일용 설정 (앱에서만)
            WebkitOverflowScrolling: typeof window !== 'undefined' && window.innerWidth < 640 ? 'touch' : 'auto',
            // 웹에서는 드래그 중 스크롤 비활성화
            scrollBehavior: typeof window !== 'undefined' && window.innerWidth >= 640 ? 'auto' : 'smooth',
            cursor: typeof window !== 'undefined' && window.innerWidth >= 640 ? 'grab' : 'auto',
            // 웹에서는 기본 스크롤 완전 비활성화
            overflowX: typeof window !== 'undefined' && window.innerWidth >= 640 ? 'hidden' : 'auto'
          }}
        >
          <div 
            className="week-slider-content flex space-x-1 sm:space-x-2 py-2" 
            style={{ 
              minWidth: 'max-content',
              transform: typeof window !== 'undefined' && window.innerWidth >= 640 ? `translateX(${translateX}px)` : 'none',
              transition: typeof window !== 'undefined' && window.innerWidth >= 640 && !isDragging ? 'transform 0.3s ease' : 'none'
            }}
          >
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