
export type UserRole = 'recruiter' | 'jobseeker';

export interface Candidate {
  id: string;
  name: string;
  role: string;
  experienceSummary: string;
  skills: string[];
  avatarUrl?: string; // URL or data URI
  dataAiHint?: string; // For avatarUrl
  videoResumeUrl?: string; // URL or data URI for placeholder
  profileStrength?: number; // 0-100 for AI recommendation hint
  location?: string;
  desiredWorkStyle?: string;
  pastProjects?: string; // For icebreaker context
}

export interface CompanyJobOpening {
  title: string;
  description: string;
  location?: string;
  salaryRange?: string;
  jobType?: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  tags?: string[];
  videoOrImageUrl?: string; // Optional video/image for the job posting
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  description: string;
  cultureHighlights: string[];
  logoUrl?: string; // URL or data URI
  dataAiHint?: string; // For logoUrl
  introVideoUrl?: string; // URL or data URI
  jobOpenings?: CompanyJobOpening[];
  companyNeeds?: string; // For icebreaker context
  // These were moved to CompanyJobOpening
  // salaryRange?: string; 
  // jobType?: 'Full-time' | 'Part-time' | 'Contract' | 'Internship'; 
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

// New type for user-created job postings
export interface JobPosting {
  id: string;
  title: string;
  description: string;
  compensation: string;
  tags: string[]; // Array of strings
  mediaUrl?: string; // URL for optional video/picture
  companyId: string; // To link back to the posting company (assuming recruiter posts for their company)
  postedAt: Date;
}
