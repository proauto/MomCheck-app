import React from 'react';
import { Card } from '../layout/Card';

interface GuidanceCardProps {
  items: string[];
}

export const GuidanceCard: React.FC<GuidanceCardProps> = ({ items }) => {
  return (
    <Card>
      <h3 
        style={{ 
          fontFamily: 'Noto Sans KR',
          fontWeight: '700',
          fontSize: '16px',
          color: '#938288',
          marginBottom: '16px',
          paddingLeft: '7.5px'
        }}
      >
        안내 및 주의사항
      </h3>
      <ul className="space-y-sm" style={{ paddingLeft: '7.5px' }}>
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-sm">
            <span 
              className="w-1 h-1 rounded-full mt-2 flex-shrink-0"
              style={{ backgroundColor: '#938288' }}
              aria-hidden="true"
            />
            <span 
              style={{ 
                fontFamily: 'Noto Sans KR',
                fontWeight: '400',
                fontSize: '16px',
                lineHeight: '1.6',
                color: '#938288'
              }}
            >
              {item}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
};