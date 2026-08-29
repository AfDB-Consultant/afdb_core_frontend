'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/lib/auth';
import PageLoader from '@/components/ui/PageLoader';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    if (authUtils.isAuthenticated()) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);
  return <PageLoader />;
}
