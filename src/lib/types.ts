export interface Candidate {
  id: string;
  name: string;
  role: string;
  experienceSummary: string;
  skills: string[];
  avatarUrl?: string; // URL or data URI
  videoResumeUrl?: string; // URL or data URI for placeholder
  profileStrength?: number; // 0-100 for AI recommendation hint
  location?: string;
  desiredWorkStyle?: string;
  pastProjects?: string; // For icebreaker context
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  description: string;
  cultureHighlights: string[];
  logoUrl?: string; // URL or data URI
  introVideoUrl?: string; // URL or data URI
  officeEnvironmentUrl?: string; // URL or data URI
  employeeReviews?: { rating: number; review: string }[];
  jobOpenings?: { title: string; description: string }[];
  companyNeeds?: string; // For icebreaker context
}

export interface Match {
  id: string;
  candidateId: string;
  companyId: string;
  matchedAt: Date;
  candidate: Candidate;
  company: Company;
}

export interface VideoScriptRequest {
  experience: string;
  desiredWorkStyle: string;
}

export interface AvatarRequest {
  description: string;
}

export interface VideoEditRequest {
  videoDataUri: string; // Assuming video is handled as a data URI
}

export interface IcebreakerRequest {
  candidateName: string;
  jobDescription: string;
  candidateSkills: string;
  companyNeeds: string;
  pastProjects: string;
}
