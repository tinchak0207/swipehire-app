'use client';

import { InterviewGuidePage } from '@/components/pages/InterviewGuidePage';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

export default function InterviewGuideRoute() {
  const { fullBackendUser } = useUserPreferences();

  const isGuestMode = !fullBackendUser;
  const currentUserRole = fullBackendUser?.selectedRole || null;

  return <InterviewGuidePage isGuestMode={isGuestMode} currentUserRole={currentUserRole} />;
}
