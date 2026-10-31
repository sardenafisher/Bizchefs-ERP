'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { ERP_FAQS } from '@/lib/theme/tokens';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 bg-[#fafafa] text-neutral-900 border-b border-neutral-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-4">
          <Badge variant="gold" size="md">
            Frequently Asked Questions
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950">
            Common Subscription & Operations Questions
          </h2>
          <p className="text-sm text-neutral-600">
            Everything you need to know about subscribing to and deploying BizChefs ERP.
          </p>
        </div>

        <div className="space-y-3">
          {ERP_FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-white border border-neutral-200 overflow-hidden shadow-2xs transition-colors"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full p-5 text-left flex items-center justify-between text-sm sm:text-base font-semibold text-neutral-950 hover:text-[#b88022] transition-colors cursor-pointer"
                aria-expanded={openIdx === idx}
              >
                <span>{faq.question}</span>
                {openIdx === idx ? (
                  <ChevronUp className="w-4 h-4 text-[#d39e36] shrink-0 ml-4" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0 ml-4" />
                )}
              </button>

              {openIdx === idx && (
                <div className="px-5 pb-5 pt-0 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 mt-1">
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
