import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { useStore } from '../../app/store';

export const ResetButton: React.FC = () => {
  const navigate = useNavigate();
  const resetForm = useStore(state => state.resetForm);
  
  const handleReset = () => {
    resetForm();
    navigate('/');
  };
  
  return (
    <Button
      variant="ghost"
      size="md"
      onClick={handleReset}
      aria-label="초기화"
    >
      <svg className="w-4 h-4 mr-xs inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      다시 계산
    </Button>
  );
};