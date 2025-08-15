import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "로딩 중..." 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      {/* 로딩 스피너 */}
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-brand-500 rounded-full animate-spin"></div>
      </div>
      
      {/* 로딩 메시지 */}
      <div className="mt-4 text-center">
        <p className="text-gray-600 text-base font-medium">{message}</p>
      </div>
    </div>
  );
};