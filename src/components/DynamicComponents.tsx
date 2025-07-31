import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const loadingComponent = () => (
  <div className="flex min-h-[calc(100vh-250px)] items-center justify-center">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
  </div>
);

// Core pages - load immediately
export const WelcomePage = dynamic(
  () => import('@/components/pages/WelcomePage').then((mod) => mod.WelcomePage),
  { loading: loadingComponent, ssr: false }
);

export const LoginPage = dynamic(
  () => import('@/components/pages/LoginPage').then((mod) => mod.LoginPage),
  { loading: loadingComponent, ssr: false }
);

export const CandidateDiscoveryPage = dynamic(
  () => import('@/components/pages/CandidateDiscoveryPage').then((mod) => mod.CandidateDiscoveryPage),
  { loading: loadingComponent, ssr: false }
);

export const JobDiscoveryPage = dynamic(
  () => import('@/components/pages/JobDiscoveryPage').then((mod) => mod.JobDiscoveryPage),
  { loading: loadingComponent, ssr: false }
);

// Secondary features - lazy load
export const AiToolsPage = dynamic(
  () => import('@/components/pages/AiToolsPage').then((mod) => mod.AiToolsPage),
  { loading: loadingComponent, ssr: false }
);

export const MatchesPage = dynamic(
  () => import('@/components/pages/MatchesPage').then((mod) => mod.MatchesPage),
  { loading: loadingComponent, ssr: false }
);

export const SettingsPage = dynamic(
  () => import('@/components/pages/SettingsPage').then((mod) => mod.SettingsPage),
  { loading: loadingComponent, ssr: false }
);

export const MyProfilePage = dynamic(
  () => import('@/components/pages/MyProfilePage').then((mod) => mod.MyProfilePage),
  { loading: loadingComponent, ssr: false }
);

export const StaffDiaryPage = dynamic(
  () => import('@/components/pages/StaffDiaryPage').then((mod) => mod.StaffDiaryPage),
  { loading: loadingComponent, ssr: false }
);

export const InterviewGuidePage = dynamic(
  () => import('@/components/pages/InterviewGuidePage').then((mod) => mod.InterviewGuidePage),
  { loading: loadingComponent, ssr: false }
);

// Recruiter-specific features
export const CreateJobPostingPage = dynamic(
  () => import('@/components/pages/CreateJobPostingPage'),
  { loading: loadingComponent, ssr: false }
);

export const ManageJobPostingsPage = dynamic(
  () => import('@/components/pages/ManageJobPostingsPage').then((mod) => mod.ManageJobPostingsPage),
  { loading: loadingComponent, ssr: false }
);

// Route pages
export const RecruiterOnboardingPage = dynamic(
  () => import('@/app/recruiter-onboarding/page'),
  { loading: loadingComponent, ssr: false }
);

export const MarketSalaryTypeformPage = dynamic(
  () => import('@/components/pages/MarketSalaryTypeformPage'),
  { loading: loadingComponent, ssr: false }
);

export const ResumeOptimizerPage = dynamic(
  () => import('@/app/resume-optimizer/page'),
  { loading: loadingComponent, ssr: false }
);

export const WorkflowDashboardPage = dynamic(
  () => import('@/app/dashboard/workflows/page'),
  { loading: loadingComponent, ssr: false }
);

export const PortfolioPage = dynamic(
  () => import('@/app/portfolio/page'),
  { loading: loadingComponent, ssr: false }
);

export const EventsPage = dynamic(
  () => import('@/app/events/page'),
  { loading: loadingComponent, ssr: false }
);

export const FollowupRemindersPage = dynamic(
  () => import('@/app/follow-up-reminders/page'),
  { loading: loadingComponent, ssr: false }
);