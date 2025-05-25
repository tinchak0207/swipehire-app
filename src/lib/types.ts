
export type UserRole = 'recruiter' | 'jobseeker';

export enum WorkExperienceLevel {
  INTERN = 'intern',
  JUNIOR = '1-3 years',
  MID_LEVEL = '3-5 years',
  SENIOR = '5-10 years',
  EXPERT = '10+ years',
  UNSPECIFIED = 'unspecified',
}

export enum EducationLevel {
  HIGH_SCHOOL = 'high_school',
  UNIVERSITY = 'university', // Bachelor's or equivalent
  MASTER = 'master',
  DOCTORATE = 'doctorate',
  UNSPECIFIED = 'unspecified',
}

export enum LocationPreference {
  SPECIFIC_CITY = 'specific_city',
  REMOTE = 'remote',
  HYBRID = 'hybrid',
  UNSPECIFIED = 'unspecified',
}

export enum Availability {
  IMMEDIATE = 'immediate',
  ONE_MONTH = '1_month',
  THREE_MONTHS = '3_months',
  NEGOTIABLE = 'negotiable',
  UNSPECIFIED = 'unspecified',
}

export enum JobType {
  FULL_TIME = 'Full-time',
  PART_TIME = 'Part-time',
  CONTRACT = 'Contract',
  INTERNSHIP = 'Internship',
  CONSULTANT = 'Consultant', // Added based on user prompt
  UNSPECIFIED = 'Unspecified',
}

export interface PersonalityTraitAssessment {
  trait: string;
  fit: 'positive' | 'neutral' | 'negative';
  reason?: string;
}

export interface Candidate {
  id: string;
  name: string;
  role: string; // e.g., "Senior Software Engineer"
  experienceSummary: string;
  skills: string[];
  avatarUrl?: string; // URL or data URI
  dataAiHint?: string; // For avatarUrl
  videoResumeUrl?: string; // URL or data URI for placeholder
  profileStrength?: number; // 0-100 for AI recommendation hint
  location?: string; // Current location or preferred city if locationPreference is specific_city
  desiredWorkStyle?: string; // General description
  pastProjects?: string; // For icebreaker context

  // New fields for filtering
  workExperienceLevel?: WorkExperienceLevel;
  educationLevel?: EducationLevel;
  locationPreference?: LocationPreference; // Remote, Hybrid, Specific City (city in `location` field)
  languages?: string[]; // e.g., ['English', 'Spanish']
  salaryExpectationMin?: number;
  salaryExpectationMax?: number;
  availability?: Availability; // e.g., immediate, within 1 month
  jobTypePreference?: JobType[]; // Candidate can prefer multiple job types

  // Fields for Coworker Fit Label
  personalityAssessment?: PersonalityTraitAssessment[];
  optimalWorkStyles?: string[];
}

export interface CompanyJobOpening {
  title: string;
  description: string;
  location?: string; // Specific city/area for the job
  salaryRange?: string; // Could be a string like "$100k - $120k" or "Competitive"
  jobType?: JobType; // Full-time, Part-time etc.
  tags?: string[];
  videoOrImageUrl?: string; // Optional video/image for the job posting

  // New fields for filtering
  requiredExperienceLevel?: WorkExperienceLevel;
  requiredEducationLevel?: EducationLevel;
  workLocationType?: LocationPreference; // e.g., On-site (use 'location'), Remote, Hybrid
  requiredLanguages?: string[];
  salaryMin?: number; // For more precise filtering
  salaryMax?: number; // For more precise filtering
  companyCultureKeywords?: string[]; // Added for AI profile recommender
  companyIndustry?: string; // Added for AI profile recommender
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  description: string;
  cultureHighlights: string[];
  logoUrl?: string; // URL or data URI
  dataAiHint?: string; // For logoUrl
  // introVideoUrl?: string; // URL for a company culture video (e.g., office tour, team life, daily work record).
  introVideoUrl?: string; // URL for a company culture video. Content can include office environment, team culture, daily work record.
  jobOpenings?: CompanyJobOpening[];
  companyNeeds?: string; // For icebreaker context
  salaryRange?: string; // Company-wide typical salary info
  jobType?: JobType; // Predominant job type if applicable at company level
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

// New type for user-created job postings (already used by CreateJobPostingPage logic)
export interface JobPosting {
  id: string;
  title: string;
  description: string;
  compensation: string;
  tags: string[];
  mediaUrl?: string;
  companyId: string;
  postedAt: Date;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'contact'; // 'contact' represents the other person in the match
  text: string;
  timestamp: Date;
}

export interface DiaryPost {
  id: string;
  authorId: string; // Could be linked to a fuller User object later
  authorName: string;
  authorAvatarUrl?: string; // Optional
  dataAiHint?: string; // For authorAvatarUrl
  title: string;
  content: string;
  imageUrl?: string; // Optional image for the post
  timestamp: number; // Use number for easy sorting (Date.now())
  tags?: string[];
  // Conceptual fields for AI curation (not fully implemented in prototype)
  likes?: number;
  views?: number;
  isFeatured?: boolean;
}
