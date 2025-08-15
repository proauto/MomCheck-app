import React from 'react';
import { Card } from '../layout/Card';
import { Button } from '../common/Button';

interface InputValues {
  week?: number;
  height?: number;
  weight?: number;
  preWeight?: number;
  type?: 'singleton' | 'twin' | 'triplet' | 'quadruplet';
}

interface InputPanelProps {
  values: InputValues;
  onChange: (values: Partial<InputValues>) => void;
  onSubmit: () => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  values,
  onChange,
  onSubmit
}) => {
  const isValid = () => {
    return (
      values.week !== undefined && values.week >= 4 && values.week <= 40 &&
      values.height !== undefined && values.height >= 120 && values.height <= 210 &&
      values.weight !== undefined && values.weight >= 30 && values.weight <= 150 &&
      values.preWeight !== undefined && values.preWeight >= 30 && values.preWeight <= 150 &&
      values.type !== undefined && 
      ['singleton', 'twin', 'triplet', 'quadruplet'].includes(values.type)
    );
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="px-16">
        <div style={{ paddingTop: '32px', paddingBottom: '32px' }}>
          <div className="space-y-5">
            <div className="space-y-sm">
              <label className="block text-sm font-medium text-text-default">
                현재 임신 주수
              </label>
              <div className="relative">
              <select
                value={values.week || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  onChange({ week: val === '' ? undefined : Number(val) });
                }}
                className="w-full px-md bg-bg-field border border-border-subtle
                  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                  text-text-default appearance-none"
                style={{ 
                  height: '48px',
                  borderRadius: '24px',
                  fontFamily: 'Noto Sans KR',
                  fontWeight: '500',
                  color: values.week ? '#000000' : '#938288',
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`, 
                  backgroundPosition: 'right 0.5rem center', 
                  backgroundRepeat: 'no-repeat', 
                  backgroundSize: '1.5em 1.5em'
                }}
              >
              <option value="" disabled>선택</option>
              {Array.from({ length: 37 }, (_, i) => (
                <option key={i + 4} value={i + 4}>
                  {i + 4}주
                </option>
              ))}
              </select>
              </div>
            </div>
          
          <div className="grid grid-cols-2 gap-lg">
            <div className="space-y-sm">
              <label className="block text-sm font-medium text-text-default">
                현재 키, 체중
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={values.height ?? ''}
                  onChange={(e) => onChange({ height: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder=""
                  min={120}
                  max={210}
                  className="w-full px-md bg-bg-field border border-border-subtle
                    focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                    text-text-default pr-10 sm:font-medium font-normal"
                  style={{ 
                    height: '48px',
                    borderRadius: '24px',
                    fontFamily: 'Noto Sans KR',
                    fontSize: window.innerWidth < 640 ? '24px' : '16px'
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
                  value={values.weight ?? ''}
                  onChange={(e) => onChange({ weight: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder=""
                  min={30}
                  max={150}
                  step={0.1}
                  className="w-full px-md bg-bg-field border border-border-subtle
                    focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                    text-text-default pr-10 sm:font-medium font-normal"
                  style={{ 
                    height: '48px',
                    borderRadius: '24px',
                    fontFamily: 'Noto Sans KR',
                    fontSize: window.innerWidth < 640 ? '24px' : '16px'
                  }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">kg</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-sm">
            <label className="block text-sm font-medium text-text-default">
              임신 전 체중
            </label>
            <div className="relative">
              <input
                type="number"
                value={values.preWeight ?? ''}
                onChange={(e) => onChange({ preWeight: e.target.value ? Number(e.target.value) : undefined })}
                placeholder=""
                min={30}
                max={150}
                step={0.1}
                className="w-full px-md bg-bg-field border border-border-subtle
                  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                  text-text-default pr-10 font-medium"
                style={{ 
                  height: '48px',
                  borderRadius: '24px'
                }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">kg</span>
            </div>
          </div>
          
            <div className="space-y-sm">
              <label className="block text-sm font-medium text-text-default">
                임신 타입
              </label>
              <select
              value={values.type || ''}
              onChange={(e) => {
                const val = e.target.value;
                onChange({ type: val === '' ? undefined : (val as 'singleton' | 'twin' | 'triplet' | 'quadruplet') });
              }}
              className="w-full px-md bg-bg-field border border-border-subtle
                focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                text-text-default appearance-none"
              style={{ 
                height: '48px',
                borderRadius: '24px',
                fontFamily: 'Noto Sans KR',
                fontWeight: '500',
                color: values.type ? '#000000' : '#938288',
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`, 
                backgroundPosition: 'right 0.5rem center', 
                backgroundRepeat: 'no-repeat', 
                backgroundSize: '1.5em 1.5em' 
              }}
            >
              <option value="" disabled>선택</option>
              <option value="singleton">1 Baby</option>
              <option value="twin">2 Babies</option>
              </select>
            </div>
          
            <div style={{ marginTop: '48px' }}>
              <Button
                onClick={onSubmit}
                disabled={!isValid()}
                className="w-full"
                variant={isValid() ? 'primary' : 'ghost'}
              >
                계산하기
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};