'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function RequireRole({ role, children }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== role) {
      router.replace(`/dashboard/${user.role}`);
    }
  }, [ready, user, role, router]);

  if (!ready || !user || user.role !== role) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-paper-50 dark:bg-ink-950 text-ink-500">
        Loading BuildNova…
      </div>
    );
  }

  return children;
}
