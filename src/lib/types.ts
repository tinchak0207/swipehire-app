
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
  // Email Marketing Types (can also trigger in-app notifications if desired)
  WELCOME_EMAIL = 'welcome_email',
  CONTENT_UPDATE_EMAIL = 'content_update_email',
  FEATURE_PROMO_EMAIL = 'feature_promo_email',
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
  isLoading?: boolean;
  defaultAIScriptTone?: AIScriptTone;
  discoveryItemsPerPage?: number;
  enableExperimentalFeatures?: boolean;
  notificationChannels?: {
    email: boolean;
    sms: boolean;
    inAppToast: boolean;
    inAppBanner: boolean;
  };
  notificationSubscriptions?: {
    companyReplies: boolean;
    matchUpdates: boolean;
    applicationStatusChanges: boolean;
    platformAnnouncements: boolean;
    // New granular email marketing preferences
    welcomeAndOnboardingEmails?: boolean;
    contentAndBlogUpdates?: boolean;
    featureAndPromotionUpdates?: boolean;
  };
  hasAiHumanResourcesFeature?: boolean;
  aiHumanResourcesTier?: 'per_reply' | 'monthly' | 'none';
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
    fileUrl?: string;
    uploadedAt: string;
}

export interface BackendUser {
  _id: string;
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
  likedCandidateIds?: string[];
  likedCompanyIds?: string[];
  representedCandidateProfileId?: string;
  representedCompanyProfileId?: string;
  profileCardTheme?: string;
  createdAt?: string;
  updatedAt?: string;

  // Onboarding wizard fields
  wizardCompleted?: boolean;
  wizardSkipped?: boolean;
  onboardingCompletedAt?: string;
  wizardSkippedAt?: string;

  companyName?: string;
  companyIndustry?: string;
  companyScale?: CompanyScale;
  companyAddress?: string;
  companyWebsite?: string;
  companyDescription?: string;
  companyCultureHighlights?: string[];
  companyNeeds?: string;
  companyLogoUrl?: string;
  companyVerificationDocuments?: CompanyVerificationDocument[];
  companyProfileComplete?: boolean;

  companyNameForJobs?: string;
  companyIndustryForJobs?: string;
  jobOpenings?: CompanyJobOpening[];

  profileVideoResumeUrl?: string;
  profileAvatarWithScriptUrl?: string;
  profileFinalScript?: string;
  profileResumeText?: string;
  profileHeadline?: string;
  profileExperienceSummary?: string;
  profileSkills?: string;
  profileDesiredWorkStyle?: string;
  profilePastProjects?: string;
  profileVideoPortfolioLink?: string;
  profileAvatarUrl?: string;
  profileWorkExperienceLevel?: string;
  profileEducationLevel?: string;
  profileLocationPreference?: string;
  profileLanguages?: string;
  profileAvailability?: string;
  profileJobTypePreference?: string;
  profileSalaryExpectationMin?: number;
  profileSalaryExpectationMax?: number;
  passedCandidateProfileIds?: string[];
  passedCompanyProfileIds?: string[];
  profileVisibility?: 'public' | 'recruiters_only' | 'private';
}


export interface Candidate {
  id: string;
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
  cardTheme?: string;
}

export interface CompanyJobOpening {
  _id?: string;
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
  companyNameForJob?: string;
  companyLogoForJob?: string;
  companyIndustryForJob?: string;
  postedAt?: string | Date;
  status?: 'draft' | 'active' | 'paused' | 'expired' | 'filled' | 'closed';
}

export interface Company {
  id: string;
  recruiterUserId?: string;
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
  jobMatchPercentage?: number;
  reputationScore?: number;
  reputationGrade?: string;
  timelyReplyRate?: number;
  commonRejectionReasons?: string[];
}

export enum ApplicationStage {
  SUBMITTED = 'Submitted',
  COMPANY_VIEWED = 'Company Viewed',
  SHORTLISTED = 'Shortlisted',
  INTERVIEW_SCHEDULED = 'Interview Scheduled',
  INTERVIEW_COMPLETED = 'Interview Completed',
  AWAITING_DECISION = 'Awaiting Decision',
  OFFER_EXTENDED = 'Offer Extended',
  REJECTED = 'Rejected',
}

export interface ApplicationStatusUpdate {
  stage: ApplicationStage;
  timestamp: string;
  description?: string;
  nextStepSuggestion?: string;
  responseNeeded?: boolean;
}

export interface Match {
  _id: string;
  userA_Id: string;
  userB_Id: string;
  candidateProfileIdForDisplay: string;
  companyProfileIdForDisplay: string;
  jobOpeningTitle?: string;
  matchedAt: string;
  applicationTimestamp?: string;
  status: 'active' | 'archived_by_A' | 'archived_by_B' | 'archived_by_both';
  uniqueMatchKey: string;
  applicationStatusHistory?: ApplicationStatusUpdate[];
  candidate: Candidate; // Assuming these will be populated or available
  company: Company;   // Assuming these will be populated or available
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
  _id?: string;
  id?: string;
  matchId: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  read?: boolean;
  isAiSuggestion?: boolean;
  senderType?: 'user' | 'contact' | 'ai_suggestion';
}

export interface DiaryComment {
  _id: string; // Now explicitly making _id required for update/delete
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  text: string;
  timestamp: string;
}

export enum DiaryPostStatus {
  APPROVED = 'approved',
  PENDING_REVIEW = 'pending_review',
  REJECTED = 'rejected',
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
  comments?: DiaryComment[];
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  status?: DiaryPostStatus; // Added for content moderation
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
  companyCultureKeywords?: string[];
  companyWebsite?: string;
  jobOpeningsSummary?: string;
  userQuestion?: string;
  question?: string;
}

export interface CompanyQAOutput {
  aiAnswer?: string;
  answer?: string;
  confidence?: number;
  sources?: string[];
}

export interface RecordLikePayload {
  likingUserId: string;
  likedProfileId: string;
  likedProfileType: 'candidate' | 'company';
  likingUserRole: UserRole;
  likingUserRepresentsCandidateId?: string;
  likingUserRepresentsCompanyId?: string;
  jobOpeningTitle?: string; // Added this field
}

export interface RecordLikeResponse {
  success: boolean;
  message: string;
  matchMade?: boolean;
  matchDetails?: Match;
}

export interface CompanyReview {
  id?: string;
  _id?: string;
  companyId: string;
  jobId?: string;
  reviewerUserId: string;
  responsivenessRating: number;
  attitudeRating: number;
  processExperienceRating: number;
  comments: string;
  isAnonymous: boolean;
  timestamp: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecruiterOnboardingData {
    companyName: string;
    companyIndustry: string;
    companyScale: CompanyScale;
    companyAddress: string;
    companyWebsite?: string;
    companyDescription?: string;
    companyCultureHighlights?: string[];

    businessLicense?: File | { name: string; url?: string };
    organizationCode?: File | { name: string; url?: string };
    companyVerificationDocuments?: CompanyVerificationDocument[];

    recruiterFullName: string;
    recruiterJobTitle: string;
    recruiterContactPhone?: string;
}

export type CareerStage = 'exploration' | 'early' | 'mid' | 'late' | 'transition';

export interface CareerPath {
  title: string;
  description: string;
  requiredSkills: string[];
  growthPotential: number;
  salaryRange: string;
  educationRequirements: string[];
}

export interface Goal {
  id: number;
  type: 'long' | 'mid' | 'short';
  text: string;
  completed: boolean;
  createdAt: string;
  targetDate?: string;
  actionSteps: {
    description: string;
    completed: boolean;
  }[];
}
