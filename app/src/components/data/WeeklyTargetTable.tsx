import React from 'react';
import { Card } from '../layout/Card';

interface TableRow {
  week: number;
  now: number;
  min: number;
  max: number;
  weekly: number;
}

interface WeeklyTargetTableProps {
  rows: TableRow[];
  currentWeek: number;
  currentWeight: number;
  preWeight: number;
  expanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
}

export const WeeklyTargetTable: React.FC<WeeklyTargetTableProps> = ({ 
  rows, 
  currentWeek,
  currentWeight: _currentWeight,
  preWeight,
  expanded = false,
  onExpandChange
}) => {
  const displayRows = expanded ? rows : rows.slice(0, 11);
  
  // 11주차까지 보이도록 높이 계산 (헤더 40px + 11행 374px + 더보기 버튼 64px + 카드 패딩 32px)
  const baseHeight = expanded ? 'auto' : '510px';
  
  return (
    <Card className="!p-0" style={{ height: baseHeight, display: 'flex', flexDirection: 'column' }}>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm border-separate border-spacing-0">
          <colgroup>
            <col className="w-1/5" />
            <col className="w-1/5" />
            <col className="w-1/5" />
            <col className="w-1/5" />
            <col className="w-1/5" />
          </colgroup>
          <thead>
            <tr style={{ backgroundColor: '#E5DCDF' }}>
              <th className="text-center py-sm px-xs text-text-default font-medium" style={{ 
                borderRight: '1px solid #C9C9C9', 
                borderBottom: '1px solid #C9C9C9',
                borderTopLeftRadius: '16px'
              }}>
                주차
              </th>
              <th className="text-center py-sm px-xs text-text-default font-medium" style={{ 
                borderRight: '1px solid #C9C9C9', 
                borderBottom: '1px solid #C9C9C9' 
              }}>
                체중(예상)
              </th>
              <th className="text-center py-sm px-xs text-text-default font-medium" style={{ 
                borderRight: '1px solid #C9C9C9', 
                borderBottom: '1px solid #C9C9C9' 
              }}>
                최소 체중
              </th>
              <th className="text-center py-sm px-xs text-text-default font-medium" style={{ 
                borderRight: '1px solid #C9C9C9', 
                borderBottom: '1px solid #C9C9C9' 
              }}>
                최대 체중
              </th>
              <th className="text-center py-sm px-xs text-text-default font-medium" style={{ 
                borderBottom: '1px solid #C9C9C9',
                borderTopRightRadius: '16px'
              }}>
                총 증가량(예상)
              </th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, index) => {
              const showBottomBorder = row.week % 5 === 0 || index === displayRows.length - 1;
              // 현재 총 증가량 = 해당 주차의 현재 체중(예상) - 임신 전 체중
              const totalWeightGain = row.now - preWeight;
              
              return (
                <tr 
                  key={row.week}
                  className={row.week === currentWeek ? 'bg-brand-50' : ''}
                >
                  <td className="text-center py-sm px-xs font-medium text-text-default" style={{ 
                    borderRight: '1px solid #C9C9C9',
                    borderBottom: showBottomBorder ? '1px solid #C9C9C9' : 'none'
                  }}>
                    {row.week}
                  </td>
                  <td className="text-center py-sm px-xs text-text-default" style={{ 
                    borderRight: '1px solid #C9C9C9',
                    borderBottom: showBottomBorder ? '1px solid #C9C9C9' : 'none'
                  }}>
                    {row.now.toFixed(1)}
                  </td>
                  <td className="text-center py-sm px-xs text-text-muted" style={{ 
                    borderRight: '1px solid #C9C9C9',
                    borderBottom: showBottomBorder ? '1px solid #C9C9C9' : 'none'
                  }}>
                    {row.min.toFixed(1)}
                  </td>
                  <td className="text-center py-sm px-xs text-text-muted" style={{ 
                    borderRight: '1px solid #C9C9C9',
                    borderBottom: showBottomBorder ? '1px solid #C9C9C9' : 'none'
                  }}>
                    {row.max.toFixed(1)}
                  </td>
                  <td className="text-center py-sm px-xs text-text-muted" style={{
                    borderBottom: showBottomBorder ? '1px solid #C9C9C9' : 'none'
                  }}>
                    {totalWeightGain > 0 ? `+${totalWeightGain.toFixed(1)}` : totalWeightGain.toFixed(1)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {rows.length > 11 && (
        <div style={{ padding: '16px' }}>
          <button
            onClick={() => onExpandChange?.(!expanded)}
            className="w-full px-lg py-sm border border-brand-500 text-brand-500 rounded-pill 
              hover:bg-brand-50 transition-colors text-sm font-medium"
          >
            {expanded ? '접기' : '더보기'}
          </button>
        </div>
      )}
    </Card>
  );
};