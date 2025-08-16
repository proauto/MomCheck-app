시스템:
당신은 프론트엔드 리드입니다. React + TypeScript + Vite + Tailwind + Recharts로 반응형 웹앱을 구현하세요.
UI는 제공된 #SPEC을 따르고, 모든 색/간격/라운드는 아래 design-tokens-lite.json 값만 사용합니다(임의 hex/px 금지).
접근성(키보드, 스크린리더, 대비) 필수, Storybook/간단 RTL 테스트 포함.

[design-tokens-lite.json]
{
"color": {
"brand": {
"50": "#FCE5F0",
"500": "#F4468F",
"600": "#D53C7D",
"gradientStart": "#F4468F",
"gradientEnd": "#8743FF"
},
"text": {
"default": "#1E1B1C",
"muted": "#8C7F86",
"onBrand": "#FFFFFF"
},
"bg": {
"page": "#F7F0EC",
"panel": "#FFFFFF",
"field": "#F6EFEB",
"subtle": "#EFE6E0"
},
"border": {
"subtle": "#E6DAD2",
"strong": "#CDBCB1"
},
"chart": {
"rangeFill": "#C9B8FF",
"rangeStroke": "#A78BFA",
"actual": "#5B3BFF",
"axis": "#9C8EAA"
},
"feedback": {
"good": "#23A26D",
"warn": "#E6A700",
"danger": "#E45858"
}
},
"radius": {
"sm": "6px",
"md": "10px",
"lg": "16px",
"xl": "24px",
"pill": "999px"
},
"spacing": {
"xs": "4px",
"sm": "8px",
"md": "12px",
"lg": "16px",
"xl": "24px",
"2xl": "32px"
},
"shadow": {
"sm": "0 1px 2px rgba(0,0,0,0.06)",
"md": "0 4px 8px rgba(0,0,0,0.08)"
},
"font": {
"body": "Noto Sans",
"heading": "Noto Sans"
}
}

[#SPEC]

공통 레이아웃

Page

component: Page
purpose: 반응형 컨테이너
props: { title?:string, children:ReactNode }
tokens: bg.page, spacing.2xl, radius.lg
responsive:

sm: p-4, max-w-[420px] 중앙정렬

lg: p-10, max-w-[1200px]
a11y:

main landmark 사용

TopBar

component: TopBar
purpose: 좌상단 로고+타이틀, 우상단 내비게이션 링크(“체중 관리”, “블로그”)
props: { logoSrc:string, title:string }
tokens: bg.page, text.default
states: sticky 상단 고정
a11y: role="banner"

BottomNav (모바일)

component: BottomNav
purpose: 모바일 하단 탭(홈/마이)
props: { active:"home"|"my" }
a11y: role="navigation", aria-current 적용

Card (유틸)

component: Card
purpose: 공통 카드 컨테이너
props: { children:ReactNode }
tokens: bg.panel, radius.xl, shadow.md, spacing.lg

폼/버튼

NumberInput

component: NumberInput
purpose: 숫자 입력 + 단위 표시
props: { value?:number, suffix?:string, placeholder?:string, min?:number, max?:number, step?:number, onChange:(n|undefined)=>void }
tokens: bg.field, radius.pill, spacing.md, border.subtle
states: default, focus, invalid, disabled
a11y:

label/id 연결

suffix는 aria-hidden, 시각적만 표시

Select

component: Select
purpose: 단일 선택(예: 임신 타입)
props: { value?:string|number, options:{label:string,value:string|number}[], placeholder?:string, onChange:(v)=>void }
tokens: bg.field, radius.pill, spacing.md
states: default, focus, disabled

Button

component: Button
purpose: CTA 및 보조 액션
props: { variant:"primary"|"ghost", size:"lg"|"md", disabled?:boolean, onClick:()=>void }
tokens: brand.500(bg), text.onBrand, radius.pill, spacing.xl
states: hover(밝기+5%), active(밝기-5%), focus-visible(2px outline)
a11y: role="button"

InputPanel (firstpage_app/web)

component: InputPanel
purpose: 사용자 입력 수집(현재 임신 주차/키/현재 체중/임신 전 체중/임신 타입)
props: {
values: { week?:number; height?:number; weight?:number; preWeight?:number; type?:"singleton"|"twin" },
onChange:(partial)=>void,
onSubmit:()=>void
}
tokens: bg.panel, radius.xl, shadow.md, spacing.lg
states: disabled(필드 미입력시), focus, error
rules:

모든 필드 유효할 때만 CTA 활성화

유효성: week 442, height 120210, weight/preWeight 30~150

a11y:

숫자 input type="number"

단위 표시는 aria-hidden, 스크린리더용 aria-label 별도 제공

결과 영역

StatusCard

component: StatusCard
purpose: “좋아요! 현재 적정 범위 안에 들어있어요.” 등 핵심 메시지
props: { level:"good"|"warn"|"danger", message:string, sub?:string }
tokens: bg.panel, border.subtle, radius.lg
a11y: role="status"

WeightProgressChart (Recharts)

component: WeightProgressChart
purpose: 주차별 목표 범위(밴드) + 실제 값 표시
props: {
series: {week:number, actual?:number}[],
targets: {week:number, low:number, mid:number, high:number}[],
currentWeek:number
}
tokens: chart.rangeFill(면), chart.rangeStroke(경계), chart.actual(실측), chart.axis(축)
a11y:

각 포인트 aria-label="24주, 내 체중 60.7킬로그램"

툴팁 role="dialog" aria-live="polite"
interaction:

커서 수직 가이드라인, 포인트 hover 시 툴팁

WeightDistributionDonut (Recharts)

component: WeightDistributionDonut
purpose: 증가 체중 분포 예상(모체 지방, 혈액량, 자궁, 양수, 태반, 태아, 기타)
props: { totalGainKg:number, week:number }
tokens: chart.actual 계열 팔레트(명암) + text.muted 축/범례
a11y:

범례 텍스트 목록 제공

색상 외 구분(마커/패턴) 옵션

WeeklyTargetTable

component: WeeklyTargetTable
purpose: 주차/현재 체중(예상)/최소/최대/주당 증가량 표
props: { rows:{week:number, now:number, min:number, max:number, weekly:number}[] }
tokens: bg.panel, border.subtle, radius.lg
a11y:



모바일에서는 colgroup/요약 텍스트 제공

ExpandableTable (웹 상세)

component: ExpandableTable
purpose: 모바일/웹에서 ‘펼쳐보기’로 추가 행 노출
props: { collapsedRows:number } // 기본 10

GuidanceCard

component: GuidanceCard
purpose: 주의사항 리스트(“의학적 조언 아님” 등)
props: { items:string }
tokens: bg.panel, radius.lg

ShareButton

component: ShareButton
purpose: 현재 결과 공유
behavior:

navigator.share 지원 시 공유

미지원 시 URL 클립보드 복사

a11y: aria-label="결과 공유"

ResetButton

component: ResetButton
purpose: 입력값 초기화 및 홈으로 이동

a11y: aria-label="초기화"

페이지 조립

FirstPage.tsx

상단: 

본문 중앙: 

모든 필드 유효 시 계산하기 활성화

버튼 클릭 → navigate("/result?week=..&height=..&weight=..&preWeight=..&type=..")

ResultPage.tsx

상단: 

좌: 

우: <WeightDistributionDonut totalGainKg={weight - preWeight}/>

하단:  + (모바일) 

우상단: , 좌하단: 

상태/저장/유효성

Zustand store: form(입력값), result(targets, distribution)

유효성: week 442, height 120210, weight/preWeight 30~150, type in {singleton,twin}

저장: 마지막 입력값 localStorage (개인정보 최소)

도메인 계약 (IOM 기반)

// domain/bmi.ts
export type BmiCat = 'U'|'N'|'OW'|'OB';
export function bmi(weightKg:number, heightCm:number): number;
export function bmiCat(bmi:number): BmiCat;

// domain/gest-week.ts
export function gestWeekFromWeek(week:number): number; // LMP/EDD 계산은 v1.1로 이관

// domain/targets.ts
export interface TargetPoint { week:number; low:number; mid:number; high:number; }
export function calcTargets(params:{
preKg:number; heightCm:number; gestWeek:number; cat?:BmiCat; twin?:boolean;
}): TargetPoint[]; // 1분기 0.5–2kg, 이후 BMI별 주당 증가율(U/N/OW/OB) 누적(하/중/상)

// domain/distribution.ts
export interface DistItem { label:string; kg:number; pct:number; }
export function estimateDistribution(totalGainKg:number): DistItem[]; // 모체지방/혈액/자궁/양수/태반/태아/기타 비율 추정

라우팅/폴더/빌드 산출물

라우팅

"/" : FirstPage (firstpage_web/app 디자인 반영)

"/result" : ResultPage (resultpage_web/app + resultpage_detail_web)

폴더 구조

src/
app/
routes.tsx
store.ts
components/
layout/
Page.tsx TopBar.tsx BottomNav.tsx Card.tsx
form/
NumberInput.tsx Select.tsx InputPanel.tsx
charts/
WeightProgressChart.tsx WeightDistributionDonut.tsx
data/
WeeklyTargetTable.tsx ExpandableTable.tsx
common/
Button.tsx Badge.tsx Tooltip.tsx Icon.tsx
domain/
gest-week.ts targets.ts bmi.ts distribution.ts
styles/
tokens.css
pages/
FirstPage.tsx ResultPage.tsx
assets/
logo.svg

Tailwind 설정 지시

design-tokens-lite.json을 tailwind.config.js theme.extend에 주입(색/spacing/radius/shadow/fontFamily)

필요 시 src/styles/tokens.css에 CSS 변수 노출해 arbitrary value로 참조 가능

빌드 산출물 요구

위 폴더 구조와 라우팅 파일 생성

각 #SPEC 컴포넌트 구현 + Storybook 스토리

RTL 기반 smoke 테스트 1개 이상(마운트, 접근성 속성 존재 확인)

README.md에 실행법/토큰 교체법/접근성 체크리스트 기재

접근성 가이드(요약)

label↔input for/id 연결, 설명 텍스트는 aria-describedby

focus-visible 스타일 공통 적용(키보드 탐색 가능)

차트: 데이터 포인트에 aria-label, 범례 텍스트 제공

대비: 텍스트/배경 최소 4.5:1, 아이콘/비텍스트 3:1 이상

참고(디자인 대응)

firstpage_app / firstpage_web : 입력 패널, 비활성 CTA → 모든 값 유효 시 활성

firstpage_valueadd_app / web : 값 입력 후 CTA 활성 상태 확인

resultpage_app / web : 상단 상태 메시지, 라인차트+도넛차트, 테이블

resultpage_detail_web : ‘펼쳐보기’로 행 추가 노출

logo : src/assets/logo.svg 로 임포트

요청:

위 명세대로 src/ 전체 생성 및 구현

차트는 Recharts 기준, 색상은 tokens.color.chart.* 참조

접근성/키보드 내비/스크린리더 지원 반영

스토리북/테스트/README 포함

## 🚨 중요: Tailwind CSS 버전 고정 필수

**문제**: Tailwind CSS v4는 PostCSS 설정 변경으로 CSS가 깨짐
**해결**: 반드시 v3.4.17로 고정 사용

```bash
# 올바른 설치 방법
npm install tailwindcss@3.4.17 @tailwindcss/forms@0.5.10

# postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

# tailwind.config.js에서 @tailwindcss/forms 플러그인 사용
plugins: [
  require('@tailwindcss/forms')
]
```

**절대 하지 말 것**:
- `npm install tailwindcss@latest` (v4 설치)
- `@tailwindcss/postcss` 플러그인 사용
- Tailwind CSS v4 관련 설정

이 프로젝트는 v3.4.17에서 완벽하게 작동하도록 구성되어 있음.

## 🎯 주수별 맞춤정보 페이지 스크롤 기능 구현 완료

### 기능 요구사항
- **웹**: 주수 버튼(4~40주)을 좌우 드래그 + 화살표 버튼으로 스크롤
- **앱**: 기존 터치 스크롤 유지 (변경 없음)
- **공통**: 스크롤바 숨김 처리

### 해결한 주요 문제들

#### 1. 상위 컨테이너 스크롤 차단 이슈
**문제**: WeeklyInfoPage에서 `overflow-x-hidden`으로 수평 스크롤 완전 차단
```tsx
// 문제가 된 코드
<div className="overflow-x-hidden"> // ← 스크롤 차단
<div className="overflow-x-hidden"> // ← 이중 차단
```
**해결**: 상위 컨테이너에서 `overflow-x-hidden` 제거

#### 2. 레이아웃 구조 문제
**문제**: 이중 패딩으로 인한 화살표 위치 오류 및 스크롤 영역 축소
- 페이지 레벨: `px-lg` (16px)
- 컴포넌트 레벨: `sm:px-24` (96px) 
- **총 112px 패딩**으로 스크롤 공간 부족

**해결**: 레이아웃 전면 재설계
```tsx
// 기존 구조
<div className="sm:px-24"> // 전체 패딩
  <h2>제목</h2>
  <div>슬라이더</div>
  <div>카드들</div>
</div>

// 개선된 구조  
<div>
  <h2 className="sm:px-24">제목</h2>     // 선택적 패딩
  <div className="w-full">슬라이더</div>  // 전체 너비 활용
  <div className="sm:px-24">카드들</div>  // 선택적 패딩
</div>
```

#### 3. 드래그 스크롤 기능 구현
**구현 방식**: 브라우저 네이티브 스크롤 + 스크롤바 숨김
```tsx
// 드래그 스크롤 핵심 로직
const handleMouseDown = (e: MouseEvent) => {
  // 버튼 클릭은 드래그에서 제외
  if (target.tagName === 'BUTTON') return;
  
  isDown = true;
  startX = e.pageX - slider.offsetLeft;
  scrollLeft = slider.scrollLeft;
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isDown) return;
  const x = e.pageX - slider.offsetLeft;
  const walk = (x - startX) * 2; // 2배 민감도
  slider.scrollLeft = scrollLeft - walk;
};
```

#### 4. CSS 스크롤바 숨김 처리
```css
/* 웹에서 스크롤바 숨김 */
.week-slider-container {
  -ms-overflow-style: none;  /* IE/Edge */
  scrollbar-width: none;     /* Firefox */
}
.week-slider-container::-webkit-scrollbar {
  display: none;             /* Chrome/Safari */
}
```

### 최종 구현 결과

#### 웹 (640px 이상)
- ✅ **마우스 드래그** 스크롤
- ✅ **화살표 버튼** (3버튼씩 스크롤)
- ✅ **마우스 휠** 스크롤 (브라우저 기본)
- ✅ **스크롤바 숨김**
- ✅ **grab/grabbing 커서** 변경

#### 모바일/앱 (640px 미만)  
- ✅ **터치 스크롤** (기존과 동일)
- ✅ **아무 변화 없음** (요구사항 준수)

### 핵심 설계 원칙

1. **브라우저 네이티브 활용**: 복잡한 커스텀 스크롤 대신 네이티브 scroll 사용
2. **반응형 분리**: 웹과 모바일 동작을 명확히 분리
3. **레이아웃 최적화**: 스크롤 영역은 최대 너비, 다른 요소만 패딩 적용
4. **점진적 개선**: 기본 스크롤 동작 유지하면서 UX 향상

### 파일 구조
```
src/components/common/WeeklyInfo.tsx  // 주요 구현
src/pages/WeeklyInfoPage.tsx          // 레이아웃 수정
src/index.css                         // 스크롤바 숨김 CSS
```

### 성능 최적화
- 네이티브 스크롤 엔진 활용으로 60fps 보장
- 하드웨어 가속 자동 적용
- 메모리 누수 방지 (이벤트 리스너 정리)
- 크로스 브라우저 호환성 확보

