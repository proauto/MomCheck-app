/**
 * 다태아 임신 체중 증가 계산 테스트
 * 
 * 테스트 시나리오:
 * - Twin 정상(N) 카테고리 예시
 * - Twin underweight(U) 요청 시 에러
 * - Triplet/quad 요청 시 정책 미주입 에러
 * - Triplet/quad 정책 주입 시 정상 계산
 */

import { describe, it, expect } from 'vitest';
import { targetAtWeek, calcTargets } from '../targets';
import { defaultPolicy, type MultiplesPolicy } from '../multiples-policy';

describe('다태아 임신 체중 증가 계산', () => {
  describe('Twin 정상(N) 카테고리', () => {
    it('22주차 twin 임산부 체중 목표 계산', () => {
      // pre 56kg, 164cm, week 22, fetuses=2
      const result = targetAtWeek({
        preKg: 56,
        heightCm: 164,
        gestWeek: 22,
        fetuses: 2
      });
      
      // q1: 0.5/1.25/2.0, term=37 → 14~37 사이 24주 (37-13=24)
      // twin totals (N): 16.8~24.5
      // rate(min)= (16.8-0.5)/24 = 0.679, mid=((16.8+24.5)/2 - 1.25)/24 = 0.625, max=(24.5-2.0)/24 = 0.9375
      // 22주는 (22-13)=9주 경과
      // low  = 56 + 0.5 + 0.679*9 ≈ 62.6
      // mid  = 56 + 1.25 + 0.625*9 ≈ 62.9
      // high = 56 + 2.0 + 0.9375*9 ≈ 66.4
      
      expect(result.low).toBeCloseTo(62.6, 0);
      expect(result.mid).toBeCloseTo(64.5, 0);
      expect(result.high).toBeCloseTo(66.4, 0);
    });

    it('13주차 twin 임산부 1분기 계산', () => {
      const result = targetAtWeek({
        preKg: 56,
        heightCm: 164,
        gestWeek: 13,
        fetuses: 2
      });
      
      // 1분기 끝: progress = (13-1)/13 = 12/13 ≈ 0.923
      // low = 56 + 0.5 * 0.923 ≈ 56.46
      // mid = 56 + 1.25 * 0.923 ≈ 57.15
      // high = 56 + 2.0 * 0.923 ≈ 57.85
      expect(result.low).toBeCloseTo(56.46, 1);
      expect(result.mid).toBeCloseTo(57.15, 1);
      expect(result.high).toBeCloseTo(57.85, 1);
    });

    it('37주차 twin 임산부 만삭 계산', () => {
      const result = targetAtWeek({
        preKg: 56,
        heightCm: 164,
        gestWeek: 37,
        fetuses: 2
      });
      
      // 만삭 시 총 증가량
      expect(result.low).toBeCloseTo(56 + 16.8, 1);
      expect(result.mid).toBeCloseTo(56 + 20.65, 1); // (16.8+24.5)/2
      expect(result.high).toBeCloseTo(56 + 24.5, 1);
    });

    it('40주차 twin 임산부 만삭 이후 계산', () => {
      const result = targetAtWeek({
        preKg: 56,
        heightCm: 164,
        gestWeek: 40,
        fetuses: 2
      });
      
      // 만삭 이후는 만삭 값 유지
      expect(result.low).toBeCloseTo(56 + 16.8, 1);
      expect(result.mid).toBeCloseTo(56 + 20.65, 1);
      expect(result.high).toBeCloseTo(56 + 24.5, 1);
    });
  });

  describe('Twin underweight(U) 에러 처리', () => {
    it('underweight twin 요청 시 에러 발생', () => {
      expect(() => {
        targetAtWeek({
          preKg: 45, // BMI < 18.5
          heightCm: 170,
          gestWeek: 22,
          fetuses: 2
        });
      }).toThrow('Twin underweight not supported by default policy');
    });
  });

  describe('Triplet/Quadruplet 정책 미주입 에러', () => {
    it('triplet 요청 시 정책 미주입 에러', () => {
      expect(() => {
        targetAtWeek({
          preKg: 60,
          heightCm: 165,
          gestWeek: 22,
          fetuses: 3
        });
      }).toThrow('Triplet policy not provided');
    });

    it('quadruplet 요청 시 정책 미주입 에러', () => {
      expect(() => {
        targetAtWeek({
          preKg: 60,
          heightCm: 165,
          gestWeek: 22,
          fetuses: 4
        });
      }).toThrow('Quadruplet policy not provided');
    });
  });

  describe('Triplet/Quadruplet 정책 주입 시 정상 계산', () => {
    const customPolicy: MultiplesPolicy = {
      ...defaultPolicy,
      triplet: {
        N: { min: 20.0, max: 31.0 },
        OW: { min: 18.0, max: 28.0 },
        OB: { min: 14.0, max: 25.0 },
        q1: { min: 0.7, mid: 1.5, max: 2.5 },
        termWeek: 36,
        q1EndWeek: 13
      },
      quadruplet: {
        N: { min: 22.0, max: 36.0 },
        OW: { min: 20.0, max: 33.0 },
        OB: { min: 16.0, max: 30.0 },
        q1: { min: 1.0, mid: 2.0, max: 3.0 },
        termWeek: 34,
        q1EndWeek: 13
      }
    };

    it('triplet 정상(N) 카테고리 계산', () => {
      const result = targetAtWeek({
        preKg: 60,
        heightCm: 165,
        gestWeek: 25,
        fetuses: 3,
        policy: customPolicy
      });
      
      // 25주는 (25-13)=12주 경과, termWeek=36이므로 23주 총 기간
      // rate(mid) = ((20.0+31.0)/2 - 1.5)/23 = 24.0/23 ≈ 1.043
      // mid = 60 + 1.5 + 1.043*12 ≈ 74.0
      
      expect(result.mid).toBeCloseTo(74.0, 0);
    });

    it('quadruplet 정상(N) 카테고리 계산', () => {
      const result = targetAtWeek({
        preKg: 60,
        heightCm: 165,
        gestWeek: 25,
        fetuses: 4,
        policy: customPolicy
      });
      
      // 25주는 (25-13)=12주 경과, termWeek=34이므로 21주 총 기간
      // rate(mid) = ((22.0+36.0)/2 - 2.0)/21 = 27.0/21 ≈ 1.286
      // mid = 60 + 2.0 + 1.286*12 ≈ 77.4
      
      expect(result.mid).toBeCloseTo(77.4, 0);
    });
  });

  describe('Singleton 기존 로직 유지', () => {
    it('singleton 정상(N) 카테고리 계산', () => {
      const result = targetAtWeek({
        preKg: 60,
        heightCm: 165,
        gestWeek: 22,
        fetuses: 1
      });
      
      // 22주는 (22-13)=9주 경과
      // mid = 60 + 1.25 + 0.43*9 ≈ 65.12
      
      expect(result.mid).toBeCloseTo(65.1, 1);
    });
  });

  describe('calcTargets 함수 테스트', () => {
    it('twin 전체 주차 계산', () => {
      const targets = calcTargets({
        preKg: 56,
        heightCm: 164,
        startWeek: 4,
        endWeek: 20,
        fetuses: 2
      });
      
      expect(targets).toHaveLength(17); // 4~20주
      expect(targets[0].week).toBe(4);
      expect(targets[16].week).toBe(20);
      
      // 첫째 주차는 거의 preKg
      expect(targets[0].mid).toBeCloseTo(56, 0);
      
      // 마지막 주차는 증가
      expect(targets[16].mid).toBeGreaterThan(58);
    });
  });

  describe('유효성 검증', () => {
    it('잘못된 키 범위 에러', () => {
      expect(() => {
        targetAtWeek({
          preKg: 60,
          heightCm: 100, // 너무 작음
          gestWeek: 22,
          fetuses: 1
        });
      }).toThrow('Height must be between 120-210cm');
    });

    it('잘못된 체중 범위 에러', () => {
      expect(() => {
        targetAtWeek({
          preKg: 20, // 너무 작음
          heightCm: 165,
          gestWeek: 22,
          fetuses: 1
        });
      }).toThrow('Pre-pregnancy weight must be between 30-150kg');
    });

    it('잘못된 임신 주차 에러', () => {
      expect(() => {
        targetAtWeek({
          preKg: 60,
          heightCm: 165,
          gestWeek: 50, // 너무 큼
          fetuses: 1
        });
      }).toThrow('Gestational week must be between 1-40');
    });

    it('잘못된 태아 수 에러', () => {
      expect(() => {
        targetAtWeek({
          preKg: 60,
          heightCm: 165,
          gestWeek: 22,
          fetuses: 5 as any // 지원하지 않음
        });
      }).toThrow('Fetuses count must be 1, 2, 3, or 4');
    });
  });
});