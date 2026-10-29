'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AuthExperience } from '@/components/auth/AuthExperience';

export default function RegisterPage() {
  const router = useRouter();

  const handleSuccess = (tenantId?: string) => {
    if (tenantId) {
      router.push(`/?tenant=${tenantId}&view=app`);
    } else {
      router.push('/?view=app');
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#0c0e12] flex flex-col justify-center items-center p-4">
      <AuthExperience
        initialMode="signup"
        onAuthSuccess={handleSuccess}
        onCancel={handleCancel}
        isModal={false}
      />
    </div>
  );
}
