import type { BmiCat } from './bmi';
import { defaultPolicy, type FetusCount, type MultiplesPolicy, clamp, lerp } from './multiples-policy';

export interface TargetPoint {
  week: number;
  low: number;
  mid: number;
  high: number;
}

export interface TargetAtParams {
  preKg: number;
  heightCm: number;
  gestWeek: number;
  fetuses?: FetusCount;
  policy?: MultiplesPolicy;
}

export interface CalcParams {
  preKg: number;
  heightCm: number;
  startWeek?: number;
  endWeek?: number;
  fetuses?: FetusCount;
  policy?: MultiplesPolicy;
}

export function targetAtWeek(p: TargetAtParams): { low: number; mid: number; high: number } {
  const { preKg, heightCm, gestWeek, fetuses = 1, policy = defaultPolicy } = p;
  
  // Validation
  if (heightCm < 120 || heightCm > 210) {
    throw new Error('Height must be between 120-210cm');
  }
  if (preKg < 30 || preKg > 150) {
    throw new Error('Pre-pregnancy weight must be between 30-150kg');
  }
  if (gestWeek < 1 || gestWeek > 40) {
    throw new Error('Gestational week must be between 1-40');
  }
  if (![1, 2, 3, 4].includes(fetuses)) {
    throw new Error('Fetuses count must be 1, 2, 3, or 4');
  }
  
  // Calculate BMI and category
  const bmiValue = (preKg / ((heightCm / 100) ** 2));
  const cat: BmiCat = bmiValue < 18.5 ? 'U' : bmiValue < 25 ? 'N' : bmiValue < 30 ? 'OW' : 'OB';
  
  if (fetuses === 1) {
    return calcSingletonTarget(preKg, gestWeek, cat, policy);
  } else if (fetuses === 2) {
    return calcTwinTarget(preKg, gestWeek, cat, policy);
  } else if (fetuses === 3) {
    if (!policy.triplet) {
      throw new Error('Triplet policy not provided');
    }
    return calcMultipleTarget(preKg, gestWeek, cat, policy.triplet);
  } else if (fetuses === 4) {
    if (!policy.quadruplet) {
      throw new Error('Quadruplet policy not provided');
    }
    return calcMultipleTarget(preKg, gestWeek, cat, policy.quadruplet);
  }
  
  throw new Error('Invalid fetuses count');
}

function calcSingletonTarget(preKg: number, gestWeek: number, cat: BmiCat, policy: MultiplesPolicy) {
  const { q1, rates } = policy.singleton;
  
  if (gestWeek <= 13) {
    // First trimester: linear interpolation from 0 to q1 values
    const progress = clamp((gestWeek - 1) / 12, 0, 1);
    return {
      low: preKg + lerp(0, q1.min, progress),
      mid: preKg + lerp(0, q1.mid, progress),
      high: preKg + lerp(0, q1.max, progress)
    };
  } else {
    // 14+ weeks: q1 gain + weekly rate * weeks since week 13
    const weeksAfterFirst = gestWeek - 13;
    return {
      low: preKg + q1.min + rates[cat].min * weeksAfterFirst,
      mid: preKg + q1.mid + rates[cat].mid * weeksAfterFirst,
      high: preKg + q1.max + rates[cat].max * weeksAfterFirst
    };
  }
}

function calcTwinTarget(preKg: number, gestWeek: number, cat: BmiCat, policy: MultiplesPolicy) {
  const { twin } = policy;
  
  if (cat === 'U' && !twin.U) {
    throw new Error('Twin underweight not supported by default policy');
  }
  
  const totals = twin[cat];
  if (!totals) {
    throw new Error(`Twin policy not available for BMI category ${cat}`);
  }
  
  if (gestWeek <= twin.q1EndWeek) {
    // First trimester: linear interpolation
    const progress = clamp((gestWeek - 1) / twin.q1EndWeek, 0, 1);
    return {
      low: preKg + lerp(0, twin.q1.min, progress),
      mid: preKg + lerp(0, twin.q1.mid, progress),
      high: preKg + lerp(0, twin.q1.max, progress)
    };
  } else if (gestWeek <= twin.termWeek) {
    // 14+ weeks to term: linear progression to total gains
    const weeksAfterFirst = gestWeek - twin.q1EndWeek;
    const totalWeeksAfterFirst = twin.termWeek - twin.q1EndWeek;
    
    const remainingLow = totals.min - twin.q1.min;
    const remainingMid = (totals.min + totals.max) / 2 - twin.q1.mid;
    const remainingHigh = totals.max - twin.q1.max;
    
    return {
      low: preKg + twin.q1.min + (remainingLow / totalWeeksAfterFirst) * weeksAfterFirst,
      mid: preKg + twin.q1.mid + (remainingMid / totalWeeksAfterFirst) * weeksAfterFirst,
      high: preKg + twin.q1.max + (remainingHigh / totalWeeksAfterFirst) * weeksAfterFirst
    };
  } else {
    // Post-term: maintain term values
    const midTotal = (totals.min + totals.max) / 2;
    return {
      low: preKg + totals.min,
      mid: preKg + midTotal,
      high: preKg + totals.max
    };
  }
}

function calcMultipleTarget(preKg: number, gestWeek: number, cat: BmiCat, multiplePolicy: any) {
  const totals = multiplePolicy[cat];
  if (!totals) {
    throw new Error(`Multiple pregnancy policy not available for BMI category ${cat}`);
  }
  
  if (gestWeek <= multiplePolicy.q1EndWeek) {
    const progress = clamp((gestWeek - 1) / multiplePolicy.q1EndWeek, 0, 1);
    return {
      low: preKg + lerp(0, multiplePolicy.q1.min, progress),
      mid: preKg + lerp(0, multiplePolicy.q1.mid, progress),
      high: preKg + lerp(0, multiplePolicy.q1.max, progress)
    };
  } else if (gestWeek <= multiplePolicy.termWeek) {
    const weeksAfterFirst = gestWeek - multiplePolicy.q1EndWeek;
    const totalWeeksAfterFirst = multiplePolicy.termWeek - multiplePolicy.q1EndWeek;
    
    const remainingLow = totals.min - multiplePolicy.q1.min;
    const remainingMid = (totals.min + totals.max) / 2 - multiplePolicy.q1.mid;
    const remainingHigh = totals.max - multiplePolicy.q1.max;
    
    return {
      low: preKg + multiplePolicy.q1.min + (remainingLow / totalWeeksAfterFirst) * weeksAfterFirst,
      mid: preKg + multiplePolicy.q1.mid + (remainingMid / totalWeeksAfterFirst) * weeksAfterFirst,
      high: preKg + multiplePolicy.q1.max + (remainingHigh / totalWeeksAfterFirst) * weeksAfterFirst
    };
  } else {
    const midTotal = (totals.min + totals.max) / 2;
    return {
      low: preKg + totals.min,
      mid: preKg + midTotal,
      high: preKg + totals.max
    };
  }
}

export function calcTargets(p: CalcParams): TargetPoint[] {
  const { preKg, heightCm, startWeek = 1, endWeek = 40, fetuses = 1, policy = defaultPolicy } = p;
  
  const targets: TargetPoint[] = [];
  
  for (let week = startWeek; week <= endWeek; week++) {
    const target = targetAtWeek({ preKg, heightCm, gestWeek: week, fetuses, policy });
    targets.push({
      week,
      low: Math.round(target.low * 10) / 10,
      mid: Math.round(target.mid * 10) / 10,
      high: Math.round(target.high * 10) / 10
    });
  }
  
  return targets;
}

// Legacy function for backward compatibility
export function calcTargetsLegacy(params: {
  preKg: number;
  heightCm: number;
  gestWeek: number;
  cat?: BmiCat;
  twin?: boolean;
}): TargetPoint[] {
  // Use new calcTargets function with legacy parameter conversion
  const fetuses: FetusCount = params.twin ? 2 : 1;
  return calcTargets({
    preKg: params.preKg,
    heightCm: params.heightCm,
    endWeek: params.gestWeek,
    fetuses
  });
}