'use client';

import React from 'react';
import { AuthExperience, AuthMode } from './AuthExperience';
import { Tenant } from '@/lib/types/erp';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (tenantId?: string) => void;
  initialMode?: AuthMode;
  userTenants?: Tenant[];
}

export function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'signin',
  userTenants = []
}: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <AuthExperience
        initialMode={initialMode}
        userTenants={userTenants}
        onAuthSuccess={(tenantId) => {
          onAuthSuccess(tenantId);
          onClose();
        }}
        onCancel={onClose}
        isModal={true}
      />
    </div>
  );
}
