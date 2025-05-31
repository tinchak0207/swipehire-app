
// src/lib/types.ts

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
  CONSULTANT = 'Consultant',
  UNSPECIFIED = 'Unspecified',
}

export interface PersonalityTraitAssessment {
  trait: string;
  fit: 'positive' | 'neutral' | 'negative';
  reason?: string;
}

export type AIScriptTone = 'professional' | 'friendly' | 'technical' | 'sales' | 'general';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  featureFlags?: Record<string, boolean>;
  defaultAIScriptTone?: AIScriptTone;
  discoveryItemsPerPage?: number;
  enableExperimentalFeatures?: boolean;
}

export interface Candidate {
  id: string; // This will be MongoDB _id if fetched from backend
  name: string;
  role: string; 
  experienceSummary: string;
  skills: string[];
  avatarUrl?: string; 
  dataAiHint?: string; 
  videoResumeUrl?: string; 
  profileStrength?: number; 
  location?: string; 
  desiredWorkStyle?: string; 
  pastProjects?: string; 
  workExperienceLevel?: WorkExperienceLevel;
  educationLevel?: EducationLevel;
  locationPreference?: LocationPreference; 
  languages?: string[]; 
  salaryExpectationMin?: number;
  salaryExpectationMax?: number;
  availability?: Availability; 
  jobTypePreference?: JobType[]; 
  personalityAssessment?: PersonalityTraitAssessment[];
  optimalWorkStyles?: string[];
  isUnderestimatedTalent?: boolean;
  underestimatedReasoning?: string;
}

export interface CompanyJobOpening {
  title: string;
  description: string;
  location?: string; 
  salaryRange?: string; 
  jobType?: JobType; 
  tags?: string[];
  videoOrImageUrl?: string; 
  dataAiHint?: string; 
  requiredExperienceLevel?: WorkExperienceLevel;
  requiredEducationLevel?: EducationLevel;
  workLocationType?: LocationPreference; 
  requiredLanguages?: string[];
  salaryMin?: number; 
  salaryMax?: number; 
  companyCultureKeywords?: string[]; 
  companyIndustry?: string; 
}

export interface Company {
  id: string; // This will be MongoDB _id if fetched from backend
  name: string;
  industry: string;
  description: string;
  cultureHighlights: string[];
  logoUrl?: string; 
  dataAiHint?: string; 
  introVideoUrl?: string; 
  jobOpenings?: CompanyJobOpening[];
  companyNeeds?: string; 
  salaryRange?: string; 
  jobType?: JobType; 
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
  videoDataUri: string; 
}

export interface IcebreakerRequest {
  candidateName: string;
  jobDescription: string;
  candidateSkills: string;
  companyNeeds:string;
  pastProjects: string;
}

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
  sender: 'user' | 'ai' | 'contact'; 
  text: string;
  timestamp: Date;
}

// Updated DiaryPost to reflect backend model
export interface DiaryPost {
  _id?: string; // From MongoDB
  id?: string; // Could be used on frontend if needed before _id is assigned
  authorId: string; // User's MongoDB _id
  authorName: string;
  authorAvatarUrl?: string; 
  dataAiHint?: string; 
  title: string;
  content: string;
  imageUrl?: string; 
  diaryImageHint?: string; 
  timestamp?: number; // Keep for frontend display if needed, backend uses createdAt
  tags?: string[];
  likes: number;
  likedBy?: string[]; // Array of User MongoDB _ids
  views?: number;
  commentsCount?: number; // Renamed to match backend
  isFeatured?: boolean;
  createdAt?: string; // From MongoDB
  updatedAt?: string; // From MongoDB
}


export interface CandidateProfileForAI {
    id: string;
    role?: string;
    experienceSummary?: string;
    skills?: string[];
    location?: string;
    desiredWorkStyle?: string;
    pastProjects?: string;
    workExperienceLevel?: WorkExperienceLevel;
    educationLevel?: EducationLevel;
    locationPreference?: LocationPreference;
    languages?: string[];
    salaryExpectationMin?: number;
    salaryExpectationMax?: number;
    availability?: Availability;
    jobTypePreference?: JobType[];
    personalityAssessment?: PersonalityTraitAssessment[]; 
}

export interface JobCriteriaForAI {
    title: string;
    description: string;
    requiredSkills?: string[];
    requiredExperienceLevel?: WorkExperienceLevel;
    requiredEducationLevel?: EducationLevel;
    workLocationType?: LocationPreference;
    jobLocation?: string;
    requiredLanguages?: string[];
    salaryMin?: number;
    salaryMax?: number;
    jobType?: JobType;
    companyCultureKeywords?: string[];
    companyIndustry?: string;
}

export interface RecruiterPerspectiveWeights {
  skillsMatchScore: number; 
  experienceRelevanceScore: number;
  cultureFitScore: number;
  growthPotentialScore: number;
}

export interface JobSeekerPerspectiveWeights {
  cultureFitScore: number; 
  jobRelevanceScore: number;
  growthOpportunityScore: number;
  jobConditionFitScore: number;
}

export interface UserAIWeights {
  recruiterPerspective?: RecruiterPerspectiveWeights;
  jobSeekerPerspective?: JobSeekerPerspectiveWeights;
}

export interface ProfileRecommenderInput {
    candidateProfile: CandidateProfileForAI;
    jobCriteria: JobCriteriaForAI;
    userAIWeights?: UserAIWeights; 
}

export interface ProfileRecommenderOutput {
    candidateId: string;
    matchScore: number; 
    reasoning: string;
    weightedScores: { 
        skillsMatchScore: number;
        experienceRelevanceScore: number;
        cultureFitScore: number;
        growthPotentialScore: number;
    };
    isUnderestimatedTalent: boolean;
    underestimatedReasoning?: string;
    personalityAssessment?: PersonalityTraitAssessment[];
    optimalWorkStyles?: string[];
    candidateJobFitAnalysis?: { 
        matchScoreForCandidate: number; 
        reasoningForCandidate: string;
        weightedScoresForCandidate: { 
            cultureFitScore: number;
            jobRelevanceScore: number;
            growthOpportunityScore: number;
            jobConditionFitScore: number;
        };
    };
}

export interface CandidateFilters {
  experienceLevels: Set<WorkExperienceLevel>;
  educationLevels: Set<EducationLevel>;
  locationPreferences: Set<LocationPreference>;
  jobTypes: Set<JobType>;
}

export interface JobFilters {
  experienceLevels: Set<WorkExperienceLevel>;
  educationLevels: Set<EducationLevel>;
  workLocationTypes: Set<LocationPreference>;
  jobTypes: Set<JobType>;
}

export interface CompanyQAInput {
  companyName: string;
  companyDescription: string;
  companyIndustry?: string;
  companyCultureHighlights?: string[];
  jobOpeningsSummary?: string; 
  userQuestion: string;
}

export interface CompanyQAOutput {
  aiAnswer: string;
}
