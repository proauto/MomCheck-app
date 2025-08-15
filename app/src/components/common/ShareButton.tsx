import React, { useState } from 'react';

export const ShareButton: React.FC = () => {
  const [copied, setCopied] = useState(false);
  
  const handleShare = async () => {
    const shareData = {
      title: '임신 체중 계산 결과',
      text: '나의 임신 체중 관리 결과를 확인해보세요',
      url: window.location.href
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };
  
  return (
    <button
      onClick={handleShare}
      aria-label="결과 공유"
      className="px-lg py-sm text-sm font-medium rounded-pill transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        backgroundColor: '#EC407A',
        color: '#FFFFFF'
      }}
    >
      {copied ? '복사됨' : '공유'}
    </button>
  );
};