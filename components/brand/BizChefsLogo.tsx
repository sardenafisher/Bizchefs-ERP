'use client';

import React from 'react';
import Image from 'next/image';

interface BizChefsLogoProps {
  variant?: 'full' | 'mark' | 'horizontal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  theme?: 'dark' | 'light';
}

const sizeMap = {
  sm: {
    iconSize: 28,
    fullSize: 34,
    text: 'text-sm font-semibold tracking-tight',
    badge: 'text-[9px] px-1.5 py-0.5',
    sub: 'text-[10px]'
  },
  md: {
    iconSize: 34,
    fullSize: 42,
    text: 'text-base font-semibold tracking-tight',
    badge: 'text-[10px] px-1.5 py-0.5',
    sub: 'text-[11px]'
  },
  lg: {
    iconSize: 42,
    fullSize: 52,
    text: 'text-lg font-bold tracking-tight',
    badge: 'text-[11px] px-2 py-0.5',
    sub: 'text-xs'
  },
  xl: {
    iconSize: 52,
    fullSize: 68,
    text: 'text-xl font-bold tracking-tight',
    badge: 'text-xs px-2 py-0.5',
    sub: 'text-xs'
  }
};

export function BizChefsLogo({
  variant = 'horizontal',
  size = 'md',
  showSubtitle = true,
  className = '',
  theme = 'light'
}: BizChefsLogoProps) {
  const s = sizeMap[size];

  // Authentic Emblem Icon Mark
  if (variant === 'mark') {
    return (
      <div
        className={`relative inline-flex items-center justify-center shrink-0 rounded-lg bg-white p-1 border border-neutral-200 shadow-xs ${className}`}
        style={{ width: s.iconSize, height: s.iconSize }}
      >
        <Image
          src="/BizChefs-emblem-transparent.png"
          alt="BizChefs Emblem"
          width={s.iconSize - 6}
          height={s.iconSize - 6}
          className="object-contain"
          priority
          unoptimized
        />
      </div>
    );
  }

  // Official Full Logo (Using newly provided official BizChefs logo file)
  if (variant === 'full') {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        <div
          className="relative shrink-0 flex items-center justify-center rounded-lg bg-white p-0.5 border border-neutral-200 shadow-xs overflow-hidden"
          style={{ width: s.fullSize, height: s.fullSize }}
        >
          <Image
            src="/BizChefs-logo.png"
            alt="BizChefs Official Logo"
            width={s.fullSize}
            height={s.fullSize}
            className="object-contain"
            priority
            unoptimized
          />
        </div>
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-bold tracking-tight ${s.text} text-neutral-950`}>
              Biz<span className="text-[#d39e36]">Chefs</span>
            </span>
            <span
              className={`font-mono font-bold tracking-wider uppercase rounded border ${s.badge} bg-amber-50 text-amber-900 border-amber-300`}
            >
              ERP
            </span>
          </div>
          {showSubtitle && (
            <span className={`tracking-tight mt-1 font-normal ${s.sub} text-neutral-500`}>
              Commercial Operations System
            </span>
          )}
        </div>
      </div>
    );
  }

  // Authentic Horizontal Lockup (Emblem + Typography + ERP Badge)
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div
        className="relative shrink-0 flex items-center justify-center rounded-lg bg-white p-1 border border-neutral-200 shadow-xs"
        style={{ width: s.iconSize, height: s.iconSize }}
      >
        <Image
          src="/BizChefs-emblem-transparent.png"
          alt="BizChefs Emblem"
          width={s.iconSize - 6}
          height={s.iconSize - 6}
          className="object-contain"
          priority
          unoptimized
        />
      </div>

      <div className="flex flex-col text-left">
        <div className="flex items-center gap-2 leading-none">
          <span
            className={`${s.text} ${
              theme === 'dark' ? 'text-white' : 'text-neutral-950'
            }`}
          >
            Biz<span className="text-[#d39e36]">Chefs</span>
          </span>
          <span
            className={`font-mono font-bold tracking-wider uppercase rounded border ${s.badge} ${
              theme === 'dark'
                ? 'bg-[#13171f] text-[#e5a83b] border-[#d39e36]/40'
                : 'bg-amber-50 text-amber-900 border-amber-300'
            }`}
          >
            ERP
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`tracking-tight mt-1 font-normal ${s.sub} ${
              theme === 'dark' ? 'text-zinc-400' : 'text-neutral-500'
            }`}
          >
            Commercial Operations System
          </span>
        )}
      </div>
    </div>
  );
}
