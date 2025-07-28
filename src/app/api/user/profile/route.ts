import { NextResponse } from 'next/server';
import type { UserProfileData } from '@/lib/types/resume-optimizer';

interface BackendUser {
  _id?: string;
  name?: string;
  email?: string;
  selectedRole?: 'jobseeker' | 'recruiter';
  // ... other fields from your backend user model
}

async function validateRequest(request: Request) {
  const backendUrl = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL;
  if (!backendUrl) {
    throw new Error('Server configuration error');
  }

  const userId = request.headers.get('x-user-id');
  const authToken = request.headers.get('authorization');

  if (!userId || !authToken) {
    throw new Error('Authentication credentials required');
  }

  return { backendUrl, userId, authToken };
}

async function fetchUserData(
  backendUrl: string,
  userId: string,
  authToken: string
): Promise<BackendUser> {
  const response = await fetch(`${backendUrl}/api/users/${userId}`, {
    headers: { Authorization: authToken },
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch profile' }));
    throw new Error(error.message || 'Failed to fetch profile');
  }

  return response.json();
}

function transformProfileData(profileData: BackendUser): UserProfileData {
  return {
    name: profileData.name || '',
    email: profileData.email || '',
    phone: '', // Assuming not in backend model
    location: '', // Assuming not in backend model
    linkedinUrl: '', // Assuming not in backend model
    summary: '', // Assuming not in backend model
    skills: [],
    experience: [],
    education: [],
  };
}

export async function GET(request: Request) {
  try {
    const { backendUrl, userId, authToken } = await validateRequest(request);
    const profileData = await fetchUserData(backendUrl, userId, authToken);
    const transformedData = transformProfileData(profileData);
    return NextResponse.json(transformedData);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message === 'Authentication credentials required' ? 401 : 500;
    console.error('[GET /api/user/profile] Error:', message);
    return NextResponse.json({ error: message }, { status });
  }
}
