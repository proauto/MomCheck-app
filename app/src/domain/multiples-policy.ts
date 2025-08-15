/**
 * 다태아 임신 체중 증가 정책
 * 
 * Source: Institute of Medicine (IOM) and National Research Council.
 * Weight Gain During Pregnancy: Reexamining the Guidelines. Washington, DC: The National Academies Press; 2009. doi:10.17226/12584
 * Twin (2 fetuses) ranges are provisional recommendations from the above source.
 * Triplet/Quadruplet ranges: No established international guideline → disabled by default.
 * 
 * 정책 출처:
 * - Singleton: IOM 2009 — 1분기 + 2–3분기 BMI별 주당 증가율
 * - Twin: IOM 2009("provisional") 총 증가치 범위(임신 전 BMI별)
 *   * Normal(18.5–24.9): 16.8–24.5 kg
 *   * Overweight(25–29.9): 14.1–22.7 kg  
 *   * Obese(≥30): 11.5–19.1 kg
 *   * Underweight(<18.5): 공식 범위 부재 → 현재 미지원(정책 주입 필요)
 * - Triplet/Quad: 공인 범위 부재 → 정책 파일로만 허용
 */

export type FetusCount = 1 | 2 | 3 | 4;

export interface TwinTotals { 
  min: number; 
  max: number; 
} // at term total gain (kg)

export interface MultiplesPolicy {
  singleton: {
    q1: { min: number; mid: number; max: number }; // 0.5/1.25/2.0
    rates: { // kg/week for 14w+
      U: { min: number; mid: number; max: number };
      N: { min: number; mid: number; max: number };
      OW: { min: number; mid: number; max: number };
      OB: { min: number; mid: number; max: number };
    }
  };
  twin: { // totals at term (>=37w) by BMI (provisional IOM)
    N: TwinTotals;  // 16.8–24.5
    OW: TwinTotals; // 14.1–22.7
    OB: TwinTotals; // 11.5–19.1
    // U는 공식 부재 → undefined 로 두고 에러 처리
    U?: TwinTotals;
    q1: { min: number; mid: number; max: number }; // 1분기 가정(싱글톤과 동일 가정: 0.5/1.25/2.0)
    termWeek: number; // 37
    q1EndWeek: number; // 13
  };
  // triplet/quad는 외부 정책 주입으로만 허용 (기본 undefined)
  triplet?: {
    N?: TwinTotals;
    OW?: TwinTotals;
    OB?: TwinTotals;
    U?: TwinTotals;
    q1: { min: number; mid: number; max: number };
    termWeek: number;
    q1EndWeek: number;
  };
  quadruplet?: {
    N?: TwinTotals;
    OW?: TwinTotals;
    OB?: TwinTotals;
    U?: TwinTotals;
    q1: { min: number; mid: number; max: number };
    termWeek: number;
    q1EndWeek: number;
  };
}

export const defaultPolicy: MultiplesPolicy = {
  singleton: {
    q1: { min: 0.5, mid: 1.25, max: 2.0 },
    rates: {
      U:  { min: 0.44, mid: 0.51, max: 0.58 },
      N:  { min: 0.35, mid: 0.43, max: 0.50 },
      OW: { min: 0.23, mid: 0.28, max: 0.33 },
      OB: { min: 0.17, mid: 0.22, max: 0.27 }
    }
  },
  twin: {
    N:  { min: 16.8, max: 24.5 },
    OW: { min: 14.1, max: 22.7 },
    OB: { min: 11.5, max: 19.1 },
    U:  { min: 18.0, max: 27.0 }, // 임시: Normal 범위보다 약간 높게 설정
    q1: { min: 0.5, mid: 1.25, max: 2.0 },
    termWeek: 37,
    q1EndWeek: 13
  }
  // triplet/quadruplet: undefined (주입 필요)
};

// 공통 헬퍼 함수들
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(min: number, max: number, t: number): number {
  return min + (max - min) * clamp(t, 0, 1);
}