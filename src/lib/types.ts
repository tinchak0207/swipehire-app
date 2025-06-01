
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

// Representing User data from MongoDB, including new fields for likes and profile representation
export interface BackendUser {
  _id: string; // MongoDB ID
  name: string;
  email: string;
  firebaseUid?: string;
  selectedRole: UserRole | null;
  address?: string;
  country?: string;
  documentId?: string;
  recruiterAIWeights?: RecruiterPerspectiveWeights;
  jobSeekerAIWeights?: JobSeekerPerspectiveWeights;
  preferences?: UserPreferences;
  likedCandidateIds?: string[]; // Array of Candidate profile IDs (e.g., 'cand1')
  likedCompanyIds?: string[];   // Array of Company profile IDs (e.g., 'comp1')
  representedCandidateProfileId?: string; // For job seeker, their profile ID from mockData e.g. 'cand1'
  representedCompanyProfileId?: string;   // For recruiter, company profile ID they represent e.g. 'comp1'
  profileCardTheme?: string; // New field for card theme
  createdAt?: string;
  updatedAt?: string;
}


export interface Candidate { // This remains as the structure for mockData.ts candidates
  id: string; // This is 'cand1', 'cand2' etc. from mockData
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
  cardTheme?: string; // New field for card theme
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

export interface Company { // This remains as the structure for mockData.ts companies
  id: string; // This is 'comp1', 'comp2' etc. from mockData
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

// Updated Match interface to align with backend Match model
export interface Match {
  _id: string; // MongoDB ID for the match document itself
  userA_Id: string; // MongoDB User ID (e.g., recruiter)
  userB_Id: string; // MongoDB User ID (e.g., job seeker)
  candidateProfileIdForDisplay: string; // e.g., 'cand1' (from mockData)
  companyProfileIdForDisplay: string; // e.g., 'comp1' (from mockData)
  jobOpeningTitle?: string;
  matchedAt: string; // ISO Date string from backend
  status: 'active' | 'archived_by_A' | 'archived_by_B' | 'archived_by_both';
  uniqueMatchKey: string;
  // For frontend display, these will be populated by looking up IDs in mockCandidates/mockCompanies
  candidate?: Candidate;
  company?: Company;
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
  _id?: string; // MongoDB ID
  id?: string; // Frontend ID, can be same as _id after fetch
  matchId: string; // Links to the Match document's _id
  senderId: string; // MongoDB User ID of the sender
  receiverId: string; // MongoDB User ID of the receiver
  text: string;
  timestamp: string; // ISO Date string
  read?: boolean; // New field for read status
  // for frontend display only, not in DB
  senderType?: 'user' | 'contact'; // 'user' is the current logged-in user, 'contact' is the other person
}

export interface DiaryPost {
  _id?: string;
  id?: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  dataAiHint?: string;
  title: string;
  content: string;
  imageUrl?: string;
  diaryImageHint?: string;
  timestamp?: number;
  tags?: string[];
  likes: number;
  likedBy?: string[];
  views?: number;
  commentsCount?: number;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
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

// For the new like interaction endpoint
export interface RecordLikePayload {
  likingUserId: string; // MongoDB _id of the user performing the like
  likedProfileId: string; // e.g., 'cand1' or 'comp1'
  likedProfileType: 'candidate' | 'company';
  likingUserRole: UserRole; // Role of the liking user
  // These are hints for the backend to find the "other user" based on mock profile IDs
  likingUserRepresentsCandidateId?: string; // If jobseeker, their 'candX' ID from mockData
  likingUserRepresentsCompanyId?: string;   // If recruiter, their 'compX' ID from mockData
}

export interface RecordLikeResponse {
  success: boolean;
  message: string;
  matchMade?: boolean;
  matchDetails?: Match; // Full match details if one was created
}

