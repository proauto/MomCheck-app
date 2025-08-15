import React, { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, className = '', style }) => {
  return (
    <div 
      className={`bg-bg-panel rounded-xl shadow-md p-lg ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};