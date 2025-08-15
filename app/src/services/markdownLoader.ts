// import { marked } from 'marked';

export interface WeeklyData {
  week: number;
  title: string;
  content1: string;
  content2: string;
  tipTitle: string;
  tipContent: string;
}

// 원본 마크다운에서 특정 섹션 추출하는 함수 (이모지와 줄바꿈 보존, 제목 포함)
const extractSectionFromMarkdown = (markdown: string, sectionTitle: string): string => {
  // ### 섹션으로 직접 파싱 (제목 포함, HTML 변환 없이)
  const regex = new RegExp(`(### ${sectionTitle}[\\s\\S]*?)(?=### |$)`, 'i');
  const match = markdown.match(regex);
  if (!match) return '';
  
  let content = match[1].trim();
  
  // 마크다운 불릿 포인트를 유니코드 불릿으로 변환
  content = content
    .replace(/^- /gm, '• ')
    .replace(/^\* /gm, '• ')
    // ### 제목을 더 예쁘게 포맷팅하고 굵게 표시
    .replace(/^### (🍼 아기 발달|💛 엄마의 변화|🍎 건강 포인트|✅ 주차별 체크리스트|🌿 격려 한마디)/gm, '**$1**')
    // 연속된 줄바꿈 정리하되 구조 보존
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  
  return content;
};

// 마크다운 파일을 파싱하여 WeeklyData 형태로 변환 (이모지 보존)
export const parseMarkdownToWeeklyData = async (week: number): Promise<WeeklyData> => {
  try {
    const response = await fetch(`/information/${week}주차.md`);
    if (!response.ok) {
      throw new Error(`파일을 찾을 수 없습니다: ${week}주차.md`);
    }
    
    const markdown = await response.text();
    
    // 제목 추출 (## 🌸 로 시작하는 부분) - 마크다운에서 직접, 이모지 포함
    const titleMatch = markdown.match(/## (🌸[^\n]+)/);
    const title = titleMatch ? titleMatch[1].trim() : `🌸 임신 ${week}주차 맞춤 정보`;
    
    // 각 섹션별로 내용 추출 (마크다운에서 직접)
    const babyDevelopment = extractSectionFromMarkdown(markdown, '🍼 아기 발달');
    const motherChanges = extractSectionFromMarkdown(markdown, '💛 엄마의 변화');
    const healthPoints = extractSectionFromMarkdown(markdown, '🍎 건강 포인트');
    const checklist = extractSectionFromMarkdown(markdown, '✅ 주차별 체크리스트');
    const encouragement = extractSectionFromMarkdown(markdown, '🌿 격려 한마디');
    
    return {
      week,
      title,
      content1: babyDevelopment + (motherChanges ? '\n\n' + motherChanges : ''),
      content2: healthPoints + (checklist ? '\n\n' + checklist : ''),
      tipTitle: '', // 제목 제거
      tipContent: encouragement.replace(/^["']|["']$/g, '').trim() // 따옴표만 제거
    };
  } catch (error) {
    console.error(`${week}주차 데이터 로드 실패:`, error);
    
    // 폴백 데이터 반환
    return {
      week,
      title: `${week}주차 맞춤 정보`,
      content1: `임신 ${week}주차의 맞춤 정보를 준비 중입니다.`,
      content2: '곧 더 자세한 정보를 제공할 예정입니다.',
      tipTitle: '이번 주 팁',
      tipContent: '규칙적인 산전 검사를 받고 건강한 생활습관을 유지하세요.'
    };
  }
};

// 여러 주차 데이터를 한번에 로드
export const loadWeeklyDataRange = async (startWeek: number, endWeek: number): Promise<WeeklyData[]> => {
  const promises: Promise<WeeklyData>[] = [];
  
  for (let week = startWeek; week <= endWeek; week++) {
    promises.push(parseMarkdownToWeeklyData(week));
  }
  
  const results = await Promise.allSettled(promises);
  return results
    .filter((result): result is PromiseFulfilledResult<WeeklyData> => result.status === 'fulfilled')
    .map(result => result.value);
};

// 전체 주차 데이터 로드 (4주~40주)
export const loadAllWeeklyData = async (): Promise<WeeklyData[]> => {
  return await loadWeeklyDataRange(4, 40);
};