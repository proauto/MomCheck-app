import React, { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  size?: 'lg' | 'md';
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary',
  size = 'lg',
  disabled = false,
  children,
  className = '',
  ...props 
}) => {
  const baseClasses = 'font-semibold transition-all rounded-pill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500';
  
  const variantClasses = {
    primary: `bg-brand-500 text-text-onBrand hover:brightness-105 active:brightness-95 disabled:bg-border-subtle disabled:text-text-muted disabled:cursor-not-allowed`,
    ghost: `bg-border-subtle text-text-muted hover:bg-bg-subtle active:bg-border-subtle disabled:text-text-muted disabled:cursor-not-allowed`
  };
  
  const sizeClasses = {
    lg: 'px-xl py-md text-base',
    md: 'px-lg py-sm text-sm'
  };
  
  return (
    <button
      {...props}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      role="button"
    >
      {children}
    </button>
  );
};