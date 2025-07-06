'use client';

import type { ReactNode } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { UserPreferencesProvider } from '@/contexts/UserPreferencesContext';
import { auth } from '@/lib/firebase';

export function AuthWrapper({ children }: { children: ReactNode }) {
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <UserPreferencesProvider currentUser={user ?? null}>{children}</UserPreferencesProvider>
  );
}
