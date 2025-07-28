// src/services/interactionService.ts
const CUSTOM_BACKEND_URL = process.env['NEXT_PUBLIC_CUSTOM_BACKEND_URL'] || 'http://localhost:5000';

interface PassResponse {
  message: string;
  passedCandidateProfileIds?: string[];
  passedCompanyProfileIds?: string[];
}

const makePassRequest = async (url: string): Promise<PassResponse> => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: `Failed with status: ${response.status}` }));
      throw new Error(errorData.message);
    }
    return await response.json();
  } catch (error: any) {
    console.error(`Error in pass/retrieve request to ${url}:`, error);
    throw new Error(error.message || 'Server interaction failed.');
  }
};

export async function passCandidate(userId: string, candidateId: string): Promise<PassResponse> {
  return makePassRequest(`${CUSTOM_BACKEND_URL}/api/users/${userId}/pass-candidate/${candidateId}`);
}

export async function passCompany(userId: string, companyId: string): Promise<PassResponse> {
  return makePassRequest(`${CUSTOM_BACKEND_URL}/api/users/${userId}/pass-company/${companyId}`);
}

export async function retrieveCandidate(
  userId: string,
  candidateId: string
): Promise<PassResponse> {
  return makePassRequest(
    `${CUSTOM_BACKEND_URL}/api/users/${userId}/retrieve-candidate/${candidateId}`
  );
}

export async function retrieveCompany(userId: string, companyId: string): Promise<PassResponse> {
  return makePassRequest(`${CUSTOM_BACKEND_URL}/api/users/${userId}/retrieve-company/${companyId}`);
}
