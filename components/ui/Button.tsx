'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gold' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold-outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
    md: 'text-sm px-4 py-2 gap-2 rounded-lg font-medium',
    lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5 rounded-lg font-semibold',
  };

  const variantClasses = {
    primary:
      'bg-neutral-950 hover:bg-neutral-800 active:bg-black text-white font-medium shadow-xs transition-colors',
    gold:
      'bg-[#d39e36] hover:bg-[#e5a83b] active:bg-[#b88022] text-neutral-950 font-semibold shadow-xs border border-[#d39e36]/30 transition-colors',
    secondary:
      'bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-300 shadow-xs hover:border-neutral-400 transition-colors',
    'gold-outline':
      'bg-transparent hover:bg-[#d39e36]/10 text-[#b88022] border border-[#d39e36] transition-colors font-medium',
    outline:
      'bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 hover:border-neutral-400 transition-colors',
    ghost:
      'bg-transparent hover:bg-neutral-100 text-neutral-700 hover:text-neutral-950 transition-colors',
    danger:
      'bg-red-600 hover:bg-red-700 text-white font-medium shadow-xs transition-colors',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}
