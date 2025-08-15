import React from 'react';
import {
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart
} from 'recharts';
import { Card } from '../layout/Card';

interface WeightProgressChartProps {
  series: { week: number; actual?: number }[];
  targets: { week: number; low: number; mid: number; high: number }[];
  currentWeek: number;
  preWeight: number;
  currentWeight: number;
}

export const WeightProgressChart: React.FC<WeightProgressChartProps> = ({
  series,
  targets,
  currentWeek,
  preWeight,
  currentWeight
}) => {
  // Y축 범위 계산: 임신전체중 ~ max(40주 최대체중, 현재체중)
  const week40Target = targets.find(t => t.week === 40);
  const maxWeight40 = week40Target ? week40Target.high : preWeight + 20;
  const yAxisMax = Math.max(maxWeight40, currentWeight) + 2;
  const yAxisMin = preWeight - 1; // 임신 전 체중에서 시작
  
  console.log('Y축 범위:', { yAxisMin, yAxisMax, preWeight, currentWeight, maxWeight40 });
  
  const chartData = targets.map(target => {
    const actualData = series.find(s => s.week === target.week);
    return {
      week: target.week,
      actual: actualData?.actual,
      low: target.low,
      high: target.high,
      mid: target.mid
    };
  });
  
  // 모든 데이터 포인트에 Y축 범위 강제 적용
  const data = chartData.map(item => ({
    ...item,
    // Area 차트가 0에서 시작하지 않도록 강제 조정
    low: Math.max(item.low, yAxisMin),
    baseWeight: yAxisMin // 기준선
  }));
  
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any; label?: any }) => {
    if (active && payload && payload.length) {
      const actualWeight = payload.find((p: any) => p.dataKey === 'actual')?.value;
      const lowWeight = payload.find((p: any) => p.dataKey === 'low')?.value;
      const highWeight = payload.find((p: any) => p.dataKey === 'high')?.value;
      
      return (
        <div 
          className="sm:w-56 sm:h-30 w-28 h-20"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #000000',
            borderRadius: '8px',
            padding: '8px',
            fontFamily: 'Noto Sans KR',
            fontSize: '12px',
            lineHeight: '1.4',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
          role="dialog"
          aria-live="polite"
        >
          <p style={{ fontWeight: '500', marginBottom: '4px', margin: '0 0 4px 0' }}>
            {label}Weeks
          </p>
          <p style={{ fontWeight: '400', marginBottom: '2px', margin: '0 0 2px 0' }}>
            추천 체중범위
          </p>
          <p style={{ fontWeight: '400', marginBottom: '2px', margin: '0 0 2px 0' }}>
            {lowWeight?.toFixed(1)}~{highWeight?.toFixed(1)}kg
          </p>
          {actualWeight && (
            <p style={{ fontWeight: '400', margin: '0' }}>
              내 체중 : {actualWeight.toFixed(1)}kg
            </p>
          )}
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card style={{ outline: 'none', paddingLeft: '7.5px' }}>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }} style={{ outline: 'none' }}>
          <XAxis 
            dataKey="week" 
            stroke="#9C8EAA"
            axisLine={false}
            tickLine={false}
            ticks={[1, 5, 10, 15, 20, 25, 30, 35, 40]}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="#9C8EAA"
            domain={[yAxisMin, yAxisMax]}
            type="number"
            tick={{ fontSize: 12 }}
            tickCount={8}
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            content={<CustomTooltip />}
            animationDuration={0}
            isAnimationActive={false}
            cursor={false}
          />
          
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#B4B4FF" stopOpacity={1} />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity={1} />
            </linearGradient>
          </defs>
          
          <Area
            type="monotone"
            dataKey="high"
            stroke="#3534A7"
            strokeWidth={2}
            fill="url(#areaGradient)"
          />
          <Area
            type="monotone"
            dataKey="low"
            stroke="#3534A7"
            strokeWidth={2}
            fill="white"
            fillOpacity={1}
          />
          
          <CartesianGrid 
            strokeDasharray="0" 
            stroke="#C9C9C9" 
            strokeWidth={0.5}
            strokeOpacity={0.7}
            horizontal={true}
            vertical={false}
          />
          
          <Line
            type="monotone"
            dataKey="actual"
            stroke="transparent"
            strokeWidth={0}
            activeDot={false}
            dot={(props) => {
              const { cx, cy, payload } = props;
              // 현재 주차에만 마커 표시
              if (payload?.week === currentWeek && payload?.actual !== undefined) {
                return (
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={6} 
                    fill="#5B3BFF" 
                    stroke="transparent" 
                    strokeWidth={0}
                  />
                );
              }
              return <g />; // null 대신 빈 SVG 그룹 반환
            }}
            connectNulls={false}
            aria-label="실제 체중 변화"
          />
          
          <ReferenceLine 
            x={currentWeek} 
            stroke="#3534A7" 
            strokeWidth={1.5}
            strokeDasharray="5 5"
          />
          
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
};