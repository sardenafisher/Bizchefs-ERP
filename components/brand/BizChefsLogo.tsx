'use client';

import React from 'react';

interface BizChefsLogoProps {
  variant?: 'full' | 'mark' | 'horizontal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  theme?: 'dark' | 'light';
}

const sizeMap = {
  sm: { icon: 28, text: 'text-base', badge: 'text-[9px]', sub: 'text-[10px]' },
  md: { icon: 36, text: 'text-lg', badge: 'text-[10px]', sub: 'text-[11px]' },
  lg: { icon: 44, text: 'text-xl', badge: 'text-xs', sub: 'text-xs' },
  xl: { icon: 56, text: 'text-2xl', badge: 'text-xs', sub: 'text-sm' }
};

interface EmblemIconProps {
  dimension: number;
}

function EmblemIcon({ dimension }: EmblemIconProps) {
  return (
    <div
      style={{ width: dimension, height: dimension }}
      className="relative shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#e5a83b] via-[#d39e36] to-[#b88022] p-[1.5px] shadow-lg shadow-[#d39e36]/15 group-hover:shadow-[#d39e36]/30 transition-all"
    >
      <div className="w-full h-full bg-[#121316] rounded-[10px] flex items-center justify-center relative overflow-hidden">
        {/* Subtle geometric pattern */}
        <div className="absolute inset-0 bg-radial from-[#d39e36]/20 via-transparent to-transparent opacity-40" />

        {/* Official BizChefs Chef Hat Crown Icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/5 h-3/5 text-[#e5a83b] drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
        >
          {/* Chef Hat Crest Base & Pleats */}
          <path
            d="M6 18H18C18.5523 18 19 17.5523 19 17V16C19 15.4477 18.5523 15 18 15H6C5.44772 15 5 15.4477 5 16V17C5 17.5523 5.44772 18 6 18Z"
            fill="currentColor"
          />
          <path
            d="M6 14.5C4.61929 14.5 3.5 13.3807 3.5 12C3.5 10.7417 4.43139 9.69975 5.64258 9.52495C5.54924 9.03714 5.5 8.52737 5.5 8C5.5 5.51472 7.51472 3.5 10 3.5C11.1965 3.5 12.2783 3.96803 13.0768 4.73359C13.7842 4.12001 14.7188 3.75 15.75 3.75C17.9591 3.75 19.75 5.54086 19.75 7.75C19.75 8.1691 19.6853 8.57271 19.5658 8.95079C20.6974 9.27133 21.5 10.315 21.5 11.5C21.5 12.8807 20.3807 14 19 14"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Subtle Center Gem / Star */}
          <circle cx="12" cy="10" r="1.2" fill="#ffd166" />
        </svg>
      </div>
    </div>
  );
}

export function BizChefsLogo({
  variant = 'horizontal',
  size = 'md',
  showSubtitle = true,
  className = '',
  theme = 'dark'
}: BizChefsLogoProps) {
  const s = sizeMap[size];

  if (variant === 'mark') {
    return <EmblemIcon dimension={s.icon} />;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <EmblemIcon dimension={s.icon} />
      <div className="flex flex-col">
        <div className="flex items-center gap-2 leading-none">
          <span
            className={`font-bold tracking-tight ${s.text} ${
              theme === 'dark' ? 'text-white' : 'text-zinc-900'
            }`}
          >
            Biz<span className="text-[#e5a83b]">Chefs</span>
          </span>
          <span
            className={`font-mono font-bold tracking-wider uppercase px-1.5 py-0.5 rounded border ${s.badge} ${
              theme === 'dark'
                ? 'bg-[#1e1a12] text-[#e5a83b] border-[#d39e36]/40'
                : 'bg-amber-50 text-amber-900 border-amber-300'
            }`}
          >
            ERP
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`font-medium tracking-tight mt-1 ${s.sub} ${
              theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
            }`}
          >
            Commercial Enterprise Platform
          </span>
        )}
      </div>
    </div>
  );
}
