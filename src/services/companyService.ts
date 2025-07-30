// src/services/companyService.ts
import type { Company } from '../lib/types';

const CUSTOM_BACKEND_URL = process.env['NEXT_PUBLIC_CUSTOM_BACKEND_URL'] || 'http://localhost:5000';

export async function fetchCompaniesFromBackend(): Promise<{
  companies: Company[];
  hasMore: boolean;
  nextCursor?: string;
}> {
  console.log('[Frontend Service] Calling fetchCompaniesFromBackend.');
  const targetUrl = `${CUSTOM_BACKEND_URL}/api/companies?timestamp=${Date.now()}`;
  console.log('[Frontend Service] Target Backend URL for GET /api/companies:', targetUrl);

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(
      `[Frontend Service] GET /api/companies - Backend response status: ${response.status}`
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: `Failed to fetch companies. Status: ${response.status}` }));
      console.error(
        '[Frontend Service] GET /api/companies - Backend error response (JSON):',
        errorData
      );
      throw new Error(errorData.message);
    }

    const responseData = await response.json();
    console.log('[Frontend Service] Raw backend response:', responseData);
    let rawCompanies: any[] = [];

    if (Array.isArray(responseData)) {
      rawCompanies = responseData;
    } else if (responseData && Array.isArray(responseData.companies)) {
      rawCompanies = responseData.companies;
    } else {
      console.warn(
        '[Frontend Service] Unexpected companies response format, defaulting to empty array'
      );
    }

    const companies: Company[] = rawCompanies.map((company: any) => ({
      id: company._id,
      name: company.companyName || 'Company Name Not Available',
      industry: company.industry || 'Technology',
      description: company.companyDescription || 'No company description available.',
      cultureHighlights: [],
      logoUrl: company.mediaUrl || null,
      jobOpenings: [],
      recruiterUserId: company.userId,
      dataAiHint: 'company logo',
    }));

    console.log(`[Frontend Service] Transformed ${companies.length} companies.`);
    return { companies, hasMore: false };
  } catch (error: any) {
    console.error('[Frontend Service] Error in fetchCompaniesFromBackend service:', error.message);
    console.error('[Frontend Service] Full error object for fetchCompaniesFromBackend:', error);
    throw error;
  }
}
