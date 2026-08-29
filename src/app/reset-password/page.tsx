'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();

  useEffect(() => {
    // Password reset flow is now handled entirely on the forgot-password page
    router.replace('/forgot-password');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <p className="text-sm text-gray-500">Redirecting...</p>
    </div>
  );
}
