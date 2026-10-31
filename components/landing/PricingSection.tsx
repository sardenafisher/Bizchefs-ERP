'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ERP_SUBSCRIPTION_PLANS,
  ERP_EXCHANGE_RATE_NOTE
} from '@/lib/theme/tokens';
import { Check, Info, ArrowRight } from 'lucide-react';

interface PricingSectionProps {
  onSelectPlan: (planId: 'starter' | 'growth' | 'enterprise') => void;
  onRequestDemo: (planId?: 'starter' | 'growth' | 'enterprise') => void;
}

export function PricingSection({ onSelectPlan, onRequestDemo }: PricingSectionProps) {
  const [currencyMode, setCurrencyMode] = useState<'EGP' | 'USD'>('EGP');

  return (
    <section id="pricing" className="py-24 bg-white text-neutral-900 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <Badge variant="gold" size="md">
            Commercial Subscription Plans
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950">
            Transparent Subscription Tiers for Foodservice Operations
          </h2>
          <p className="text-sm sm:text-base text-neutral-600">
            Rent full access to BizChefs ERP on annual or monthly plans. Every tier includes dedicated tenant isolation,
            double-entry ledger enforcement, and automated document numbering.
          </p>

          {/* Currency Toggle */}
          <div className="pt-4 flex items-center justify-center">
            <div className="inline-flex items-center p-1 rounded-lg bg-neutral-100 border border-neutral-200">
              <button
                type="button"
                onClick={() => setCurrencyMode('EGP')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  currencyMode === 'EGP'
                    ? 'bg-white text-neutral-950 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                Egyptian Pounds (EGP) — Primary
              </button>
              <button
                type="button"
                onClick={() => setCurrencyMode('USD')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  currencyMode === 'USD'
                    ? 'bg-white text-neutral-950 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                USD Reference (~50 EGP/$)
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {ERP_SUBSCRIPTION_PLANS.map((plan) => (
            <Card
              key={plan.id}
              goldAccent={plan.isRecommended}
              className={`flex flex-col justify-between relative bg-white ${
                plan.isRecommended
                  ? 'border-2 border-neutral-950 shadow-md ring-0'
                  : 'border border-neutral-200 hover:border-neutral-300 shadow-xs'
              }`}
            >
              {plan.isRecommended && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-neutral-950 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                    Recommended for Multi-Branch Groups
                  </span>
                </div>
              )}

              <div>
                <CardHeader className="pt-7">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-neutral-950 font-bold">
                      {plan.name}
                    </CardTitle>
                    <span className="text-xs font-mono text-[#b88022] font-semibold">
                      {plan.tagline}
                    </span>
                  </div>
                  <CardDescription className="text-xs text-neutral-600 mt-2 min-h-[36px]">
                    {plan.description}
                  </CardDescription>

                  {/* Price display */}
                  <div className="pt-4 pb-2 border-b border-neutral-100">
                    {plan.priceEGP !== null ? (
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl sm:text-4xl font-extrabold text-neutral-950 font-mono tabular-nums">
                            {currencyMode === 'EGP'
                              ? `${plan.priceEGP.toLocaleString()} EGP`
                              : `$${plan.priceUSDRef?.toLocaleString()}`}
                          </span>
                          <span className="text-xs text-neutral-500 font-sans">
                            / month
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-1">
                          {currencyMode === 'EGP'
                            ? `Est. ~$${plan.priceUSDRef} USD/mo (reference rate)`
                            : `Billed as ${plan.priceEGP.toLocaleString()} EGP / mo`}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 font-mono">
                          Custom Pricing
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-1">
                          Enterprise volume agreement tailored to your scale
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-4">
                  {/* Capacity Limits Matrix */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-center text-xs">
                    <div>
                      <div className="text-[10px] text-neutral-500 uppercase">Users</div>
                      <div className="font-bold text-neutral-950 font-mono tabular-nums">
                        {plan.maxUsers >= 50 ? '50+' : plan.maxUsers}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-neutral-500 uppercase">Invoices</div>
                      <div className="font-bold text-neutral-950 font-mono tabular-nums">
                        {plan.maxInvoicesPerMonth >= 10000 ? 'Unlimited' : plan.maxInvoicesPerMonth.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-neutral-500 uppercase">Warehouses</div>
                      <div className="font-bold text-neutral-950 font-mono tabular-nums">
                        {plan.maxWarehouses >= 999 ? 'Unlimited' : plan.maxWarehouses}
                      </div>
                    </div>
                  </div>

                  {/* Included Features */}
                  <div className="space-y-2 pt-2">
                    <div className="text-[11px] font-semibold text-neutral-900 uppercase tracking-wider">
                      Included Capabilities
                    </div>
                    <ul className="space-y-2 text-xs text-neutral-700">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-[#d39e36] shrink-0 mt-0.5" />
                          <span className="leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </div>

              <CardFooter className="pt-4 border-t border-neutral-100">
                {plan.ctaMode === 'register' ? (
                  <Button
                    variant={plan.isRecommended ? 'primary' : 'secondary'}
                    size="md"
                    fullWidth
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    onClick={() => onSelectPlan(plan.id)}
                  >
                    {plan.ctaText}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    onClick={() => onRequestDemo('enterprise')}
                  >
                    {plan.ctaText}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Currency & Billing Transparency Notice */}
        <div className="mt-12 p-5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 text-neutral-950 font-semibold">
            <Info className="w-4 h-4 text-[#d39e36] shrink-0" />
            <span>Commercial Subscription & Billing Model</span>
          </div>
          <p className="leading-relaxed">
            {ERP_EXCHANGE_RATE_NOTE.legalDisclaimer} Payment gateways (such as local bank transfer, corporate check, or approved merchant payment orders) are coordinated directly with your account administrator upon tenant provisioning. Automated recurring card charges are not processed directly in the browser.
          </p>
        </div>
      </div>
    </section>
  );
}
