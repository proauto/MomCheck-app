import React, { type SelectHTMLAttributes, useId } from 'react';

interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  value?: string | number;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  onChange: (value: string | number) => void;
}

export const Select: React.FC<SelectProps> = ({
  value,
  options,
  label,
  placeholder,
  onChange,
  disabled,
  className = '',
  ...props
}) => {
  const id = useId();
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-text-default mb-xs">
          {label}
        </label>
      )}
      <select
        {...props}
        id={id}
        value={value ?? ''}
        onChange={handleChange}
        disabled={disabled}
        className={`w-full px-md py-sm bg-bg-field border border-border-subtle rounded-pill 
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
          disabled:bg-bg-subtle disabled:cursor-not-allowed
          text-text-default ${className}`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};