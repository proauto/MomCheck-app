export type BmiCat = 'U' | 'N' | 'OW' | 'OB';

export function bmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function bmiCat(bmi: number): BmiCat {
  if (bmi < 18.5) return 'U';
  if (bmi < 25) return 'N';
  if (bmi < 30) return 'OW';
  return 'OB';
}