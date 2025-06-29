'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { UserPreferencesProvider } from '@/contexts/UserPreferencesContext';
import type { ReactNode } from 'react';

export function AuthWrapper({ children }: { children: ReactNode }) {
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <UserPreferencesProvider currentUser={user}>
      {children}
    </UserPreferencesProvider>
  );
}
