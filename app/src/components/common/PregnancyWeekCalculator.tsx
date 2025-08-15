import React, { useState, useEffect } from 'react';
import { CustomDatePicker } from './CustomDatePicker';

interface PregnancyWeekCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  onWeekSelected: (week: number) => void;
}

export const PregnancyWeekCalculator: React.FC<PregnancyWeekCalculatorProps> = ({
  isOpen,
  onClose,
  onWeekSelected
}) => {
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [cycleLength, setCycleLength] = useState('');
  const [calculatedWeek, setCalculatedWeek] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState<string>('');
  const [showResult, setShowResult] = useState(false);

  const resetForm = () => {
    setLastPeriodDate('');
    setCycleLength('');
    setCalculatedWeek(null);
    setDueDate('');
    setShowResult(false);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const calculatePregnancyWeek = () => {
    if (!lastPeriodDate || !cycleLength) return;

    const lmp = new Date(lastPeriodDate);
    const today = new Date();
    const cycleAdj = parseInt(cycleLength) - 28; // 28일 기준으로 조정

    // 마지막 생리일에서 생리주기 조정값을 빼고 계산
    const adjustedLmp = new Date(lmp.getTime() - (cycleAdj * 24 * 60 * 60 * 1000));
    
    // 임신 주수 계산 (일수 차이를 7로 나눔)
    const daysDiff = Math.floor((today.getTime() - adjustedLmp.getTime()) / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(daysDiff / 7);

    // 출산 예정일 계산 (마지막 생리일 + 280일)
    const estimatedDueDate = new Date(adjustedLmp.getTime() + (280 * 24 * 60 * 60 * 1000));

    setCalculatedWeek(Math.max(1, Math.min(40, weeks)));
    setDueDate(estimatedDueDate.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
    setShowResult(true);
  };

  const handleConfirm = () => {
    if (calculatedWeek !== null) {
      onWeekSelected(calculatedWeek);
      onClose();
    }
  };

  const isCalculateEnabled = lastPeriodDate && cycleLength;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 max-w-sm mx-4">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-4">
          <h2 
            style={{ 
              fontFamily: 'Noto Sans KR',
              fontWeight: '700',
              fontSize: '20px',
              color: '#1E1B1C'
            }}
          >
            임신 주수
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        {!showResult ? (
          <>
            {/* 설명 */}
            <p 
              className="mb-6"
              style={{ 
                fontFamily: 'Noto Sans KR',
                fontWeight: '400',
                fontSize: '14px',
                color: '#1E1B1C',
                lineHeight: '1.5'
              }}
            >
              평균 임신 기간 40주, 마지막 생리 시작일을 기준으로 계산해요.
            </p>

            {/* 마지막 생리 시작일 */}
            <div className="mb-4">
              <label 
                className="block mb-2"
                style={{ 
                  fontFamily: 'Noto Sans KR',
                  fontWeight: '500',
                  fontSize: '14px',
                  color: '#1E1B1C'
                }}
              >
                마지막 생리 시작일
              </label>
              <CustomDatePicker
                value={lastPeriodDate}
                onChange={setLastPeriodDate}
                placeholder="날짜 선택"
              />
            </div>

            {/* 생리 주기 */}
            <div className="mb-6">
              <label 
                className="block mb-2"
                style={{ 
                  fontFamily: 'Noto Sans KR',
                  fontWeight: '500',
                  fontSize: '14px',
                  color: '#1E1B1C'
                }}
              >
                생리 주기
              </label>
              <select
                value={cycleLength}
                onChange={(e) => setCycleLength(e.target.value)}
                className="w-full px-md py-sm bg-bg-field border border-border-subtle rounded-pill appearance-none
                  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                style={{ 
                  fontFamily: 'Noto Sans KR',
                  fontWeight: '500',
                  fontSize: '14px',
                  color: cycleLength ? '#1E1B1C' : '#938288',
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`, 
                  backgroundPosition: 'right 0.5rem center', 
                  backgroundRepeat: 'no-repeat', 
                  backgroundSize: '1.5em 1.5em'
                }}
              >
                <option value="" disabled>nn일</option>
                {Array.from({ length: 21 }, (_, i) => i + 20).map(days => (
                  <option key={days} value={days}>{days}일</option>
                ))}
              </select>
            </div>

            {/* 계산하기 버튼 */}
            <button
              onClick={calculatePregnancyWeek}
              disabled={!isCalculateEnabled}
              className="w-full py-3 rounded-full font-medium"
              style={{ 
                backgroundColor: isCalculateEnabled ? '#EC407A' : '#E5DCDF',
                color: isCalculateEnabled ? '#FFFFFF' : '#938288',
                fontFamily: 'Noto Sans KR',
                fontWeight: '500',
                fontSize: '16px'
              }}
            >
              계산하기
            </button>
          </>
        ) : (
          <>
            {/* 계산 결과 */}
            <div className="text-center mb-6">
              <div className="mb-4">
                <p 
                  style={{ 
                    fontFamily: 'Noto Sans KR',
                    fontWeight: '500',
                    fontSize: '14px',
                    color: '#1E1B1C',
                    marginBottom: '8px'
                  }}
                >
                  내 임신 주수
                </p>
                <p 
                  style={{ 
                    fontFamily: 'Noto Sans KR',
                    fontWeight: '700',
                    fontSize: '24px',
                    color: '#EC407A'
                  }}
                >
                  {calculatedWeek}주
                </p>
              </div>
              
              <div>
                <p 
                  style={{ 
                    fontFamily: 'Noto Sans KR',
                    fontWeight: '500',
                    fontSize: '14px',
                    color: '#1E1B1C',
                    marginBottom: '8px'
                  }}
                >
                  출생 예정일
                </p>
                <p 
                  style={{ 
                    fontFamily: 'Noto Sans KR',
                    fontWeight: '600',
                    fontSize: '16px',
                    color: '#1E1B1C'
                  }}
                >
                  {dueDate}
                </p>
              </div>
            </div>

            {/* 확인 버튼 */}
            <button
              onClick={handleConfirm}
              className="w-full py-3 rounded-full font-medium"
              style={{ 
                backgroundColor: '#EC407A',
                color: '#FFFFFF',
                fontFamily: 'Noto Sans KR',
                fontWeight: '500',
                fontSize: '16px'
              }}
            >
              확인
            </button>
          </>
        )}
      </div>
    </div>
  );
};