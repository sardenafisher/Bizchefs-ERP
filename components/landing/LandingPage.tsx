'use client';

import React, { useState } from 'react';
import { LandingHeader } from './LandingHeader';
import { HeroSection } from './HeroSection';
import { BenefitsSection } from './BenefitsSection';
import { ModulesSection } from './ModulesSection';
import { PricingSection } from './PricingSection';
import { HowItWorksSection } from './HowItWorksSection';
import { SecurityTrustSection } from './SecurityTrustSection';
import { FAQSection } from './FAQSection';
import { LandingFooter } from './LandingFooter';
import { DemoRequestModal } from './DemoRequestModal';
import { ERPDatabaseState } from '@/lib/db/database';

interface LandingPageProps {
  onEnterWorkspace: (module?: string) => void;
  onOpenAuth: (
    mode?: 'signin' | 'signup' | 'forgot-password' | 'reset-password' | 'onboarding' | 'tenant-select',
    plan?: 'starter' | 'growth' | 'enterprise'
  ) => void;
  dbState: ERPDatabaseState;
  supabaseStatus: 'unconfigured' | 'unauthenticated' | 'connected' | 'error';
  isAuthenticated: boolean;
}

export function LandingPage({
  onEnterWorkspace,
  onOpenAuth,
  dbState,
  supabaseStatus,
  isAuthenticated
}: LandingPageProps) {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [selectedPlanForDemo, setSelectedPlanForDemo] = useState<'starter' | 'growth' | 'enterprise'>('growth');

  const activeTenant = dbState.tenants.find((t) => t.id === dbState.activeTenantId);

  const handleOpenDemoModal = (planId?: 'starter' | 'growth' | 'enterprise') => {
    if (planId) setSelectedPlanForDemo(planId);
    setIsDemoModalOpen(true);
  };

  const handleSelectPlan = (planId: 'starter' | 'growth' | 'enterprise') => {
    if (planId === 'enterprise') {
      handleOpenDemoModal('enterprise');
    } else {
      onOpenAuth('signup', planId);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 flex flex-col selection:bg-[#d39e36] selection:text-black">
      <LandingHeader
        onEnterWorkspace={onEnterWorkspace}
        onOpenAuth={(mode) => onOpenAuth(mode, 'growth')}
        onRequestDemo={() => handleOpenDemoModal('growth')}
        isAuthenticated={isAuthenticated}
        activeTenantName={activeTenant?.name}
      />

      <main className="flex-1">
        <HeroSection
          onEnterWorkspace={onEnterWorkspace}
          onOpenAuth={(mode) => onOpenAuth(mode, 'growth')}
          onRequestDemo={() => handleOpenDemoModal('growth')}
          dbState={dbState}
          supabaseStatus={supabaseStatus}
        />
        <BenefitsSection />
        <ModulesSection onEnterWorkspace={onEnterWorkspace} />
        <PricingSection
          onSelectPlan={handleSelectPlan}
          onRequestDemo={handleOpenDemoModal}
        />
        <HowItWorksSection />
        <SecurityTrustSection />
        <FAQSection />
      </main>

      <LandingFooter
        onEnterWorkspace={onEnterWorkspace}
        onOpenAuth={(mode) => onOpenAuth(mode, 'growth')}
        onRequestDemo={() => handleOpenDemoModal('enterprise')}
      />

      {/* Enterprise Consultation & Demo Modal */}
      <DemoRequestModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        selectedPlanId={selectedPlanForDemo}
      />
    </div>
  );
}
