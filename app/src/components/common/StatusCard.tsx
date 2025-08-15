import React from 'react';
import { Card } from '../layout/Card';
import { ShareButton } from './ShareButton';
import warningIcon from '../../assets/warning.png';

interface StatusCardProps {
  level: 'good' | 'warn' | 'danger';
  message: string;
  sub?: string;
  showShareButton?: boolean;
}

export const StatusCard: React.FC<StatusCardProps> = ({ level, message, sub, showShareButton = false }) => {
  const levelColors = {
    good: 'border-feedback-good text-feedback-good',
    warn: 'border-feedback-warn text-feedback-warn',
    danger: 'border-feedback-danger text-feedback-danger'
  };
  
  const levelIcons = {
    good: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warn: (
      <img src={warningIcon} alt="Warning" className="w-6 h-6" />
    ),
    danger: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };
  
  return (
    <Card className={`border-2 ${levelColors[level]}`}>
      <div className="flex items-center gap-md" role="status">
        <div className="flex-shrink-0">
          {levelIcons[level]}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-text-default">
            {message}
          </p>
          {sub && (
            <p className="text-sm text-text-muted mt-xs">
              {sub}
            </p>
          )}
        </div>
        {showShareButton && (
          <div className="flex-shrink-0 ml-md">
            <ShareButton />
          </div>
        )}
      </div>
    </Card>
  );
};