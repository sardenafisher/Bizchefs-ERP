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
    md: 'text-sm px-4 py-2 gap-2 rounded-lg font-medium',
    lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5 rounded-lg font-semibold',
  };

  const variantClasses = {
    primary:
      'bg-[#d39e36] hover:bg-[#e5a83b] active:bg-[#b88022] text-zinc-950 font-semibold shadow-xs border border-[#e5a83b]/40 transition-colors',
    secondary:
      'bg-[#13171f] hover:bg-[#1a202c] text-[#f3f4f6] border border-[#262626] hover:border-zinc-600 shadow-xs transition-colors',
    'gold-outline':
      'bg-transparent hover:bg-[#d39e36]/10 text-[#d39e36] border border-[#d39e36]/60 hover:border-[#d39e36] transition-colors',
    outline:
      'bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-[#262626] transition-colors',
    ghost:
      'bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors',
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
