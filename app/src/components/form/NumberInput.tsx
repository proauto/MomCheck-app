import React, { type InputHTMLAttributes, useId } from 'react';

interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  value?: number;
  suffix?: string;
  label?: string;
  onChange: (value: number | undefined) => void;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  suffix,
  label,
  placeholder,
  min,
  max,
  step,
  onChange,
  disabled,
  className = '',
  ...props
}) => {
  const id = useId();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val === '' ? undefined : Number(val));
  };
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-text-default mb-xs">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          {...props}
          id={id}
          type="number"
          value={value ?? ''}
          onChange={handleChange}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          aria-label={label || placeholder}
          className={`w-full px-md py-sm bg-bg-field border border-border-subtle rounded-pill 
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
            disabled:bg-bg-subtle disabled:cursor-not-allowed
            placeholder:text-text-muted ${suffix ? 'pr-12' : ''} ${className}`}
        />
        {suffix && (
          <span 
            className="absolute right-md top-1/2 -translate-y-1/2 text-text-muted text-sm"
            aria-hidden="true"
          >
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};