'use client';

import React from 'react';

export function Card({
  children,
  className = '',
  goldGlow = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { goldGlow?: boolean }) {
  return (
    <div
      className={`rounded-2xl bg-[#121316] border border-[#27272a] text-zinc-100 transition-all ${
        goldGlow
          ? 'shadow-lg shadow-[#d39e36]/10 hover:border-[#d39e36]/50 hover:shadow-[#d39e36]/15'
          : 'hover:border-zinc-700'
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
    <div className={`p-6 pb-4 flex flex-col space-y-1.5 ${className}`} {...props}>
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
      className={`text-lg font-semibold tracking-tight text-white ${className}`}
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
    <p className={`text-sm text-zinc-400 leading-relaxed ${className}`} {...props}>
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
      className={`p-6 pt-0 flex items-center border-t border-[#27272a]/60 mt-4 pt-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
