export interface DistItem {
  label: string;
  kg: number;
  pct: number;
}

export function estimateDistribution(totalGainKg: number): DistItem[] {
  const distributions = [
    { label: '태아', pct: 0.27 },
    { label: '태반', pct: 0.05 },
    { label: '양수', pct: 0.06 },
    { label: '자궁', pct: 0.08 },
    { label: '모체 혈액', pct: 0.12 },
    { label: '모체 지방', pct: 0.30 },
    { label: '기타', pct: 0.12 }
  ];
  
  return distributions.map(item => ({
    label: item.label,
    kg: Math.round(totalGainKg * item.pct * 10) / 10,
    pct: Math.round(item.pct * 100)
  }));
}