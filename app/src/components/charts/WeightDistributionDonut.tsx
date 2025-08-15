import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { Card } from '../layout/Card';

interface WeightDistributionDonutProps {
  totalGainKg: number;
  week: number;
}

export const WeightDistributionDonut: React.FC<WeightDistributionDonutProps> = React.memo(({
  totalGainKg
}) => {
  const distributions = useMemo(() => [
    { name: '태아', value: totalGainKg * 0.27, color: '#6968FB' },
    { name: '태반', value: totalGainKg * 0.05, color: '#CBCBFF' },
    { name: '양수', value: totalGainKg * 0.06, color: '#B8B8FF' },
    { name: '자궁', value: totalGainKg * 0.08, color: '#9E9EFF' },
    { name: '모체 혈액', value: totalGainKg * 0.12, color: '#5453E0' },
    { name: '모체 지방', value: totalGainKg * 0.30, color: '#3534A7' },
    { name: '기타', value: totalGainKg * 0.12, color: '#8584FB' }
  ], [totalGainKg]);
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / totalGainKg) * 100).toFixed(0);
      
      return (
        <div 
          className="sm:w-36 sm:h-30 w-20 h-20"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #000000',
            borderRadius: '8px',
            padding: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            fontFamily: 'Noto Sans KR',
            fontSize: '12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div 
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: data.payload.color
              }}
            />
            <span style={{ fontWeight: '500' }}>{data.name}</span>
          </div>
          <div style={{ fontWeight: '400' }}>
            {data.value.toFixed(1)}kg
          </div>
          <div style={{ fontWeight: '400' }}>
            약{percentage}%
          </div>
        </div>
      );
    }
    return null;
  };
  
  const renderCustomizedLabel = ({ cx, cy }: any) => {
    const sign = totalGainKg >= 0 ? '+' : '';
    return (
      <text 
        x={cx} 
        y={cy} 
        fill="#1E1B1C" 
        textAnchor="middle" 
        dominantBaseline="middle"
        className="font-semibold"
      >
        <tspan x={cx} dy="0" fontSize="20">
          {sign}{totalGainKg.toFixed(1)}kg
        </tspan>
      </text>
    );
  };
  
  return (
    <Card className="h-full" style={{ height: '510px', display: 'flex', flexDirection: 'column', justifyContent: 'center', outline: 'none' }}>
      <div className="sm:-mt-5 -mt-8" style={{ outline: 'none' }}>
        <ResponsiveContainer width="100%" height={350}>
        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }} style={{ outline: 'none' }}>
          <Pie
            data={distributions}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius="60%"
            innerRadius="30%"
            fill="#8884d8"
            dataKey="value"
            animationBegin={0}
            animationDuration={0}
            isAnimationActive={false}
            style={{ outline: 'none' }}
            onClick={() => {}}
            onFocus={() => {}}
          >
            {distributions.map((entry) => (
              <Cell key={entry.name} fill={entry.color} stroke="none" strokeWidth={0} style={{ outline: 'none' }} />
            ))}
          </Pie>
          <Tooltip 
            content={<CustomTooltip />}
            animationDuration={0}
            isAnimationActive={false}
          />
        </PieChart>
        </ResponsiveContainer>
        
        <div className="-mt-12" style={{ display: 'flex', justifyContent: 'center' }}>
        <ul className="grid grid-cols-2 gap-sm text-sm" style={{ width: '420px' }}>
          {distributions.map((item, index) => (
            <li key={`legend-${index}-${item.name}`} className="flex items-center gap-xs" style={{ width: '200px' }}>
              <span 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              <span 
                className="sm:text-base text-xs"
                style={{ 
                  fontFamily: 'Noto Sans KR',
                  fontWeight: '400',
                  color: '#000000'
                }}
              >
                {item.name}({item.value.toFixed(1)}kg) &gt; 약 {((item.value / totalGainKg) * 100).toFixed(0)}%
              </span>
            </li>
          ))}
        </ul>
        </div>
      </div>
    </Card>
  );
});