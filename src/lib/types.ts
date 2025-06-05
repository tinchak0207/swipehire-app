
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

export enum NotificationItemType {
  INFO = 'info',
  OFFER_EXTENDED = 'offer_extended',
  NEW_MESSAGE = 'new_message',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  APPLICATION_VIEWED = 'application_viewed',
  GENERAL_ALERT = 'general_alert',
  SYSTEM_UPDATE = 'system_update',
  FEEDBACK_REQUEST = 'feedback_request',
}

export interface NotificationItem {
  id: string;
  type: NotificationItemType;
  title: string;
  message: string;
  timestamp: string; // ISO Date string
  read: boolean;
  link?: string; // Optional link for navigation
  isUrgent?: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  featureFlags?: Record<string, boolean>;
  defaultAIScriptTone?: AIScriptTone;
  discoveryItemsPerPage?: number;
  enableExperimentalFeatures?: boolean;
  // Notification Preferences
  notificationChannels?: {
    email: boolean; // Conceptual, not implemented for sending
    sms: boolean;   // Conceptual, not implemented for sending
    inAppToast: boolean;
    inAppBanner: boolean;
  };
  notificationSubscriptions?: {
    companyReplies: boolean;
    matchUpdates: boolean;
    applicationStatusChanges: boolean;
    platformAnnouncements: boolean;
  };
}

export enum CompanyScale {
    SCALE_1_10 = "1-10 employees",
    SCALE_11_50 = "11-50 employees",
    SCALE_51_200 = "51-200 employees",
    SCALE_201_500 = "201-500 employees",
    SCALE_501_1000 = "501-1000 employees",
    SCALE_1001_PLUS = "1001+ employees",
    UNSPECIFIED = "Unspecified"
}

export interface CompanyVerificationDocument {
    type: 'business_license' | 'organization_code' | 'other';
    fileName: string;
    fileUrl?: string; // Conceptual, would be set after upload
    uploadedAt: string; // ISO Date string
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
  
  // Recruiter-specific company profile fields (populated by onboarding)
  companyName?: string; // Official company name
  companyIndustry?: string;
  companyScale?: CompanyScale;
  companyAddress?: string; // Full address including city, country
  companyWebsite?: string;
  companyDescription?: string; // For the company profile page
  companyCultureHighlights?: string[]; // For the company profile page
  companyLogoUrl?: string; // For the company profile page and job cards
  companyVerificationDocuments?: CompanyVerificationDocument[]; // Conceptual
  companyProfileComplete?: boolean; // Flag to indicate if recruiter onboarding is done

  // Fields for User's job postings (if recruiter) - these are defaults when creating new jobs
  companyNameForJobs?: string;
  companyIndustryForJobs?: string;
  jobOpenings?: CompanyJobOpening[];

  // Adding fields that would be populated by ResumeCreationFlow
  profileVideoResumeUrl?: string; // URL to the recorded video
  profileAvatarWithScriptUrl?: string; // URL to the generated avatar (if chosen)
  profileFinalScript?: string; // The finalized script
  profileResumeText?: string; // The original resume text/summary
  // These fields were already there but ensure they are part of BackendUser
  profileHeadline?: string;
  profileExperienceSummary?: string;
  profileSkills?: string; // Comma-separated
  profileDesiredWorkStyle?: string;
  profilePastProjects?: string;
  profileVideoPortfolioLink?: string;
  profileAvatarUrl?: string;
  profileWorkExperienceLevel?: string;
  profileEducationLevel?: string;
  profileLocationPreference?: string;
  profileLanguages?: string; // Comma-separated
  profileAvailability?: string;
  profileJobTypePreference?: string; // Comma-separated
  profileSalaryExpectationMin?: number;
  profileSalaryExpectationMax?: number;
  passedCandidateProfileIds?: string[];
  passedCompanyProfileIds?: string[];
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
  _id?: string; // Added _id for job subdocuments managed by backend
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
  // Fields that will be populated by backend based on the recruiter User document
  companyNameForJob?: string;
  companyLogoForJob?: string;
  companyIndustryForJob?: string;
  postedAt?: string | Date; // Allow Date for easier sorting, backend will provide ISO string
}

export interface Company { // This remains as the structure for mockData.ts companies
  id: string; // This is 'comp1', 'comp2' etc. from mockData
  recruiterUserId?: string; // MongoDB _id of the User who represents/posted this company/jobs
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
  jobMatchPercentage?: number; // For frontend display based on AI
}

export enum ApplicationStage {
  SUBMITTED = 'Submitted', // 已提交
  COMPANY_VIEWED = 'Company Viewed', // 企業已查看
  SHORTLISTED = 'Shortlisted', // 進入初選
  INTERVIEW_SCHEDULED = 'Interview Scheduled', // 安排面試
  INTERVIEW_COMPLETED = 'Interview Completed', // 面試完成
  AWAITING_DECISION = 'Awaiting Decision', // 等待結果
  OFFER_EXTENDED = 'Offer Extended', // 錄取通知
  REJECTED = 'Rejected', // 已拒絕
}

export interface ApplicationStatusUpdate {
  stage: ApplicationStage;
  timestamp: string; // ISO Date string
  description?: string; // e.g., "Interview scheduled with Hiring Manager"
  nextStepSuggestion?: string; // e.g., "Prepare for your interview on [Date]"
  responseNeeded?: boolean; // New field to indicate if user action is required for this stage
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
  applicationStatusHistory?: ApplicationStatusUpdate[]; // Added for tracking
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
  timestamp?: number; // Kept for potential legacy frontend use, prefer createdAt
  tags?: string[];
  likes: number;
  likedBy?: string[]; // Array of User MongoDB _ids
  views?: number;
  commentsCount?: number;
  isFeatured?: boolean;
  createdAt?: string; // ISO Date string from backend
  updatedAt?: string; // ISO Date string from backend
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
  likedProfileId: string; // If company, this is the Recruiter's User._id. If candidate, this is the JobSeeker's User._id.
  likedProfileType: 'candidate' | 'company';
  likingUserRole: UserRole; // Role of the liking user
  // These are the *display profile IDs* from mockData or equivalent (e.g., 'cand1', 'comp1')
  // They help the backend correctly form the Match document if both users use mock profile IDs.
  likingUserRepresentsCandidateId?: string; // If jobseeker, their 'candX' display ID
  likingUserRepresentsCompanyId?: string;   // If recruiter, their 'compX' display ID
}

export interface RecordLikeResponse {
  success: boolean;
  message: string;
  matchMade?: boolean;
  matchDetails?: Match; // Full match details if one was created
}

export interface CompanyReview {
  id?: string; // Frontend or DB ID
  companyId: string; // ID of the company being reviewed
  jobId?: string; // Optional: If the review is for a specific job application
  reviewerUserId: string; // User who submitted the review
  responsivenessRating: number; // 1-5
  attitudeRating: number; // 1-3
  processExperienceRating: number; // 1-5
  comments: string;
  isAnonymous: boolean;
  timestamp: string; // ISO Date string
}

// Data collected during recruiter onboarding
export interface RecruiterOnboardingData {
    companyName: string;
    companyIndustry: string;
    companyScale: CompanyScale;
    companyAddress: string;
    companyWebsite?: string;
    companyDescription?: string; // For profile page
    companyCultureHighlights?: string[]; // For profile page
    
    // Conceptual: File objects or URLs after upload
    businessLicense?: File | { name: string; url?: string }; 
    organizationCode?: File | { name: string; url?: string };
    
    recruiterFullName: string;
    recruiterJobTitle: string;
    recruiterContactPhone?: string;
}

