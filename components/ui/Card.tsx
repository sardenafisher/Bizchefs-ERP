'use client';

import React from 'react';

export function Card({
  children,
  className = '',
  goldAccent = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { goldAccent?: boolean }) {
  return (
    <div
      className={`rounded-xl bg-white border text-neutral-900 shadow-xs transition-colors ${
        goldAccent
          ? 'border-[#d39e36] ring-1 ring-[#d39e36]/30'
          : 'border-neutral-200 hover:border-neutral-300'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 pb-3 flex flex-col space-y-1.5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-base font-semibold tracking-tight text-neutral-950 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-xs text-neutral-600 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`p-6 pt-0 flex items-center border-t border-neutral-100 mt-4 pt-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
