import { create } from 'zustand';
import type { TargetPoint } from '../domain/targets';
import type { DistItem } from '../domain/distribution';

interface FormState {
  week?: number;
  height?: number;
  weight?: number;
  preWeight?: number;
  type?: 'singleton' | 'twin' | 'triplet' | 'quadruplet';
}

interface ResultState {
  targets: TargetPoint[];
  distribution: DistItem[];
}

interface AppStore {
  form: FormState;
  result: ResultState;
  setForm: (form: Partial<FormState>) => void;
  setResult: (result: ResultState) => void;
  resetForm: () => void;
}

export const useStore = create<AppStore>()((set) => ({
  form: {},
  result: {
    targets: [],
    distribution: []
  },
  setForm: (newForm) => set((state) => ({
    form: { ...state.form, ...newForm }
  })),
  setResult: (result) => set({ result }),
  resetForm: () => set({ 
    form: {},
    result: { targets: [], distribution: [] }
  })
}));