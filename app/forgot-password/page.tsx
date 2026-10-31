'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AuthExperience } from '@/components/auth/AuthExperience';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/login');
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-center items-center p-4">
      <AuthExperience
        initialMode="forgot-password"
        onAuthSuccess={handleSuccess}
        onCancel={handleCancel}
        isModal={false}
      />
    </div>
  );
}
