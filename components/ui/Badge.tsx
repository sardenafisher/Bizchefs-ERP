'use client';

import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'gold' | 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}: BadgeProps) {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-medium tracking-wide',
    md: 'text-xs px-2.5 py-0.5 font-medium tracking-wide',
  };

  const variantClasses = {
    gold: 'bg-amber-50 text-amber-900 border border-amber-300',
    default: 'bg-neutral-100 text-neutral-800 border border-neutral-200',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border border-rose-200',
    info: 'bg-sky-50 text-sky-800 border border-sky-200',
    outline: 'bg-transparent text-neutral-600 border border-neutral-300',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md select-none ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
