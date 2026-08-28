'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    if (authUtils.isAuthenticated()) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse text-primary font-semibold" style={{ fontFamily: 'Afacad, sans-serif' }}>Loading AfDB Dashboard...</div>
    </div>
  );
}
