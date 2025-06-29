import { NextResponse } from 'next/server';
import type { UserProfileData } from '@/lib/types/resume-optimizer';

interface BackendUser {
  _id?: string;
  id?: string;
  name?: string;
  displayName?: string;
  email?: string;
  selectedRole?: 'jobseeker' | 'recruiter';
  profileHeadline?: string;
  profileExperienceSummary?: string;
  profileSkills?: string | string[];
  profileDesiredWorkStyle?: string;
  profileWorkExperienceLevel?: string;
  profileEducationLevel?: string;
  profileLocationPreference?: string;
  profileAvailability?: string;
  profileJobTypePreference?: string;
  profileSalaryExpectationMin?: number;
  profileSalaryExpectationMax?: number;
  companyName?: string;
  companyIndustry?: string;
  companyScale?: string;
  companyDescription?: string;
  companyCultureHighlights?: string[];
  companyNeeds?: string;
  linkedinUrl?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    notificationChannels?: {
      email?: boolean;
      sms?: boolean;
      inAppToast?: boolean;
      inAppBanner?: boolean;
    };
    notificationSubscriptions?: {
      companyReplies?: boolean;
      matchUpdates?: boolean;
      applicationStatusChanges?: boolean;
      platformAnnouncements?: boolean;
      welcomeAndOnboardingEmails?: boolean;
      contentAndBlogUpdates?: boolean;
      featureAndPromotionUpdates?: boolean;
    };
  };
  wizardCompleted?: boolean;
  onboardingCompletedAt?: string;
}

export const dynamic = 'force-dynamic'; // Ensure fresh data on each request

// GET /api/user/profile
export async function GET(request: Request) {
  // Verify backend URL is configured
  const backendUrl = process.env['NEXT_PUBLIC_CUSTOM_BACKEND_URL'];
  if (!backendUrl) {
    console.error('Backend URL not configured');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }
  try {
    const headers = request.headers;
    const userId = headers.get('x-user-id');
    const authToken = headers.get('authorization');

    // Validate required headers
    if (!userId || !authToken) {
      return NextResponse.json({ error: 'Authentication credentials required' }, { status: 401 });
    }

    const response = await fetch(`${backendUrl}/api/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      let error = { message: 'Failed to fetch profile' };
      try {
        error = await response.json();
      } catch (e) {
        console.error('Failed to parse error response:', e);
      }
      return NextResponse.json(
        { error: error.message || 'Failed to fetch profile' },
        { status: response.status }
      );
    }

    const profileData = (await response.json()) as BackendUser;

    // Transform backend data to frontend format
    const transformedData: UserProfileData = {
      name: profileData.name || profileData.displayName || '',
      email: profileData.email || '',
      phone: '',
      location: profileData.profileLocationPreference || '',
      linkedinUrl: profileData.linkedinUrl || '',
      summary: profileData.profileExperienceSummary || profileData.profileHeadline || '',
      skills: Array.isArray(profileData.profileSkills)
        ? profileData.profileSkills
        : profileData.profileSkills?.split(',').map((s: string) => s.trim()) || [],
      experience: [
        {
          title: profileData.profileHeadline || 'Professional',
          company: profileData.companyName || 'Company',
          duration: profileData.profileWorkExperienceLevel || '',
          description: profileData.profileExperienceSummary || '',
          achievements: [],
          technologies: [],
        },
      ],
      education: [
        {
          degree: profileData.profileEducationLevel || 'Degree',
          school: 'Educational Institution',
          year: new Date().getFullYear().toString(),
        },
      ],
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('[GET /api/user/profile] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
