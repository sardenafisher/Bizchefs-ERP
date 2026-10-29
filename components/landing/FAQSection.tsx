'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ERP_FAQS } from '@/lib/theme/tokens';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 bg-[#090a0d] text-[#f3f4f6] border-b border-[#262626]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-4">
          <Badge variant="gold" size="md">
            Frequently Asked Questions
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Common Subscription & Operations Questions
          </h2>
          <p className="text-sm text-zinc-400">
            Everything you need to know about subscribing to and deploying BizChefs ERP.
          </p>
        </div>

        <div className="space-y-3">
          {ERP_FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-[#13171f] border border-[#262626] overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full p-5 text-left flex items-center justify-between text-sm sm:text-base font-semibold text-white hover:text-[#d39e36] transition-colors cursor-pointer"
                aria-expanded={openIdx === idx}
              >
                <span>{faq.question}</span>
                {openIdx === idx ? (
                  <ChevronUp className="w-4 h-4 text-[#d39e36] shrink-0 ml-4" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0 ml-4" />
                )}
              </button>

              {openIdx === idx && (
                <div className="px-5 pb-5 pt-0 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-[#262626]/60 mt-1">
                  <div className="pt-3">{faq.answer}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
