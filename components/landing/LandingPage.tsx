'use client';

import React from 'react';
import { LandingHeader } from './LandingHeader';
import { HeroSection } from './HeroSection';
import { ModulesSection } from './ModulesSection';
import { BenefitsSection } from './BenefitsSection';
import { HowItWorksSection } from './HowItWorksSection';
import { SecurityTrustSection } from './SecurityTrustSection';
import { LandingFooter } from './LandingFooter';
import { ERPDatabaseState } from '@/lib/db/database';

interface LandingPageProps {
  onEnterWorkspace: (module?: string) => void;
  onOpenAuth: (mode?: 'signin' | 'signup' | 'forgot-password' | 'reset-password' | 'onboarding' | 'tenant-select') => void;
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
  const activeTenant = dbState.tenants.find(t => t.id === dbState.activeTenantId);

  return (
    <div className="min-h-screen bg-[#0c0e12] text-white flex flex-col selection:bg-[#d39e36] selection:text-black">
      <LandingHeader
        onEnterWorkspace={onEnterWorkspace}
        onOpenAuth={onOpenAuth}
        isAuthenticated={isAuthenticated}
        activeTenantName={activeTenant?.name}
      />
      <main className="flex-1">
        <HeroSection
          onEnterWorkspace={onEnterWorkspace}
          onOpenAuth={onOpenAuth}
          dbState={dbState}
          supabaseStatus={supabaseStatus}
        />
        <ModulesSection onEnterWorkspace={onEnterWorkspace} />
        <BenefitsSection />
        <HowItWorksSection />
        <SecurityTrustSection />
      </main>
      <LandingFooter
        onEnterWorkspace={onEnterWorkspace}
        onOpenAuth={onOpenAuth}
      />
    </div>
  );
}
