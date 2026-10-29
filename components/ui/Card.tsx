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
      className={`rounded-xl bg-[#13171f] border text-[#f3f4f6] transition-colors ${
        goldAccent
          ? 'border-[#d39e36]/40 hover:border-[#d39e36]'
          : 'border-[#262626] hover:border-zinc-700'
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
      className={`text-base font-semibold tracking-tight text-[#f3f4f6] ${className}`}
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
    <p className={`text-xs text-zinc-400 leading-relaxed ${className}`} {...props}>
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
      className={`p-6 pt-0 flex items-center border-t border-[#262626] mt-4 pt-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
