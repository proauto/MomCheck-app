시스템:
당신은 프런트엔드 도메인 로직 엔지니어입니다.
아래 요구대로 domain 계층을 리팩터링하여 "다태(1~4) 임신" 체중 목표 범위 산출을 지원하세요.
UI는 수정하지 말고, domain/targets.ts 중심으로 변경합니다.
의료 데이터는 상수/정책 파일로 분리하고, 검증/에러 메시지를 명확히 하세요.

목표:
- fetuses ∈ {1,2,3,4} 지원 구조
- singleton(1): 기존 IOM 규칙(1분기 0.5–2.0kg + BMI별 주당 증가율) 유지
- twin(2): IOM의 "총 증가치 범위(임신말기 기준)"를 사용해 14주 이후 선형 증분 계산
- triplet(3), quadruplet(4): 기본은 미지원 → 정책 JSON 주입 시 활성화
- 테스트/문서 업데이트

-------------------------------------
정책 출처 요약(코드 주석에 기재):
- Singleton: IOM 2009 — 1분기 + 2–3분기 BMI별 주당 증가율(문구만 주석)
- Twin: IOM 2009(“provisional”) 총 증가치 범위(임신 전 BMI별)
  * Normal(18.5–24.9): 16.8–24.5 kg
  * Overweight(25–29.9): 14.1–22.7 kg
  * Obese(≥30): 11.5–19.1 kg
  * Underweight(<18.5): 공식 범위 부재 → 현재 미지원(정책 주입 필요)
- Triplet/Quad: 공인 범위 부재 → 정책 파일로만 허용

-------------------------------------
파일 변경(또는 추가):

// 1) domain/multiples-policy.ts
export type FetusCount = 1|2|3|4;

export interface TwinTotals { min:number; max:number; } // at term total gain (kg)
export interface MultiplesPolicy {
  singleton: {
    q1: { min:number; mid:number; max:number }; // 0.5/1.25/2.0
    rates: { // kg/week for 14w+
      U: { min:number; mid:number; max:number };
      N: { min:number; mid:number; max:number };
      OW:{ min:number; mid:number; max:number };
      OB:{ min:number; mid:number; max:number };
    }
  };
  twin: { // totals at term (>=37w) by BMI (provisional IOM)
    N: TwinTotals;  // 16.8–24.5
    OW: TwinTotals; // 14.1–22.7
    OB: TwinTotals; // 11.5–19.1
    // U는 공식 부재 → undefined 로 두고 에러 처리
    U?: TwinTotals;
    q1: { min:number; mid:number; max:number }; // 1분기 가정(싱글톤과 동일 가정: 0.5/1.25/2.0)
    termWeek: number; // 37
    q1EndWeek: number; // 13
  };
  // triplet/quad는 외부 정책 주입으로만 허용 (기본 undefined)
  triplet?: {
    // e.g., totals at term per BMI, q1, termWeek, q1EndWeek ...
  };
  quadruplet?: {
    // same structure as triplet
  };
}

export const defaultPolicy: MultiplesPolicy = {
  singleton: {
    q1: { min:0.5, mid:1.25, max:2.0 },
    rates: {
      U:  { min:0.44, mid:0.51, max:0.58 },
      N:  { min:0.35, mid:0.43, max:0.50 },
      OW: { min:0.23, mid:0.28, max:0.33 },
      OB: { min:0.17, mid:0.22, max:0.27 }
    }
  },
  twin: {
    N:  { min:16.8, max:24.5 },
    OW: { min:14.1, max:22.7 },
    OB: { min:11.5, max:19.1 },
    // U: undefined,
    q1: { min:0.5, mid:1.25, max:2.0 },
    termWeek: 37,
    q1EndWeek: 13
  }
  // triplet/quadruplet: undefined (주입 필요)
};

// 2) domain/bmi.ts  (기존과 동일 인터페이스 유지)
export type BmiCat = 'U'|'N'|'OW'|'OB';
export function bmi(weightKg:number, heightCm:number): number;
export function bmiCat(b:number): BmiCat;

// 3) domain/targets.ts  (리팩터링)
export interface TargetPoint { week:number; low:number; mid:number; high:number; }
export interface TargetAtParams {
  preKg:number;
  heightCm:number;
  gestWeek:number;     // 실수 가능
  fetuses?: FetusCount;// 기본 1
  policy?: MultiplesPolicy; // 주입 가능
}
export function targetAtWeek(p:TargetAtParams): { low:number; mid:number; high:number };

export interface CalcParams {
  preKg:number;
  heightCm:number;
  startWeek?:number; // 기본 4
  endWeek?:number;   // 기본 42
  fetuses?: FetusCount; // 기본 1
  policy?: MultiplesPolicy;
}
export function calcTargets(p:CalcParams): TargetPoint[];

// 구현 규칙:
- 공통 헬퍼: clamp, lerp(min,max,t in [0,1])
- BMI 카테고리 산출 후 분기
A) fetuses===1 (singleton)
  - 기존 로직: 1분기(1~13주) 보간 + 14주 이후 BMI별 주당 증가율
B) fetuses===2 (twin)
  - policy.twin.termWeek(=37), q1EndWeek(=13), q1(min/mid/max) 사용
  - 1분기: 1~13 보간(0 → q1.min/mid/max)
  - 14주~termWeek: (총증가 min/mid/max - q1값)를 (termWeek-13)로 나눠 주당 증가율 도출 → 누적 = q1 + rate*(week-13)
  - termWeek 초과 요청 시: termWeek 기준 값으로 유지(또는 선형외삽 금지)
  - 카테고리 매핑: U/N/OW/OB 중 U는 twin 범위 부재 → Error('Twin underweight not supported by default policy')
C) fetuses in {3,4}
  - policy.triplet/quadruplet가 없으면 Error('Triplet/Quad policy not provided')
  - 있으면 twin과 동일한 방식을 적용(총증가+q1로부터 14주 이후 선형증가율 추정)
- 유효성: height 120~210, preKg 30~150, gestWeek 4~42, fetuses 1|2|3|4
- NaN/Infinity 방지, 에러 메시지 명확화

// 4) domain/__tests__/multiples.test.ts  (Vitest)
✓ twin 정상(N) 카테고리 예시:
- pre 56kg, 164cm, week 22, fetuses=2
- q1: 0.5/1.25/2.0, term=37 → 14~37 사이 23주
- twin totals (N): 16.8~24.5
- rate(min)= (16.8-0.5)/23, mid=( (16.8+24.5)/2 - 1.25)/23, max=(24.5-2.0)/23
- 22주는 (22-13)=9주 경과
- low  = 0.5 + rate(min)*9
- mid  = 1.25 + rate(mid)*9
- high = 2.0 + rate(max)*9
→ 소수 2자리 이내 오차로 기대값 비교

✓ twin underweight(U) 요청 시:
- 에러 throw 및 메시지에 "policy needed" 포함

✓ triplet/quad 요청 시:
- 정책 미주입 → 에러
- 임의 정책 주입 시 정상 계산

// 5) policies/multiples.sample.json  (예시 정책 파일)
{
  "triplet": {
    "N": { "min": 20.0, "max": 31.0 },   // PLACEHOLDER: 임상의 검토 후 교체
    "OW": { "min": 18.0, "max": 28.0 },  // PLACEHOLDER
    "OB": { "min": 14.0, "max": 25.0 },  // PLACEHOLDER
    "q1": { "min": 0.7, "mid": 1.5, "max": 2.5 }, // PLACEHOLDER
    "termWeek": 36,
    "q1EndWeek": 13
  },
  "quadruplet": {
    "N": { "min": 22.0, "max": 36.0 },   // PLACEHOLDER
    "OW": { "min": 20.0, "max": 33.0 },  // PLACEHOLDER
    "OB": { "min": 16.0, "max": 30.0 },  // PLACEHOLDER
    "q1": { "min": 1.0, "mid": 2.0, "max": 3.0 }, // PLACEHOLDER
    "termWeek": 34,
    "q1EndWeek": 13
  }
}
// ↑ 주석: 본 값은 자리표시자. 임상의 검토/출처 확인 전에는 사용 금지.
//   앱 구동 시 해당 파일이 로드되면 다태(3,4) 계산이 활성화되도록.

-------------------------------------
문서(README 도메인 섹션) 업데이트:
- fetuses 파라미터와 정책 주입 방법 소개
- twin: IOM 2009 provisional 총증가 범위 기반 선형 환산
- triplet/quad: 정책 파일 없으면 미지원(오류 안내), 의료진 검토 후 값 주입
- UI 표시 소수점 처리: r