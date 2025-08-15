import React, { useState, useEffect } from 'react';
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
    const container = document.getElementById('week-slider');
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="space-y-xl" style={{ paddingLeft: '100px', paddingRight: '100px' }}>
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
        <button
          onClick={() => scrollToWeek('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white shadow-md rounded-full"
          style={{ color: '#EC407A' }}
        >
          ←
        </button>
        
        <div 
          id="week-slider"
          className="overflow-x-auto scrollbar-hide mx-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex space-x-2 py-2">
            {weeks.map(week => (
              <button
                key={week}
                onClick={() => handleWeekChange(week)}
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  selectedWeek === week 
                    ? 'text-white' 
                    : 'text-text-default hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor: selectedWeek === week ? '#EC407A' : 'transparent',
                  fontFamily: 'Noto Sans KR',
                  fontWeight: selectedWeek === week ? '600' : '400',
                  fontSize: '14px'
                }}
              >
                {week}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => scrollToWeek('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white shadow-md rounded-full"
          style={{ color: '#EC407A' }}
        >
          →
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