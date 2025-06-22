'use client';

import { BarChart3, Briefcase, Building, Eye, Info, MessageCircle, Sparkles } from 'lucide-react';
import type React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { RecruiterOnboardingData } from '@/lib/types';

interface Step4Props {
  onboardingData: Partial<RecruiterOnboardingData>;
  // onSubmit will be handled by the parent page's "Complete Onboarding" button
}

const FeatureItem = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <div className="flex items-start space-x-3 rounded-lg border bg-background p-3 shadow-sm transition-shadow hover:shadow-md">
    <Icon className="mt-1 h-6 w-6 shrink-0 text-primary" />
    <div>
      <h4 className="font-semibold text-foreground text-md">{title}</h4>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  </div>
);

export function Step4_FeatureIntroduction({ onboardingData }: Step4Props) {
  return (
    <div className="animate-fadeInPage space-y-6">
      <Alert variant="default" className="border-green-200 bg-green-50 text-green-700">
        <Info className="!text-green-600 h-5 w-5" />
        <AlertTitle className="font-semibold text-green-800">
          Step 4: You're Almost Ready!
        </AlertTitle>
        <AlertDescription className="text-green-700/90">
          Welcome aboard, {onboardingData.recruiterFullName || 'Recruiter'} from{' '}
          {onboardingData.companyName || 'your company'}! Here’s a glimpse of what you can do with
          SwipeHire.
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
        <FeatureItem
          icon={Briefcase}
          title="Post Engaging Job Openings"
          description="Create detailed job postings, add video intros, and specify requirements to attract the right talent."
        />
        <FeatureItem
          icon={Eye}
          title="Discover Candidate Profiles"
          description="Swipe through video resumes and rich candidate profiles matched to your needs by our AI."
        />
        <FeatureItem
          icon={Sparkles}
          title="AI-Powered Matching & Insights"
          description="Leverage AI to get match scores, understand candidate fit, and streamline your shortlisting process."
        />
        <FeatureItem
          icon={MessageCircle}
          title="Direct Messaging"
          description="Once a mutual match is made, connect directly with candidates through our integrated chat."
        />
        <FeatureItem
          icon={Building}
          title="Showcase Your Company"
          description="Your company profile (coming soon) will highlight your brand, culture, and values to attract top talent."
        />
        <FeatureItem
          icon={BarChart3}
          title="Analytics & Reporting (Conceptual)"
          description="Track your job posting performance and recruitment funnel effectiveness with upcoming analytics features."
        />
      </div>

      <p className="pt-2 text-center text-muted-foreground text-sm">
        Click "Complete Onboarding" below to finalize your company setup and start hiring!
      </p>
      {/* The "Complete Onboarding" button is in the parent RecruiterOnboardingPage component */}
    </div>
  );
}
