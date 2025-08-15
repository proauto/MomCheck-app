import React, { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Page } from '../components/layout/Page';
import { TopBar } from '../components/layout/TopBar';
import { BottomNav } from '../components/layout/BottomNav';
import { StatusCard } from '../components/common/StatusCard';
import { GuidanceCard } from '../components/common/GuidanceCard';
import { WeightProgressChart } from '../components/charts/WeightProgressChart';
import { WeightDistributionDonut } from '../components/charts/WeightDistributionDonut';
import { WeeklyTargetTable } from '../components/data/WeeklyTargetTable';
import { WeeklyInfo } from '../components/common/WeeklyInfo';
import { useStore } from '../app/store';
// import { bmi } from '../domain/bmi';
import { calcTargets } from '../domain/targets';
import { estimateDistribution } from '../domain/distribution';
import logoImg from '../assets/logo.png';
import resultIllust from '../assets/result_illust.png';

export const ResultPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { setResult } = useStore();
  
  // 실제 계산에 사용되는 파라미터 (URL에서 가져온 값)
  const params = React.useMemo(() => ({
    week: Number(searchParams.get('week')),
    height: Number(searchParams.get('height')),
    weight: Number(searchParams.get('weight')),
    preWeight: Number(searchParams.get('preWeight')),
    type: searchParams.get('type') as 'singleton' | 'twin' | 'triplet' | 'quadruplet',
    fetuses: (searchParams.get('type') === 'twin' ? 2 : 
             searchParams.get('type') === 'triplet' ? 3 :
             searchParams.get('type') === 'quadruplet' ? 4 : 1) as 1 | 2 | 3 | 4
  }), [searchParams]);

  // 편집 가능한 임시 파라미터 (사용자가 입력하는 값)
  const [editableParams, setEditableParams] = React.useState(() => ({
    week: params.week,
    height: params.height,
    weight: params.weight,
    preWeight: params.preWeight,
    type: params.type,
    fetuses: params.fetuses
  }));

  // 도넛 차트용 별도 주차 state - 초기값만 설정하고 수정하기 전까지 고정
  const [donutWeek, setDonutWeek] = React.useState(params.week);
  const [tableExpanded, setTableExpanded] = React.useState(false);
  
  // 실제 계산에 사용할 고정된 파라미터 (수정하기를 눌렀을 때만 업데이트)
  const [calculationParams, setCalculationParams] = React.useState(params);
  
  // 도넛 차트용 고정된 targets (calculationParams가 바뀔 때만 계산)
  const donutTargets = React.useMemo(() => {
    return calcTargets({
      preKg: calculationParams.preWeight,
      heightCm: calculationParams.height,
      startWeek: 1,
      endWeek: 40,
      fetuses: calculationParams.fetuses
    });
  }, [calculationParams]);

  // 도넛 차트용 totalGainKg 값을 미리 계산해서 고정 (donutWeek, calculationParams가 바뀔 때만)
  const donutTotalGainKg = React.useMemo(() => {
    const selectedWeekTarget = donutTargets.find(t => t.week === donutWeek);
    return selectedWeekTarget ? selectedWeekTarget.mid - calculationParams.preWeight : (calculationParams.weight - calculationParams.preWeight);
  }, [donutTargets, donutWeek, calculationParams]);
  
  // 탭 상태 ('result' | 'weekly')
  const [activeTab, setActiveTab] = React.useState<'result' | 'weekly'>('result');
  
  const results = useMemo(() => {
    // 고정된 계산 파라미터를 사용해서 그래프가 실시간 갱신되지 않도록 함
    const targets = calcTargets({
      preKg: calculationParams.preWeight,
      heightCm: calculationParams.height,
      startWeek: 1,
      endWeek: 40,
      fetuses: calculationParams.fetuses
    });
    
    const distribution = estimateDistribution(calculationParams.weight - calculationParams.preWeight);
    
    const currentTarget = targets.find(t => t.week === calculationParams.week);
    const isInRange = currentTarget && 
      calculationParams.weight >= currentTarget.low && 
      calculationParams.weight <= currentTarget.high;
    
    const series = Array.from({ length: 40 }, (_, i) => ({
      week: i + 1,
      actual: i + 1 <= calculationParams.week ? 
        calculationParams.preWeight + ((calculationParams.weight - calculationParams.preWeight) / (calculationParams.week - 1)) * i : 
        undefined
    }));
    
    const tableRows = targets.map((target, i) => ({
      week: target.week,
      now: target.mid,
      min: target.low,
      max: target.high,
      weekly: i > 0 ? target.mid - targets[i - 1].mid : 0
    }));
    
    return {
      targets,
      distribution,
      isInRange,
      series,
      tableRows,
      currentTarget,
      totalGain: calculationParams.weight - calculationParams.preWeight
    };
  }, [calculationParams]);
  
  useEffect(() => {
    document.title = '체중 관리 결과 - MomCheck';
    setResult({ 
      targets: results.targets, 
      distribution: results.distribution 
    });
  }, [results, setResult]);

  // URL 파라미터가 변경되면 편집 가능한 파라미터도 동기화
  useEffect(() => {
    setEditableParams({
      week: params.week,
      height: params.height,
      weight: params.weight,
      preWeight: params.preWeight,
      type: params.type,
      fetuses: params.fetuses
    });
    setDonutWeek(params.week);
  }, [params]);
  
  const handleRecalculate = () => {
    // URL 파라미터 업데이트하여 결과 갱신
    const newParams = new URLSearchParams({
      week: editableParams.week.toString(),
      height: editableParams.height.toString(),
      weight: editableParams.weight.toString(),
      preWeight: editableParams.preWeight.toString(),
      type: editableParams.type
    });
    setSearchParams(newParams);
    
    // 계산에 사용할 파라미터 업데이트 (이때만 그래프가 갱신됨)
    setCalculationParams({
      week: editableParams.week,
      height: editableParams.height,
      weight: editableParams.weight,
      preWeight: editableParams.preWeight,
      type: editableParams.type,
      fetuses: editableParams.type === 'twin' ? 2 : editableParams.type === 'triplet' ? 3 : editableParams.type === 'quadruplet' ? 4 : 1
    });
    
    // 도넛 차트 주차도 업데이트
    setDonutWeek(editableParams.week);
  };
  
  const getStatusMessage = () => {
    if (results.isInRange) {
      return {
        level: 'good' as const,
        message: '좋아요! 현재 적정 범위 안에 들어있어요.',
        sub: `현재 ${params.week}주차 목표 범위: ${results.currentTarget?.low.toFixed(1)} - ${results.currentTarget?.high.toFixed(1)}kg`
      };
    } else if (params.weight < (results.currentTarget?.low || 0)) {
      return {
        level: 'warn' as const,
        message: '목표 체중보다 조금 낮아요.',
        sub: `권장 최소 체중까지 ${((results.currentTarget?.low || 0) - params.weight).toFixed(1)}kg 더 필요해요.`
      };
    } else {
      return {
        level: 'warn' as const,
        message: '목표 체중을 조금 넘었어요.',
        sub: `권장 최대 체중을 ${(params.weight - (results.currentTarget?.high || 0)).toFixed(1)}kg 초과했어요.`
      };
    }
  };
  
  const status = getStatusMessage();
  
  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      <TopBar 
        logoSrc={logoImg} 
        title="MomCheck" 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <Page title="체중 관리 결과">
        <div className="h-[calc(100vh-64px)] flex">
          {/* Left Part - 입력값 표시 */}
          <div className="w-80 bg-white border-r border-border-subtle flex flex-col relative">
            <div className="p-lg space-y-lg flex-1">
              {/* 현재 임신 주수 */}
              <div className="space-y-sm">
                <label className="block text-sm font-medium text-text-default">
                  현재 임신 주수
                </label>
                <select
                  value={editableParams.week}
                  onChange={(e) => setEditableParams(prev => ({ ...prev, week: Number(e.target.value) }))}
                  className="w-full px-md bg-bg-field border border-border-subtle
                    focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                    text-text-default appearance-none"
                  style={{ 
                    height: '48px',
                    borderRadius: '24px',
                    fontFamily: 'Noto Sans KR',
                    fontWeight: '500',
                    color: editableParams.week ? '#000000' : '#938288',
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`, 
                    backgroundPosition: 'right 0.5rem center', 
                    backgroundRepeat: 'no-repeat', 
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  {Array.from({ length: 37 }, (_, i) => (
                    <option key={i + 4} value={i + 4}>
                      {i + 4} Weeks
                    </option>
                  ))}
                </select>
              </div>
              
              {/* 현재 키, 체중 */}
              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-sm">
                  <label className="block text-sm font-medium text-text-default">
                    현재 키, 체중
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={editableParams.height}
                      onChange={(e) => setEditableParams(prev => ({ ...prev, height: Number(e.target.value) }))}
                      className="w-full px-md bg-bg-field border border-border-subtle
                        focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                        text-text-default pr-10 font-bold"
                      style={{ 
                        height: '48px',
                        borderRadius: '24px'
                      }}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">cm</span>
                  </div>
                </div>
                <div className="space-y-sm">
                  <label className="block text-sm font-medium text-text-default opacity-0">
                    &nbsp;
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={editableParams.weight}
                      onChange={(e) => setEditableParams(prev => ({ ...prev, weight: Number(e.target.value) }))}
                      step={0.1}
                      className="w-full px-md bg-bg-field border border-border-subtle
                        focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                        text-text-default pr-10 font-bold"
                      style={{ 
                        height: '48px',
                        borderRadius: '24px'
                      }}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">kg</span>
                  </div>
                </div>
              </div>
              
              {/* 임신 전 체중 */}
              <div className="space-y-sm">
                <label className="block text-sm font-medium text-text-default">
                  임신 전 체중
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={editableParams.preWeight}
                    onChange={(e) => setEditableParams(prev => ({ ...prev, preWeight: Number(e.target.value) }))}
                    step={0.1}
                    className="w-full px-md bg-bg-field border border-border-subtle
                      focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                      text-text-default pr-10 font-bold"
                    style={{ 
                      height: '48px',
                      borderRadius: '24px'
                    }}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">kg</span>
                </div>
              </div>
              
              {/* 임신 타입 */}
              <div className="space-y-sm">
                <label className="block text-sm font-medium text-text-default">
                  임신 타입
                </label>
                <select
                  value={editableParams.type}
                  onChange={(e) => {
                    const newType = e.target.value as 'singleton' | 'twin' | 'triplet' | 'quadruplet';
                    const newFetuses = newType === 'twin' ? 2 : newType === 'triplet' ? 3 : newType === 'quadruplet' ? 4 : 1;
                    setEditableParams(prev => ({ ...prev, type: newType, fetuses: newFetuses }));
                  }}
                  className="w-full px-md bg-bg-field border border-border-subtle
                    focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                    text-text-default appearance-none"
                  style={{ 
                    height: '48px',
                    borderRadius: '24px',
                    fontFamily: 'Noto Sans KR',
                    fontWeight: '500',
                    color: editableParams.type ? '#000000' : '#938288',
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`, 
                    backgroundPosition: 'right 0.5rem center', 
                    backgroundRepeat: 'no-repeat', 
                    backgroundSize: '1.5em 1.5em' 
                  }}
                >
                  <option value="singleton">1 Baby</option>
                  <option value="twin">2 Babies</option>
                </select>
              </div>
              
              {/* 수정하기 버튼 */}
              <button
                onClick={handleRecalculate}
                className="w-full px-lg py-sm border border-brand-500 text-brand-500 rounded-pill 
                  hover:bg-brand-50 transition-colors font-medium"
              >
                수정하기
              </button>
            </div>
            
            {/* 임신부 일러스트 영역 - 절대 위치로 하단에 배치 */}
            <div className="absolute bottom-0 left-0 right-0 h-64">
              <img 
                src={resultIllust} 
                alt="임신부 일러스트" 
                className="w-full h-full object-contain object-bottom"
              />
            </div>
          </div>
          
          {/* Right Part - 결과 표시 / 주수별 정보 */}
          <div className="flex-1 p-2xl overflow-y-auto">
            {activeTab === 'result' ? (
            <div className="space-y-xl pb-32">
              {/* 상태 메시지와 공유 버튼 */}
              <div>
                <StatusCard {...status} showShareButton={true} />
              </div>
              
              {/* 차트 */}
              <WeightProgressChart
                series={results.series}
                targets={results.targets}
                currentWeek={calculationParams.week}
                preWeight={calculationParams.preWeight}
                currentWeight={calculationParams.weight}
              />
              
              {/* 주차별 추천 체중 테이블과 증가한 체중 분포도를 나란히 배치 */}
              <div className="flex gap-xl">
                {/* 주차별 추천 체중 테이블 */}
                <div className="flex-1">
                  <div className="flex justify-between items-center" style={{ marginBottom: '16px', height: '43px' }}>
                    <h3 
                      style={{ 
                        fontFamily: 'Noto Sans KR', 
                        fontWeight: '700', 
                        fontSize: '24px',
                        color: '#1E1B1C',
                        margin: 0,
                        lineHeight: '1'
                      }}
                    >
                      주차별 추천 체중
                    </h3>
                  </div>
                  <WeeklyTargetTable 
                    rows={results.tableRows}
                    currentWeek={calculationParams.week}
                    currentWeight={calculationParams.weight}
                    preWeight={calculationParams.preWeight}
                    expanded={tableExpanded}
                    onExpandChange={setTableExpanded}
                  />
                </div>

                {/* 증가한 체중 분포도 */}
                <div className="flex-1">
                  <div className="flex justify-between items-center" style={{ marginBottom: '16px', height: '43px' }}>
                    <h3 
                      style={{ 
                        fontFamily: 'Noto Sans KR', 
                        fontWeight: '700', 
                        fontSize: '24px',
                        color: '#1E1B1C',
                        margin: 0,
                        lineHeight: '1'
                      }}
                    >
                      증가한 체중 분포도 (예상)
                    </h3>
                    <select
                      value={donutWeek}
                      onChange={(e) => setDonutWeek(Number(e.target.value))}
                      className="px-3 py-1 text-sm"
                      style={{ 
                        width: '160px',
                        height: '43px',
                        borderRadius: '24px',
                        backgroundColor: '#E5DCDF',
                        border: 'none',
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`, 
                        backgroundPosition: 'right 0.5rem center', 
                        backgroundRepeat: 'no-repeat', 
                        backgroundSize: '1em 1em' 
                      }}
                    >
                      {Array.from({ length: 37 }, (_, i) => (
                        <option key={i + 4} value={i + 4}>
                          {i + 4} Weeks
                        </option>
                      ))}
                    </select>
                  </div>
                  <WeightDistributionDonut
                    totalGainKg={donutTotalGainKg}
                    week={donutWeek}
                  />
                  
                  {/* 더보기 상태일 때 안내 및 주의사항을 증가한 체중 분포도 아래로 배치 */}
                  {tableExpanded && (
                    <div style={{ marginTop: '24px' }}>
                      <GuidanceCard
                        items={[
                          '본 서비스는 임신 중 체중 변화에 대한 일반적인 참고 정보를 제공합니다.',
                          '제공되는 수치는 통계와 평균값을 기반으로 하며, 개인의 건강 상태나 상황에 따라 달라질 수 있습니다.',
                          '체중 관리 및 건강과 관련된 모든 의학적 결정은 반드시 전문의와 상담 후 진행하시기 바랍니다.',
                          '갑작스러운 체중 변화, 통증, 출혈, 호흡 곤란 등 이상 증상이 있을 경우 즉시 의료기관을 방문하세요.',
                          '임신 기간 동안의 건강 관리는 체중 수치만이 아닌 전체적인 생활습관, 식습관 운동 등을 함께 고려해야 합니다.',
                          '자료 출처 : Institute of Medicine (IOM) and National Research Council.', 
                          'Weight Gain During Pregnancy: Reexamining the Guidelines. Washington, DC: The National Academies Press; 2009. doi:10.17226/12584',
                          '쌍둥이 범위는 IOM 2009 공인 국제 가이드라인을 따릅니다.',
                          '세쌍둥이, 네쌍둥이는 공인된 국제 가이드라인이 없습니다.'
                        ]}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 더보기 상태가 아닐 때 안내 및 주의사항을 전체 화면에 배치 */}
              {!tableExpanded && (
                <GuidanceCard
                  items={[
                    '본 서비스는 임신 중 체중 변화에 대한 일반적인 참고 정보를 제공합니다.',
                    '제공되는 수치는 통계와 평균값을 기반으로 하며, 개인의 건강 상태나 상황에 따라 달라질 수 있습니다.',
                    '체중 관리 및 건강과 관련된 모든 의학적 결정은 반드시 전문의와 상담 후 진행하시기 바랍니다.',
                    '갑작스러운 체중 변화, 통증, 출혈, 호흡 곤란 등 이상 증상이 있을 경우 즉시 의료기관을 방문하세요.',
                    '임신 기간 동안의 건강 관리는 체중 수치만이 아닌 전체적인 생활습관, 식습관 운동 등을 함께 고려해야 합니다.',
                    '자료 출처 : Institute of Medicine (IOM) and National Research Council.', 
                    'Weight Gain During Pregnancy: Reexamining the Guidelines. Washington, DC: The National Academies Press; 2009. doi:10.17226/12584',
                    '쌍둥이 범위는 IOM 2009 공인 국제 가이드라인을 따릅니다.',
                    '세쌍둥이, 네쌍둥이는 공인된 국제 가이드라인이 없습니다.',
                    '문의 : previtlab@gmail.com 프레빗랩(주)'
                  ]}
                />
              )}

            </div>
            ) : (
              /* 주수별 맞춤정보 컨텐츠 */
              <div className="pb-32">
                <WeeklyInfo currentWeek={params.week} />
              </div>
            )}

            {/* 플로팅 광고 공간 - 화면 하단에 붙이고 오른쪽 파트 가득 채우기 */}
            <div 
              className="fixed bottom-0"
              style={{ 
                left: '320px', // 왼쪽 파트 너비만큼
                right: '0', // 화면 오른쪽 끝까지
                height: '100px', 
                backgroundColor: '#F5F5F5', 
                border: '1px solid #E0E0E0',
                borderTop: '1px solid #E0E0E0',
                borderRadius: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                color: '#666666',
                fontFamily: 'Noto Sans KR',
                zIndex: 1000,
              }}
            >
              광고
            </div>
          </div>
        </div>
      </Page>
      <BottomNav />
    </div>
  );
};