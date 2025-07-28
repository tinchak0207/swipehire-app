// src/services/interviewService.ts

import type {
  CompanyInsight,
  CompanyResearchRequest,
  FollowUpSchedule,
  Industry,
  InterviewCalendar,
  InterviewGuideRequest,
  InterviewGuideResponse,
  InterviewPhase,
  InterviewProgress,
  InterviewQuestion,
  JobAnalysis,
  JobAnalysisRequest,
  MockInterviewRequest,
  MockInterviewSession,
  PreparationTip,
  ThankYouGenerationRequest,
  ThankYouTemplate,
  UserInterviewProfile,
} from '../lib/types';
import { InterviewDifficulty, InterviewType, ResponseFramework } from '../lib/types';

const CUSTOM_BACKEND_URL = process.env['NEXT_PUBLIC_CUSTOM_BACKEND_URL'] || 'http://localhost:5000';

// Question Bank Service
export async function fetchInterviewQuestions(
  request: InterviewGuideRequest
): Promise<InterviewGuideResponse> {
  console.log('[Frontend Service] Fetching interview questions with request:', request);

  const params = new URLSearchParams();
  if (request.phase) params.append('phase', request.phase);
  if (request.industry) params.append('industry', request.industry);
  if (request.interviewType) params.append('interviewType', request.interviewType);
  if (request.difficulty) params.append('difficulty', request.difficulty);
  if (request.limit) params.append('limit', request.limit.toString());
  if (request.offset) params.append('offset', request.offset.toString());

  const targetUrl = `${CUSTOM_BACKEND_URL}/api/interview/questions?${params.toString()}`;

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Failed to fetch interview questions. Status: ${response.status}`,
      }));
      throw new Error(errorData.message);
    }

    const result: InterviewGuideResponse = await response.json();
    console.log(`[Frontend Service] Fetched ${result.questions.length} interview questions`);
    return result;
  } catch (error: any) {
    console.error('[Frontend Service] Error fetching interview questions:', error.message);
    throw error;
  }
}

export async function saveUserInterviewProfile(
  userId: string,
  profile: Partial<UserInterviewProfile>
): Promise<UserInterviewProfile> {
  const targetUrl = `${CUSTOM_BACKEND_URL}/api/interview/users/${userId}/profile`;

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Failed to save interview profile. Status: ${response.status}`,
      }));
      throw new Error(errorData.message);
    }

    const result: UserInterviewProfile = await response.json();
    console.log('[Frontend Service] Interview profile saved successfully');
    return result;
  } catch (error: any) {
    console.error('[Frontend Service] Error saving interview profile:', error.message);
    throw error;
  }
}

export async function getUserInterviewProfile(
  userId: string
): Promise<UserInterviewProfile | null> {
  const targetUrl = `${CUSTOM_BACKEND_URL}/api/interview/users/${userId}/profile`;

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Failed to fetch interview profile. Status: ${response.status}`,
      }));
      throw new Error(errorData.message);
    }

    const result: UserInterviewProfile = await response.json();
    console.log('[Frontend Service] Interview profile fetched successfully');
    return result;
  } catch (error: any) {
    console.error('[Frontend Service] Error fetching interview profile:', error.message);
    throw error;
  }
}

// Company Research Service
export async function researchCompany(request: CompanyResearchRequest): Promise<CompanyInsight> {
  console.log('[Frontend Service] Researching company:', request.companyName);

  const targetUrl = `${CUSTOM_BACKEND_URL}/api/interview/company-research`;

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Failed to research company. Status: ${response.status}`,
      }));
      throw new Error(errorData.message);
    }

    const result: CompanyInsight = await response.json();
    console.log('[Frontend Service] Company research completed successfully');
    return result;
  } catch (error: any) {
    console.error('[Frontend Service] Error researching company:', error.message);
    throw error;
  }
}

// Job Analysis Service
export async function analyzeJob(request: JobAnalysisRequest): Promise<JobAnalysis> {
  console.log('[Frontend Service] Analyzing job:', request.jobTitle);

  const targetUrl = `${CUSTOM_BACKEND_URL}/api/interview/job-analysis`;

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Failed to analyze job. Status: ${response.status}`,
      }));
      throw new Error(errorData.message);
    }

    const result: JobAnalysis = await response.json();
    console.log('[Frontend Service] Job analysis completed successfully');
    return result;
  } catch (error: any) {
    console.error('[Frontend Service] Error analyzing job:', error.message);
    throw error;
  }
}

// Mock Interview Service
export async function startMockInterview(
  userId: string,
  request: MockInterviewRequest
): Promise<MockInterviewSession> {
  console.log('[Frontend Service] Starting mock interview session for user:', userId);

  const targetUrl = `${CUSTOM_BACKEND_URL}/api/interview/users/${userId}/mock-interview`;

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Failed to start mock interview. Status: ${response.status}`,
      }));
      throw new Error(errorData.message);
    }

    const result: MockInterviewSession = await response.json();
    console.log('[Frontend Service] Mock interview session started successfully');
    return result;
  } catch (error: any) {
    console.error('[Frontend Service] Error starting mock interview:', error.message);
    throw error;
  }
}

export async function submitInterviewResponse(
  userId: string,
  sessionId: string,
  questionId: string,
  response: string,
  audioBlob?: Blob,
  videoBlob?: Blob
): Promise<{ score: number; feedback: string }> {
  console.log('[Frontend Service] Submitting interview response for session:', sessionId);

  const targetUrl = `${CUSTOM_BACKEND_URL}/api/interview/users/${userId}/sessions/${sessionId}/responses`;

  const formData = new FormData();
  formData.append('questionId', questionId);
  formData.append('response', response);

  if (audioBlob) {
    formData.append('audio', audioBlob, 'response.wav');
  }

  if (videoBlob) {
    formData.append('video', videoBlob, 'response.webm');
  }

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Failed to submit response. Status: ${response.status}`,
      }));
      throw new Error(errorData.message);
    }

    const result = await response.json();
    console.log('[Frontend Service] Interview response submitted successfully');
    return result;
  } catch (error: any) {
    console.error('[Frontend Service] Error submitting interview response:', error.message);
    throw error;
  }
}

export async function completeMockInterview(
  userId: string,
  sessionId: string
): Promise<MockInterviewSession> {
  console.log('[Frontend Service] Completing mock interview session:', sessionId);

  const targetUrl = `${CUSTOM_BACKEND_URL}/api/interview/users/${userId}/sessions/${sessionId}/complete`;

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Failed to complete mock interview. Status: ${response.status}`,
      }));
      throw new Error(errorData.message);
    }

    const result: MockInterviewSession = await response.json();
    console.log('[Frontend Service] Mock interview completed successfully');
    return result;
  } catch (error: any) {
    console.error('[Frontend Service] Error completing mock interview:', error.message);
    throw error;
  }
}

// Thank You Note Service
export async function generateThankYouNote(
  request: ThankYouGenerationRequest
): Promise<{ subject: string; body: string }> {
  console.log('[Frontend Service] Generating thank you note for:', request.companyName);

  const targetUrl = `${CUSTOM_BACKEND_URL}/api/interview/thank-you-note`;

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Failed to generate thank you note. Status: ${response.status}`,
      }));
      throw new Error(errorData.message);
    }

    const result = await response.json();
    console.log('[Frontend Service] Thank you note generated successfully');
    return result;
  } catch (error: any) {
    console.error('[Frontend Service] Error generating thank you note:', error.message);
    throw error;
  }
}

export async function getThankYouTemplates(
  industry?: Industry,
  interviewType?: InterviewType
): Promise<ThankYouTemplate[]> {
  const params = new URLSearchParams();
  if (industry) params.append('industry', industry);
  if (interviewType) params.append('interviewType', interviewType);

  const targetUrl = `${CUSTOM_BACKEND_URL}/api/interview/thank-you-templates?${params.toString()}`;

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Failed to fetch thank you templates. Status: ${response.status}`,
      }));
      throw new Error(errorData.message);
    }

    const result: ThankYouTemplate[] = await response.json();
    console.log(`[Frontend Service] Fetched ${result.length} thank you templates`);
    return result;
  } catch (error: any) {
    console.error('[Frontend Service] Error fetching thank you templates:', error.message);
    throw error;
  }
}

// Preparation Tips Service
export async function getPreparationTips(
  industry?: Industry,
  interviewType?: InterviewType,
  phase?: InterviewPhase
): Promise<PreparationTip[]> {
  const params = new URLSearchParams();
  if (industry) params.append('industry', industry);
  if (interviewType) params.append('interviewType', interviewType);
  if (phase) params.append('phase', phase);

  const targetUrl = `${CUSTOM_BACKEND_URL}/api/interview/preparation-tips?${params.toString()}`;

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Failed to fetch preparation tips. Status: ${response.status}`,
      }));
      throw new Error(errorData.message);
    }

    const result: PreparationTip[] = await response.json();
    console.log(`[Frontend Service] Fetched ${result.length} preparation tips`);
    return result;
  } catch (error: any) {
    console.error('[Frontend Service] Error fetching preparation tips:', error.message);
    throw error;
  }
}

// Interview Calendar Service
export async function getInterviewCalendar(userId: string): Promise<InterviewCalendar[]> {
  const targetUrl = `${CUSTOM_BACKEND_URL}/api/interview/users/${userId}/calendar`;

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Failed to fetch interview calendar. Status: ${response.status}`,
      }));
      throw new Error(errorData.message);
    }

    const result: InterviewCalendar[] = await response.json();
    console.log(`[Frontend Service] Fetched ${result.length} calendar entries`);
    return result;
  } catch (error: any) {
    console.error('[Frontend Service] Error fetching interview calendar:', error.message);
    throw error;
  }
}

export async function addInterviewToCalendar(
  userId: string,
  interview: Omit<InterviewCalendar, 'id' | 'userId'>
): Promise<InterviewCalendar> {
  const targetUrl = `${CUSTOM_BACKEND_URL}/api/interview/users/${userId}/calendar`;

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(interview),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Failed to add interview to calendar. Status: ${response.status}`,
      }));
      throw new Error(errorData.message);
    }

    const result: InterviewCalendar = await response.json();
    console.log('[Frontend Service] Interview added to calendar successfully');
    return result;
  } catch (error: any) {
    console.error('[Frontend Service] Error adding interview to calendar:', error.message);
    throw error;
  }
}

// Follow-up Scheduling Service
export async function scheduleFollowUp(
  userId: string,
  followUp: Omit<FollowUpSchedule, 'id'>
): Promise<FollowUpSchedule> {
  const targetUrl = `${CUSTOM_BACKEND_URL}/api/interview/users/${userId}/follow-ups`;

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(followUp),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Failed to schedule follow-up. Status: ${response.status}`,
      }));
      throw new Error(errorData.message);
    }

    const result: FollowUpSchedule = await response.json();
    console.log('[Frontend Service] Follow-up scheduled successfully');
    return result;
  } catch (error: any) {
    console.error('[Frontend Service] Error scheduling follow-up:', error.message);
    throw error;
  }
}

export async function getFollowUps(userId: string): Promise<FollowUpSchedule[]> {
  const targetUrl = `${CUSTOM_BACKEND_URL}/api/interview/users/${userId}/follow-ups`;

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Failed to fetch follow-ups. Status: ${response.status}`,
      }));
      throw new Error(errorData.message);
    }

    const result: FollowUpSchedule[] = await response.json();
    console.log(`[Frontend Service] Fetched ${result.length} follow-ups`);
    return result;
  } catch (error: any) {
    console.error('[Frontend Service] Error fetching follow-ups:', error.message);
    throw error;
  }
}

// Progress Tracking Service
export async function getInterviewProgress(userId: string): Promise<InterviewProgress | null> {
  const targetUrl = `${CUSTOM_BACKEND_URL}/api/interview/users/${userId}/progress`;

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Failed to fetch interview progress. Status: ${response.status}`,
      }));
      throw new Error(errorData.message);
    }

    const result: InterviewProgress = await response.json();
    console.log('[Frontend Service] Interview progress fetched successfully');
    return result;
  } catch (error: any) {
    console.error('[Frontend Service] Error fetching interview progress:', error.message);
    throw error;
  }
}

export async function updateInterviewProgress(
  userId: string,
  progress: Partial<InterviewProgress>
): Promise<InterviewProgress> {
  const targetUrl = `${CUSTOM_BACKEND_URL}/api/interview/users/${userId}/progress`;

  try {
    const response = await fetch(targetUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(progress),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Failed to update interview progress. Status: ${response.status}`,
      }));
      throw new Error(errorData.message);
    }

    const result: InterviewProgress = await response.json();
    console.log('[Frontend Service] Interview progress updated successfully');
    return result;
  } catch (error: any) {
    console.error('[Frontend Service] Error updating interview progress:', error.message);
    throw error;
  }
}

// Utility function to get default interview questions for offline mode
export function getDefaultInterviewQuestions(): InterviewQuestion[] {
  return [
    {
      id: 'default-1',
      category: InterviewType.BEHAVIORAL,
      question: 'Tell me about yourself.',
      difficulty: InterviewDifficulty.EASY,
      tags: ['introduction', 'personal'],
      framework: ResponseFramework.STAR,
      keywords: ['background', 'experience', 'goals'],
      scoringCriteria: [
        {
          aspect: 'Clarity',
          description: 'How clearly the candidate presents their background',
          weight: 0.3,
          maxPoints: 25,
        },
        {
          aspect: 'Relevance',
          description: 'How relevant the information is to the role',
          weight: 0.4,
          maxPoints: 35,
        },
        {
          aspect: 'Structure',
          description: 'How well-structured the response is',
          weight: 0.3,
          maxPoints: 40,
        },
      ],
    },
    {
      id: 'default-2',
      category: InterviewType.BEHAVIORAL,
      question: 'Describe a challenging situation you faced at work and how you handled it.',
      difficulty: InterviewDifficulty.MEDIUM,
      tags: ['problem-solving', 'conflict-resolution'],
      framework: ResponseFramework.STAR,
      keywords: ['challenge', 'solution', 'outcome'],
      scoringCriteria: [
        {
          aspect: 'Problem Analysis',
          description: 'Understanding of the problem',
          weight: 0.25,
          maxPoints: 25,
        },
        {
          aspect: 'Solution Quality',
          description: 'Effectiveness of the solution',
          weight: 0.35,
          maxPoints: 35,
        },
        {
          aspect: 'Results',
          description: 'Measurable outcomes achieved',
          weight: 0.4,
          maxPoints: 40,
        },
      ],
    },
    {
      id: 'default-3',
      category: InterviewType.SITUATIONAL,
      question: 'How would you handle a situation where you disagree with your manager?',
      difficulty: InterviewDifficulty.MEDIUM,
      tags: ['communication', 'conflict-management'],
      framework: ResponseFramework.CAR,
      keywords: ['disagreement', 'communication', 'resolution'],
      scoringCriteria: [
        {
          aspect: 'Professionalism',
          description: 'Maintaining professional approach',
          weight: 0.4,
          maxPoints: 40,
        },
        {
          aspect: 'Communication',
          description: 'Quality of communication strategy',
          weight: 0.6,
          maxPoints: 60,
        },
      ],
    },
  ];
}
