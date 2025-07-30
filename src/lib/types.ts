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
  isLoading: boolean;
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
    welcomeAndOnboardingEmails: boolean;
    contentAndBlogUpdates: boolean;
    featureAndPromotionUpdates: boolean;
  };
  hasAiHumanResourcesFeature?: boolean;
  aiHumanResourcesTier?: 'per_reply' | 'monthly' | 'none';
}

export enum CompanyScale {
  SCALE_1_10 = '1-10 employees',
  SCALE_11_50 = '11-50 employees',
  SCALE_51_200 = '51-200 employees',
  SCALE_201_500 = '201-500 employees',
  SCALE_501_1000 = '501-1000 employees',
  SCALE_1001_PLUS = '1001+ employees',
  UNSPECIFIED = 'Unspecified',
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

  // Profile completion tracking
  profileCompletion?: number; // 0-100 percentage

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
  datePosted?: string | Date;
  validThrough?: string | Date;
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
  websiteUrl?: string;
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
  company: Company; // Assuming these will be populated or available
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
  companyNeeds: string;
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

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
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
  jobId?: string | undefined;
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

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: any[]; // Consider defining a proper edge type
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  runCount: number;
  tags: string[];
}

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
  actionSteps: ActionStep[];
  progress: number; // 0-100
  priority: 'low' | 'medium' | 'high';
  category: string;
}

export interface ActionStep {
  id: number;
  description: string;
  completed: boolean;
  dueDate?: string;
  resources?: string[];
  estimatedHours?: number;
}

export interface CareerChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type?: 'text' | 'suggestion' | 'report';
  metadata?: {
    goalId?: number;
    actionType?: string;
    resources?: string[];
  };
}

export interface CareerReport {
  id: string;
  title: string;
  type: 'skills' | 'progress' | 'market' | 'goals';
  generatedAt: string;
  data: {
    charts?: ChartData[];
    insights?: string[];
    recommendations?: string[];
    metrics?: Record<string, number>;
  };
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'radar';
  title: string;
  data: any[];
  labels?: string[];
}

export interface CareerReminder {
  id: string;
  title: string;
  description: string;
  type: 'goal_check' | 'skill_update' | 'market_research' | 'networking';
  scheduledFor: string;
  recurring: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly';
  completed: boolean;
}

export interface FollowupReminder {
  id: string;
  matchId: string;
  reminderType: 'thank_you' | 'status_inquiry' | 'follow_up' | 'custom';
  scheduledDate: string;
  status: 'pending' | 'completed' | 'snoozed';
  customMessage?: string;
  match: {
    id: string;
    companyName: string;
    jobTitle: string;
    applicationDate: string;
    status: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ReminderTemplate {
  id: string;
  type: string;
  title: string;
  description: string;
  defaultMessage: string;
  suggestedTiming?: string; // e.g., "24 hours after interview"
}

export interface SkillAssessment {
  skill: string;
  currentLevel: number; // 1-10
  targetLevel: number; // 1-10
  lastUpdated: string;
  resources: string[];
  marketDemand: 'low' | 'medium' | 'high';
}

export interface WorkflowNode {
  id: string;
  type: string;
  data: any;
  position: { x: number; y: number };
}

// Industry Events Types
export enum EventType {
  CONFERENCE = 'conference',
  WORKSHOP = 'workshop',
  SEMINAR = 'seminar',
  NETWORKING = 'networking',
  JOB_FAIR = 'job_fair',
  WEBINAR = 'webinar',
  MEETUP = 'meetup',
  PANEL_DISCUSSION = 'panel_discussion',
}

export enum EventFormat {
  IN_PERSON = 'in_person',
  VIRTUAL = 'virtual',
  HYBRID = 'hybrid',
}

export interface EventLocation {
  type: EventFormat;
  city?: string;
  state?: string;
  country?: string;
  venue?: string;
  address?: string;
  platform?: string; // For virtual events (Zoom, Teams, etc.)
  meetingUrl?: string;
}

export interface EventSpeaker {
  id: string;
  name: string;
  title?: string;
  company?: string;
  bio?: string;
  photoUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
}

export interface EventSession {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  speakers: EventSpeaker[];
  track?: string;
}

export interface IndustryEvent {
  id: string;
  title: string;
  description: string;
  shortDescription?: string; // Keep for now, migrate to description
  detailedDescription?: string;
  eventType: EventType;
  format: EventFormat;
  location: EventLocation;
  startDateTime: string;
  endDateTime: string;
  timezone?: string;
  organizer: {
    name: string;
    email?: string;
    website?: string;
    logoUrl?: string;
  };
  industry: string[];
  tags: string[];
  targetAudience: string[];
  skills: string[];
  registrationUrl: string;
  isFree: boolean;
  price?: number;
  currency?: string;
  capacity?: number;
  registeredCount: number;
  bannerUrl?: string;
  agenda: EventSession[];
  speakers: EventSpeaker[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  featured?: boolean;
  recommendationScore?: number;
  recommendationReasons?: string[];
  isSaved?: boolean;
  isRegistered?: boolean;
  isAttended?: boolean;
}

export interface EventFilters {
  eventTypes: Set<EventType>;
  formats: Set<EventFormat>;
  industries: Set<string>;
  cities: Set<string>;
  dateRange: {
    start?: string;
    end?: string;
  };
  priceRange: {
    min?: number;
    max?: number;
  };
  isFree?: boolean;
  skillLevels: Set<string>;
  tags: Set<string>;
  searchQuery?: string;
}

export interface EventSearchParams {
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'relevance' | 'popularity' | 'price';
  sortOrder?: 'asc' | 'desc';
  filters?: Partial<EventFilters>;
  userLocation?: {
    lat: number;
    lng: number;
    city?: string;
  };
}

export interface EventsResponse {
  events: IndustryEvent[];
  totalCount: number;
  hasMore: boolean;
  page: number;
  limit: number;
}

export interface SavedEvent {
  id: string;
  userId: string;
  eventId: string;
  savedAt: string;
  notificationPreferences: {
    oneDayBefore: boolean;
    oneHourBefore: boolean;
    eventStart: boolean;
  };
}

export interface EventRegistration {
  id: string;
  userId: string;
  eventId: string;
  registeredAt: string;
  status: 'registered' | 'cancelled' | 'attended' | 'no_show';
  source: 'swipehire' | 'external';
  externalRegistrationId?: string;
}

export interface EventFeedback {
  id: string;
  userId: string;
  eventId: string;
  rating: number; // 1-5
  feedback?: string;
  wouldRecommend: boolean;
  attendanceStatus: 'attended' | 'registered_no_show' | 'cancelled';
  submittedAt: string;
}

export interface EventRecommendation {
  eventId: string;
  score: number;
  reasons: string[];
  basedOn: {
    userProfile: boolean;
    userBehavior: boolean;
    similarUsers: boolean;
    trending: boolean;
  };
}

// Interview Guide Types
export enum InterviewPhase {
  PRE_INTERVIEW = 'pre_interview',
  INTERVIEW = 'interview',
  POST_INTERVIEW = 'post_interview',
}

export enum InterviewType {
  BEHAVIORAL = 'behavioral',
  TECHNICAL = 'technical',
  SITUATIONAL = 'situational',
  CASE_STUDY = 'case_study',
  SYSTEM_DESIGN = 'system_design',
}

export enum InterviewDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export enum Industry {
  TECHNOLOGY = 'technology',
  FINANCE = 'finance',
  CONSULTING = 'consulting',
  HEALTHCARE = 'healthcare',
  MARKETING = 'marketing',
  SALES = 'sales',
  GENERAL = 'general',
}

export enum ResponseFramework {
  STAR = 'star', // Situation, Task, Action, Result
  CAR = 'car', // Context, Action, Result
  SOAR = 'soar', // Situation, Objective, Action, Result
}

export interface InterviewQuestion {
  id: string;
  category: InterviewType;
  question: string;
  sampleAnswer?: string;
  difficulty: InterviewDifficulty;
  industry?: Industry;
  tags: string[];
  framework?: ResponseFramework;
  timeLimit?: number; // in minutes
  points?: number;
  followUpQuestions?: string[];
  keywords: string[];
  scoringCriteria?: ScoringCriterion[];
}

export interface ScoringCriterion {
  aspect: string;
  description: string;
  weight: number; // 0-1
  maxPoints: number;
}

export interface CompanyInsight {
  id: string;
  companyName: string;
  industry: string;
  description: string;
  recentNews: NewsItem[];
  keyPeople: KeyPerson[];
  financialHighlights: FinancialData[];
  cultureKeywords: string[];
  interviewTips: string[];
  commonQuestions: string[];
  glassdoorRating?: number;
  linkedinFollowers?: number;
  website?: string;
  headquarters?: string;
  foundedYear?: number;
  employeeCount?: string;
  competitors: string[];
  lastUpdated: string;
}

export interface NewsItem {
  title: string;
  url: string;
  publishedAt: string;
  source: string;
  summary: string;
}

export interface KeyPerson {
  name: string;
  title: string;
  linkedinUrl?: string;
  bio?: string;
  imageUrl?: string;
}

export interface FinancialData {
  metric: string;
  value: string;
  period: string;
  change?: string;
}

export interface JobAnalysis {
  id: string;
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceLevel: WorkExperienceLevel;
  salaryRange?: string;
  keyResponsibilities: string[];
  qualifications: string[];
  companyName: string;
  industry: Industry;
  location: string;
  remotePolicy?: string;
  predictedQuestions: InterviewQuestion[];
  skillGapAnalysis: SkillGap[];
  fitScore: number; // 0-100
  recommendations: string[];
  analysisDate: string;
}

export interface SkillGap {
  skill: string;
  required: boolean;
  userLevel: number; // 0-10
  requiredLevel: number; // 0-10
  gap: number;
  improvementResources: string[];
}

export interface PreparationTip {
  id: string;
  category: 'research' | 'questions' | 'attire' | 'logistics' | 'mindset';
  title: string;
  description: string;
  actionItems: string[];
  timeFrame: string; // e.g., "1 week before", "day of"
  priority: 'high' | 'medium' | 'low';
  industry?: Industry;
  applicableRoles: string[];
}

export interface MockInterviewSession {
  id: string;
  userId: string;
  sessionType: InterviewType;
  industry: Industry;
  difficulty: InterviewDifficulty;
  questions: InterviewQuestion[];
  responses: InterviewResponse[];
  overallScore: number; // 0-100
  feedback: InterviewFeedback;
  duration: number; // in minutes
  completedAt: string;
  aiAnalysis?: AIAnalysis;
}

export interface InterviewResponse {
  questionId: string;
  response: string;
  audioUrl?: string;
  videoUrl?: string;
  duration: number; // in seconds
  score: number; // 0-100
  feedback: string;
  keywordMatches: string[];
  frameworkUsed?: ResponseFramework;
  submittedAt: string;
}

export interface InterviewFeedback {
  strengths: string[];
  improvements: string[];
  specificTips: string[];
  frameworkUsage: {
    framework: ResponseFramework;
    used: boolean;
    effectiveness: number; // 0-100
  }[];
  communicationScore: number; // 0-100
  contentScore: number; // 0-100
  confidenceScore: number; // 0-100
  clarityScore: number; // 0-100;
  nextSteps: string[];
}

export interface AIAnalysis {
  speechPattern: {
    pace: number; // words per minute
    fillerWords: number;
    pauseCount: number;
    confidenceLevel: number; // 0-100
  };
  emotionDetection: {
    confidence: number; // 0-100
    stress: number; // 0-100
    engagement: number; // 0-100
  };
  bodyLanguage?: {
    eyeContact: number; // 0-100
    posture: number; // 0-100
    gestures: number; // 0-100
  };
  improvements: string[];
}

export interface ThankYouTemplate {
  id: string;
  title: string;
  subject: string;
  body: string;
  tone: 'professional' | 'friendly' | 'enthusiastic' | 'formal';
  timing: 'immediate' | '24hours' | '48hours' | 'custom';
  industry: Industry;
  interviewType: InterviewType;
  variables: TemplateVariable[];
  useCase: string;
}

export interface TemplateVariable {
  key: string;
  label: string;
  placeholder: string;
  required: boolean;
}

export interface FollowUpSchedule {
  id: string;
  matchId: string;
  interviewDate: string;
  followUpType: 'thank_you' | 'status_inquiry' | 'additional_info' | 'salary_negotiation';
  scheduledDate: string;
  status: 'pending' | 'sent' | 'skipped';
  templateId?: string;
  customMessage?: string;
  reminderSet: boolean;
  actualSentDate?: string;
}

export interface InterviewProgress {
  id: string;
  userId: string;
  phase: InterviewPhase;
  currentStep: string;
  completedSteps: string[];
  totalSteps: number;
  progressPercentage: number; // 0-100
  estimatedTimeRemaining: number; // in minutes
  lastActivity: string;
  goals: InterviewGoal[];
  achievements: Achievement[];
}

export interface InterviewGoal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'active' | 'completed' | 'paused';
  progress: number; // 0-100
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
  points: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'preparation' | 'practice' | 'improvement' | 'consistency';
  earnedAt: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface InterviewCalendar {
  id: string;
  userId: string;
  title: string;
  company: string;
  position: string;
  interviewType: InterviewType;
  date: string;
  time: string;
  duration: number; // in minutes
  location: string;
  interviewerName?: string;
  interviewerTitle?: string;
  interviewerEmail?: string;
  meetingUrl?: string;
  notes?: string;
  preparationChecklist: ChecklistItem[];
  reminders: InterviewReminder[];
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
}

export interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
  category: 'research' | 'preparation' | 'logistics' | 'materials';
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number; // in minutes
}

export interface InterviewReminder {
  id: string;
  type: 'preparation' | 'interview' | 'follow_up';
  title: string;
  message: string;
  scheduledFor: string;
  sent: boolean;
  method: 'email' | 'push' | 'sms';
}

export interface IndustrySpecific {
  industry: Industry;
  commonQuestions: InterviewQuestion[];
  technicalRequirements: TechnicalRequirement[];
  caseStudyTemplates: CaseStudyTemplate[];
  salaryBenchmarks: SalaryBenchmark[];
  careerPaths: CareerProgression[];
  networkingTips: string[];
  industryTrends: string[];
}

export interface TechnicalRequirement {
  skill: string;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  assessmentType: 'coding' | 'whiteboard' | 'take_home' | 'system_design';
  practiceResources: string[];
  commonPlatforms: string[];
}

export interface CaseStudyTemplate {
  id: string;
  title: string;
  industry: Industry;
  description: string;
  framework: string;
  timeLimit: number; // in minutes
  sampleQuestions: string[];
  evaluationCriteria: string[];
  sampleSolution?: string;
  difficulty: InterviewDifficulty;
}

export interface SalaryBenchmark {
  role: string;
  industry: Industry;
  experienceLevel: WorkExperienceLevel;
  location: string;
  baseMin: number;
  baseMax: number;
  totalCompMin: number;
  totalCompMax: number;
  currency: string;
  lastUpdated: string;
  source: string;
}

export interface CareerProgression {
  level: string;
  title: string;
  experienceRange: string;
  responsibilities: string[];
  requiredSkills: string[];
  typicalSalaryRange: string;
  nextSteps: string[];
  timeToPromotion: string;
}

export interface InterviewMetrics {
  totalSessions: number;
  averageScore: number;
  improvementRate: number; // percentage
  strongAreas: string[];
  weakAreas: string[];
  frameworkUsage: Record<ResponseFramework, number>;
  timeSpentPracticing: number; // in hours
  questionsAnswered: number;
  streakDays: number;
  lastSessionDate: string;
}

export interface UserInterviewProfile {
  userId: string;
  targetIndustries: Industry[];
  experienceLevel: WorkExperienceLevel;
  preferredInterviewTypes: InterviewType[];
  goals: InterviewGoal[];
  progress: InterviewProgress;
  metrics: InterviewMetrics;
  preferences: InterviewPreferences;
  savedQuestions: string[]; // question IDs
  practiceHistory: MockInterviewSession[];
  upcomingInterviews: InterviewCalendar[];
  achievements: Achievement[];
  createdAt: string;
  updatedAt: string;
}

export interface InterviewPreferences {
  difficultyLevel: InterviewDifficulty;
  sessionDuration: number; // in minutes
  enableAudioRecording: boolean;
  enableVideoRecording: boolean;
  enableAIAnalysis: boolean;
  frameworkPreference: ResponseFramework;
  reminderTiming: number; // hours before interview
  autoScheduleFollowUps: boolean;
  shareProgress: boolean;
}

// API Request/Response Types
export interface InterviewGuideRequest {
  phase?: InterviewPhase;
  industry?: Industry;
  interviewType?: InterviewType;
  difficulty?: InterviewDifficulty;
  limit?: number;
  offset?: number;
}

export interface InterviewGuideResponse {
  questions: InterviewQuestion[];
  companyInsights?: CompanyInsight[];
  preparationTips: PreparationTip[];
  totalCount: number;
  hasMore: boolean;
}

export interface MockInterviewRequest {
  sessionType: InterviewType;
  industry: Industry;
  difficulty: InterviewDifficulty;
  questionCount: number;
  timeLimit?: number;
}

export interface CompanyResearchRequest {
  companyName: string;
  includeNews?: boolean;
  includeFinancials?: boolean;
  includePeople?: boolean;
}

export interface JobAnalysisRequest {
  jobDescription: string;
  jobTitle: string;
  companyName: string;
  userSkills?: string[];
}

export interface ThankYouGenerationRequest {
  interviewerName: string;
  companyName: string;
  position: string;
  interviewDate: string;
  keyTopics: string[];
  tone: 'professional' | 'friendly' | 'enthusiastic' | 'formal';
  customPoints?: string[];
}
