// 주차별 데이터 캐싱 시스템
import { loadAllWeeklyData } from './markdownLoader';
import type { WeeklyData } from './markdownLoader';

interface CachedData {
  data: WeeklyData[];
  lastUpdated: string;
  version: number;
}

const CACHE_KEY = 'momcheck_weekly_data_md';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간


// 기본 주차별 데이터 (Notion이 연결되지 않았을 때 사용)
const DEFAULT_WEEKLY_DATA: WeeklyData[] = [
  {
    week: 4,
    title: '4주차 맞춤 정보',
    content1: '임신 4주차는 수정란이 자궁벽에 착상하는 시기입니다. 태아의 중요한 기관들이 형성되기 시작하므로 엽산 섭취가 매우 중요합니다.',
    content2: '이 시기에는 알코올, 담배, 카페인을 피하고 충분한 휴식을 취해야 합니다. 입덧이 시작될 수 있으니 소량씩 자주 섭취하는 것이 좋습니다.',
    tipTitle: '이번 주 팁',
    tipContent: '엽산 400μg을 매일 복용하고, 규칙적인 생활 패턴을 유지하세요. 스트레스를 줄이고 충분한 수면을 취하는 것이 중요합니다.'
  },
  {
    week: 5,
    title: '5주차 맞춤 정보',
    content1: '임신 5주차에는 태아의 심장이 뛰기 시작합니다. 신경관이 닫히는 중요한 시기이므로 엽산 섭취를 계속 유지해야 합니다.',
    content2: '입덧 증상이 본격적으로 시작될 수 있습니다. 메스꺼움이 심하다면 생강차나 소량의 음식을 자주 섭취해보세요.',
    tipTitle: '이번 주 팁',
    tipContent: '입덧 완화를 위해 아침에 일어나기 전 침대에서 크래커를 먹어보세요. 충분한 수분 섭취도 중요합니다.'
  },
  {
    week: 8,
    title: '8주차 맞춤 정보',
    content1: '임신 8주차에는 태아의 모든 주요 장기가 형성됩니다. 이제 태아를 배아가 아닌 태아라고 부를 수 있습니다.',
    content2: '입덧이 가장 심한 시기일 수 있습니다. 체중이 줄어도 걱정하지 마세요. 수분 섭취를 충분히 하고 소량씩 자주 드세요.',
    tipTitle: '이번 주 팁',
    tipContent: '비타민 B6가 입덧 완화에 도움이 됩니다. 의사와 상담 후 보충제를 고려해보세요.'
  },
  {
    week: 12,
    title: '12주차 맞춤 정보',
    content1: '임신 12주차는 1분기의 마지막 주입니다. 유산 위험이 현저히 줄어들어 가족과 지인들에게 임신 소식을 알리기 좋은 시기입니다.',
    content2: '입덧이 서서히 줄어들기 시작합니다. 균형잡힌 식단으로 태아의 성장에 필요한 영양소를 공급해주세요.',
    tipTitle: '이번 주 팁',
    tipContent: '산전 검사를 받고 태아의 건강 상태를 확인해보세요. 엽산과 함께 철분 보충도 시작하면 좋습니다.'
  },
  {
    week: 16,
    title: '16주차 맞춤 정보',
    content1: '임신 16주차에는 태아의 성별을 확인할 수 있습니다. 태아의 골격이 더욱 단단해지고 근육이 발달합니다.',
    content2: '입덧이 거의 사라지고 식욕이 돌아옵니다. 하지만 과식은 금물! 체중 증가를 적절히 관리하세요.',
    tipTitle: '이번 주 팁',
    tipContent: '태아의 뼈 발달을 위해 칼슘 섭취를 늘리세요. 유제품, 멸치, 두부 등이 좋은 칼슘 공급원입니다.'
  },
  {
    week: 20,
    title: '20주차 맞춤 정보',
    content1: '임신 20주차는 임신의 중간 지점입니다. 정밀 초음파 검사를 통해 태아의 발달 상태를 자세히 확인할 수 있습니다.',
    content2: '태동을 처음 느낄 수 있는 시기입니다. 처음에는 미미하지만 점차 뚜렷해질 것입니다.',
    tipTitle: '이번 주 팁',
    tipContent: '태동을 느끼기 시작하면 태아와의 교감을 늘려보세요. 음악을 들려주거나 책을 읽어주는 것도 좋습니다.'
  },
  {
    week: 25,
    title: '25주차 맞춤 정보',
    content1: '임신 25주차에는 태아의 폐가 빠르게 발달하고 있습니다. 이 시기부터는 체중 증가 패턴을 더욱 주의깊게 관찰해야 합니다.',
    content2: '임신성 당뇨 검사를 받는 시기입니다. 균형잡힌 식단과 적절한 운동으로 혈당을 관리하는 것이 중요합니다.',
    tipTitle: '이번 주 팁',
    tipContent: '임신 중기 운동으로 요가나 수영을 추천합니다. 정기적인 산전 검사를 받고 의사와 상담하세요.'
  },
  {
    week: 30,
    title: '30주차 맞춤 정보',
    content1: '임신 30주차에는 태아의 뇌가 급속히 발달합니다. 이제 태아가 외부 소리를 들을 수 있으므로 태교에 신경써보세요.',
    content2: '자궁이 커지면서 호흡곤란이나 속쓰림을 경험할 수 있습니다. 소량씩 자주 식사하고, 잠잘 때는 옆으로 누워 주무세요.',
    tipTitle: '이번 주 팁',
    tipContent: '클래식 음악이나 책 읽기로 태교를 해보세요. 발 마사지와 스트레칭으로 부종을 완화할 수 있습니다.'
  },
  {
    week: 35,
    title: '35주차 맞춤 정보',
    content1: '임신 35주차에는 태아의 폐가 거의 성숙합니다. 이제 언제 태어나도 생존 가능성이 매우 높습니다.',
    content2: '출산 준비를 시작해야 할 시기입니다. 병원 가방을 미리 준비하고 출산 계획을 세워보세요.',
    tipTitle: '이번 주 팁',
    tipContent: '회음부 마사지를 시작해보세요. 출산 시 회음부 열상을 줄이는데 도움이 됩니다.'
  },
  {
    week: 38,
    title: '38주차 맞춤 정보',
    content1: '임신 38주차는 만삭입니다. 태아가 언제든 태어날 준비가 되어 있습니다.',
    content2: '진통의 전조 증상들을 숙지해두세요. 규칙적인 자궁 수축이 시작되면 병원으로 향해야 합니다.',
    tipTitle: '이번 주 팁',
    tipContent: '출산 징후를 미리 알아두세요: 이슬, 양수 파수, 규칙적인 진통. 언제든 병원에 갈 준비를 하세요.'
  }
];

// 마크다운 파일에서 데이터 가져오기 (캐싱 포함)
export const getCachedWeeklyData = async (): Promise<WeeklyData[]> => {
  try {
    // 1. 캐시 확인
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsedCache: CachedData = JSON.parse(cached);
      const now = new Date().getTime();
      const lastUpdated = new Date(parsedCache.lastUpdated).getTime();
      
      // 캐시가 24시간 이내면 캐시된 데이터 반환
      if (now - lastUpdated < CACHE_DURATION && parsedCache.data.length > 0) {
        console.log(`캐시된 주차별 데이터 사용 중... (${parsedCache.data.length}개 항목)`);
        return parsedCache.data;
      }
    }
    
    // 2. 캐시가 없거나 만료된 경우 마크다운 파일 로드
    console.log('마크다운 파일에서 주차별 데이터 로드 중...');
    const weeklyData = await loadAllWeeklyData();
    
    // 3. 로드된 데이터를 캐시에 저장
    if (weeklyData.length > 0) {
      saveToCacheWithTimestamp(weeklyData);
      console.log(`마크다운에서 ${weeklyData.length}개의 주차 데이터 로드 완료`);
      return weeklyData;
    }
    
    // 4. 마크다운 로드 실패 시 기본 데이터 반환
    console.log('마크다운 로드 실패. 기본 데이터 사용.');
    return DEFAULT_WEEKLY_DATA;
    
  } catch (error) {
    console.error('데이터 로드 오류:', error);
    return DEFAULT_WEEKLY_DATA;
  }
};

// 캐시 관리 함수들
export const saveToCacheWithTimestamp = (data: WeeklyData[]): void => {
  try {
    const cacheData: CachedData = {
      data,
      lastUpdated: new Date().toISOString(),
      version: 1
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.log(`주차별 데이터 캐시 저장 완료: ${data.length}개 항목`);
  } catch (error) {
    console.error('캐시 저장 오류:', error);
  }
};

export const isCacheExpired = (): boolean => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return true;

    const parsedCache: CachedData = JSON.parse(cached);
    const now = new Date().getTime();
    const lastUpdated = new Date(parsedCache.lastUpdated).getTime();

    return (now - lastUpdated) >= CACHE_DURATION;
  } catch {
    return true;
  }
};

export const clearCache = (): void => {
  localStorage.removeItem(CACHE_KEY);
  console.log('주차별 데이터 캐시 초기화 완료');
};

export const forceRefresh = async (): Promise<boolean> => {
  try {
    console.log('강제 데이터 갱신 시작...');
    clearCache(); // 캐시 초기화
    const weeklyData = await loadAllWeeklyData();
    
    if (weeklyData.length > 0) {
      saveToCacheWithTimestamp(weeklyData);
      console.log('강제 갱신 완료!');
      return true;
    }
    return false;
  } catch (error) {
    console.error('강제 갱신 실패:', error);
    return false;
  }
};