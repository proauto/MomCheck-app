import React, { useState, useEffect, useRef } from 'react';

interface CustomDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  placeholder = "날짜 선택"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
    onChange(formatDate(newDate));
    setIsOpen(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // 빈 날짜들
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    // 실제 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate && 
        selectedDate.getFullYear() === currentDate.getFullYear() &&
        selectedDate.getMonth() === currentDate.getMonth() &&
        selectedDate.getDate() === day;

      const today = new Date();
      const isToday = today.getFullYear() === currentDate.getFullYear() &&
        today.getMonth() === currentDate.getMonth() &&
        today.getDate() === day;

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
            isSelected
              ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md'
              : isToday
              ? 'bg-brand-50 text-brand-500 border border-brand-500'
              : 'text-text-default hover:bg-brand-50 hover:text-brand-500'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-md py-sm bg-bg-field border border-border-subtle rounded-pill
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
          text-left flex items-center justify-between"
        style={{ 
          height: '48px',
          fontFamily: 'Noto Sans KR',
          fontWeight: '500',
          fontSize: '14px',
          color: selectedDate ? '#1E1B1C' : '#938288'
        }}
      >
        <span>
          {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
        </span>
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 20 20" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="3" y="5" width="14" height="12" rx="3" stroke="#F4468F" strokeWidth="1.5"/>
          <line x1="3" y1="9" x2="17" y2="9" stroke="#F4468F" strokeWidth="1.5"/>
          <line x1="7" y1="3" x2="7" y2="7" stroke="#F4468F" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="13" y1="3" x2="13" y2="7" stroke="#F4468F" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="7" cy="12" r="1" fill="#F4468F"/>
          <circle cx="10" cy="12" r="1" fill="#F4468F"/>
          <circle cx="13" cy="12" r="1" fill="#F4468F"/>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-border-subtle z-50 p-4">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-brand-50 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="#F4468F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <h3 style={{ 
              fontFamily: 'Noto Sans KR',
              fontWeight: '600',
              fontSize: '16px',
              color: '#1E1B1C'
            }}>
              {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
            </h3>
            
            <button
              onClick={() => navigateMonth('next')}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-brand-50 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="#F4468F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['일', '월', '화', '수', '목', '금', '토'].map(day => (
              <div key={day} className="w-8 h-8 flex items-center justify-center text-xs font-medium text-text-muted">
                {day}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>
        </div>
      )}
    </div>
  );
};