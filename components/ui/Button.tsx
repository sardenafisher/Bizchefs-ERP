'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold-outline';
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
    md: 'text-sm px-4 py-2 gap-2 rounded-xl',
    lg: 'text-base px-6 py-3 gap-2.5 rounded-xl font-medium',
  };

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-[#e5a83b] via-[#d39e36] to-[#b88022] hover:from-[#f0b54d] hover:to-[#c68c29] text-zinc-950 font-semibold shadow-md shadow-[#d39e36]/20 border border-[#f0b54d]/30 active:scale-[0.98] transition-all duration-150',
    secondary:
      'bg-[#18191e] hover:bg-[#202228] text-white border border-[#27272a] hover:border-zinc-700 shadow-sm transition-all duration-150',
    'gold-outline':
      'bg-transparent hover:bg-[#d39e36]/10 text-[#e5a83b] border border-[#d39e36]/50 hover:border-[#d39e36] transition-all duration-150',
    outline:
      'bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 transition-all duration-150',
    ghost:
      'bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-all duration-150',
    danger:
      'bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm transition-all duration-150',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
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
