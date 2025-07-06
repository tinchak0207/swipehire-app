'use client';

import { signOut } from 'firebase/auth';
import {
  Bell,
  BellRing,
  BookOpen,
  Bot,
  Briefcase,
  Building2,
  ChevronDown,
  ExternalLink,
  FileArchive,
  Gift,
  Globe,
  HeartHandshake,
  Home,
  Info,
  Laptop,
  Link as LinkIcon,
  ListChecks,
  Loader2,
  Mail,
  MessageCircleQuestion,
  MessageSquareText,
  Moon,
  Newspaper,
  Palette,
  Rocket,
  Save,
  ScanLine,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Star as StarIcon,
  Sun,
  Tag,
  Trash2,
  TrendingUp,
  User,
  UserCog,
  Users,
  UserX,
  X,
} from 'lucide-react'; // Added Tag, X, LinkIcon
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { NotificationHistoryList } from '@/components/notifications/NotificationHistoryList';
import { AiRecommendationSettings } from '@/components/settings/AiRecommendationSettings';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogTitle as ShadAlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge'; // Added Badge
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { mockNotifications } from '@/lib/mockData';
import type {
  AIScriptTone,
  BackendUser,
  JobSeekerPerspectiveWeights,
  NotificationItem,
  RecruiterPerspectiveWeights,
  UserPreferences,
  UserRole,
} from '@/lib/types';
import { NotificationItemType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { deleteUserAccount, requestDataExport } from '@/services/userService';

const CUSTOM_BACKEND_URL = process.env['NEXT_PUBLIC_CUSTOM_BACKEND_URL'] || 'http://localhost:5000';

interface SettingsPageProps {
  currentUserRole: UserRole | null;
  isGuestMode?: boolean;
}

interface AppStats {
  candidateLikes: number;
  candidatePasses: number;
  companyLikes: number;
  companyPasses: number;
  icebreakersGenerated: number;
  matchesViewedCount: number;
}

const initialAppStats: AppStats = {
  candidateLikes: 0,
  candidatePasses: 0,
  companyLikes: 0,
  companyPasses: 0,
  icebreakersGenerated: 0,
  matchesViewedCount: 0,
};

const analyticsKeys: (keyof AppStats)[] = [
  'candidateLikes',
  'candidatePasses',
  'companyLikes',
  'companyPasses',
  'icebreakersGenerated',
  'matchesViewedCount',
];

const defaultRecruiterWeights: RecruiterPerspectiveWeights = {
  skillsMatchScore: 40,
  experienceRelevanceScore: 30,
  cultureFitScore: 20,
  growthPotentialScore: 10,
};

const defaultJobSeekerWeights: JobSeekerPerspectiveWeights = {
  cultureFitScore: 35,
  jobRelevanceScore: 30,
  growthOpportunityScore: 20,
  jobConditionFitScore: 15,
};

const defaultAIScriptToneOptions: { value: AIScriptTone; label: string }[] = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'technical', label: 'Technical' },
  { value: 'sales', label: 'Sales-Oriented' },
  { value: 'general', label: 'General' },
];

const discoveryItemsPerPageOptions = [5, 10, 15, 20];

export function SettingsPage({ currentUserRole, isGuestMode }: SettingsPageProps) {
  const {
    preferences: contextPreferences,
    setPreferences: setContextPreferences,
    updateFullBackendUserFields,
    preferences: { isLoading: contextLoading },
    mongoDbUserId,
    fullBackendUser,
    setMongoDbUserId: setContextMongoDbUserId,
  } = useUserPreferences();
  const router = useRouter();

  const [selectedRoleInSettings, setSelectedRoleInSettings] = useState<UserRole | null>(
    currentUserRole
  );
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [appStats, setAppStats] = useState<AppStats>(initialAppStats);

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackCategory, setFeedbackCategory] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const [recruiterWeights, setRecruiterWeights] =
    useState<RecruiterPerspectiveWeights>(defaultRecruiterWeights);
  const [jobSeekerWeights, setJobSeekerWeights] =
    useState<JobSeekerPerspectiveWeights>(defaultJobSeekerWeights);

  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isRequestingExport, setIsRequestingExport] = useState(false);

  const [localTheme, setLocalTheme] = useState<UserPreferences['theme']>(contextPreferences.theme);
  const [localFeatureFlags, setLocalFeatureFlags] = useState<Record<string, boolean>>(
    contextPreferences.featureFlags || {}
  );
  const [defaultAIScriptTone, setDefaultAIScriptTone] = useState<AIScriptTone>(
    contextPreferences.defaultAIScriptTone || 'professional'
  );
  const [discoveryItemsPerPage, setDiscoveryItemsPerPage] = useState<number>(
    contextPreferences.discoveryItemsPerPage || 10
  );
  const [enableExperimentalFeatures, setEnableExperimentalFeatures] = useState<boolean>(
    contextPreferences.enableExperimentalFeatures || false
  );

  const [notificationChannels, setNotificationChannels] = useState(
    contextPreferences.notificationChannels || {
      email: true,
      sms: false,
      inAppToast: true,
      inAppBanner: true,
    }
  );
  const [notificationSubscriptions, setNotificationSubscriptions] = useState(
    contextPreferences.notificationSubscriptions || {
      companyReplies: true,
      matchUpdates: true,
      applicationStatusChanges: true,
      platformAnnouncements: true,
      welcomeAndOnboardingEmails: true,
      contentAndBlogUpdates: false,
      featureAndPromotionUpdates: false,
    }
  );
  const [displayedNotifications, setDisplayedNotifications] =
    useState<NotificationItem[]>(mockNotifications);

  // Company Information State (for Recruiters)
  const [companyName, setCompanyName] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [currentCompanyCultureHighlightInput, setCurrentCompanyCultureHighlightInput] =
    useState('');
  const [companyCultureHighlightsList, setCompanyCultureHighlightsList] = useState<string[]>([]);
  const [companyNeeds, setCompanyNeeds] = useState('');

  const { toast } = useToast();

  // Moved loadAppStats function before useEffect that uses it
  const loadAppStats = useCallback(() => {
    if (typeof window !== 'undefined' && !isGuestMode) {
      const stats: Partial<AppStats> = {};
      analyticsKeys.forEach((key) => {
        stats[key] = Number.parseInt(localStorage.getItem(`analytics_${key}`) || '0', 10);
      });
      setAppStats(stats as AppStats);
    } else {
      setAppStats(initialAppStats);
    }
  }, [isGuestMode]);

  useEffect(() => {
    if (!contextLoading) {
      setLocalTheme(contextPreferences.theme);
      setLocalFeatureFlags(contextPreferences.featureFlags || {});
      setDefaultAIScriptTone(contextPreferences.defaultAIScriptTone || 'professional');
      setDiscoveryItemsPerPage(contextPreferences.discoveryItemsPerPage || 10);
      setEnableExperimentalFeatures(contextPreferences.enableExperimentalFeatures || false);
      setNotificationChannels(
        contextPreferences.notificationChannels || {
          email: true,
          sms: false,
          inAppToast: true,
          inAppBanner: true,
        }
      );
      setNotificationSubscriptions(
        contextPreferences.notificationSubscriptions || {
          companyReplies: true,
          matchUpdates: true,
          applicationStatusChanges: true,
          platformAnnouncements: true,
          welcomeAndOnboardingEmails: true,
          contentAndBlogUpdates: false,
          featureAndPromotionUpdates: false,
        }
      );
    }
  }, [contextPreferences, contextLoading]);

  useEffect(() => {
    if (isGuestMode || !auth.currentUser) {
      setUserName('Guest User');
      setUserEmail('');
      setSelectedRoleInSettings(null);
      setAddress('');
      setCountry('');
      setDocumentId('');
      setCompanyName('');
      setCompanyIndustry('');
      setCompanyAddress('');
      setCompanyWebsite('');
      setCompanyDescription('');
      setCompanyCultureHighlightsList([]);
      setCurrentCompanyCultureHighlightInput('');
      setCompanyNeeds('');
      setRecruiterWeights(defaultRecruiterWeights);
      setJobSeekerWeights(defaultJobSeekerWeights);
      setIsLoadingSettings(false);
      return;
    }

    setIsLoadingSettings(true);
    const user = auth.currentUser;

    if (user && mongoDbUserId && fullBackendUser) {
      setUserName(fullBackendUser.name || '');
      setUserEmail(fullBackendUser.email || '');
      setSelectedRoleInSettings(fullBackendUser.selectedRole || currentUserRole || null);
      setAddress(fullBackendUser.address || '');
      setCountry(fullBackendUser.country || '');
      setDocumentId(fullBackendUser.documentId || '');
      setRecruiterWeights(fullBackendUser.recruiterAIWeights || defaultRecruiterWeights);
      setJobSeekerWeights(fullBackendUser.jobSeekerAIWeights || defaultJobSeekerWeights);

      setCompanyName(fullBackendUser.companyName || '');
      setCompanyIndustry(fullBackendUser.companyIndustry || '');
      setCompanyAddress(fullBackendUser.companyAddress || '');
      setCompanyWebsite(fullBackendUser.companyWebsite || '');
      setCompanyDescription(fullBackendUser.companyDescription || '');
      setCompanyCultureHighlightsList(fullBackendUser.companyCultureHighlights || []);
      setCompanyNeeds(fullBackendUser.companyNeeds || '');

      setIsLoadingSettings(false);
    } else if (user && !fullBackendUser && !contextLoading) {
      setUserName(user.displayName || '');
      setUserEmail(user.email || '');
      setSelectedRoleInSettings(currentUserRole || null);
      setRecruiterWeights(defaultRecruiterWeights);
      setJobSeekerWeights(defaultJobSeekerWeights);
      setIsLoadingSettings(false);
      if (mongoDbUserId)
        toast({
          title: 'Profile Data Syncing',
          description: 'Some settings are using defaults until your full profile loads.',
          variant: 'default',
          duration: 5000,
        });
    } else if (!contextLoading) {
      setIsLoadingSettings(false);
    }
    loadAppStats();
  }, [
    isGuestMode,
    currentUserRole,
    mongoDbUserId,
    toast,
    fullBackendUser,
    contextLoading,
    loadAppStats,
  ]);

  const handleAddCultureHighlight = () => {
    const newHighlight = currentCompanyCultureHighlightInput.trim();
    if (
      newHighlight &&
      !companyCultureHighlightsList.includes(newHighlight) &&
      companyCultureHighlightsList.length < 10
    ) {
      setCompanyCultureHighlightsList([...companyCultureHighlightsList, newHighlight]);
    } else if (companyCultureHighlightsList.length >= 10) {
      toast({
        title: 'Limit Reached',
        description: 'Max 10 culture highlights.',
        variant: 'default',
      });
    }
    setCurrentCompanyCultureHighlightInput('');
  };

  const handleCultureHighlightInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      handleAddCultureHighlight();
    }
  };

  const handleRemoveCultureHighlight = (highlightToRemove: string) => {
    setCompanyCultureHighlightsList(
      companyCultureHighlightsList.filter((h) => h !== highlightToRemove)
    );
  };

  const handleSaveSettings = async () => {
    if (isGuestMode || !auth.currentUser || !mongoDbUserId) {
      toast({
        title: 'Feature Locked',
        description: 'Settings cannot be changed in Guest Mode or if profile is not synced.',
        variant: 'default',
      });
      return;
    }

    setIsSaving(true);
    const user = auth.currentUser;
    if (user && mongoDbUserId) {
      const currentPreferencesToSave: UserPreferences = {
        isLoading: contextLoading,
        theme: localTheme,
        featureFlags: localFeatureFlags,
        defaultAIScriptTone: defaultAIScriptTone,
        discoveryItemsPerPage: discoveryItemsPerPage,
        enableExperimentalFeatures: enableExperimentalFeatures,
        notificationChannels: notificationChannels,
        notificationSubscriptions: notificationSubscriptions,
      };

      const settingsData: Partial<BackendUser> = {
        name: userName,
        email: userEmail,
        selectedRole: selectedRoleInSettings,
        address,
        country,
        documentId,
        recruiterAIWeights: recruiterWeights,
        jobSeekerAIWeights: jobSeekerWeights,
        preferences: currentPreferencesToSave,
      };

      if (selectedRoleInSettings === 'recruiter') {
        settingsData.companyName = companyName.trim();
        settingsData.companyIndustry = companyIndustry.trim();
        settingsData.companyAddress = companyAddress.trim();
        settingsData.companyWebsite = companyWebsite.trim();
        settingsData.companyDescription = companyDescription.trim();
        settingsData.companyCultureHighlights = companyCultureHighlightsList.filter(
          (h) => h.trim() !== ''
        );
        settingsData.companyNeeds = companyNeeds.trim();
        // The backend will determine companyProfileComplete based on required fields
        settingsData.companyProfileComplete = !!companyName.trim(); // Simple check, backend might be more complex

        // Ensure default company info for jobs is also updated if user is recruiter
        settingsData.companyNameForJobs = companyName.trim() || userName;
        settingsData.companyIndustryForJobs = companyIndustry.trim() || 'Various';
      }

      try {
        const response = await fetch(`${CUSTOM_BACKEND_URL}/api/users/${mongoDbUserId}/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settingsData),
        });

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: `Failed to save settings. Status: ${response.status}` }));
          throw new Error(errorData.message);
        }

        const savedUserData = await response.json();
        if (savedUserData.user) {
          updateFullBackendUserFields(savedUserData.user);
        }
        await setContextPreferences(currentPreferencesToSave);

        const companyProfileIsComplete =
          selectedRoleInSettings === 'recruiter' && savedUserData.user?.companyProfileComplete;
        if (typeof window !== 'undefined') {
          localStorage.setItem('userSelectedRole', selectedRoleInSettings || '');
          localStorage.setItem(
            'recruiterCompanyProfileComplete',
            companyProfileIsComplete ? 'true' : 'false'
          );
        }

        if (selectedRoleInSettings === 'recruiter' && !companyProfileIsComplete) {
          toast({
            title: 'Settings Saved',
            description:
              'Role updated to Recruiter. Your company profile setup is still pending. You can complete it via the link below or you might be redirected.',
            duration: 8000,
          });
        } else {
          toast({
            title: 'Settings Saved',
            description: 'Your preferences and general information have been updated.',
          });
        }
      } catch (error: any) {
        console.error('Error saving settings to MongoDB backend:', error);
        let description = 'Could not save your settings.';
        if (error.message) {
          description = error.message;
        }
        toast({ title: 'Error Saving Settings', description, variant: 'destructive' });
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsSaving(false);
    }
  };

  const handleResetStats = () => {
    if (isGuestMode) {
      toast({
        title: 'Action Disabled',
        description: 'Stats are not applicable in Guest Mode.',
        variant: 'default',
      });
      return;
    }
    if (typeof window !== 'undefined') {
      analyticsKeys.forEach((key) => {
        localStorage.removeItem(`analytics_${key}`);
      });
      loadAppStats();
      toast({
        title: 'App Usage Stats Reset',
        description: 'The conceptual analytics have been cleared from local storage.',
      });
    }
  };

  const handleFeedbackSubmit = () => {
    if (isGuestMode) {
      toast({
        title: 'Action Disabled',
        description: 'Please sign in to submit feedback.',
        variant: 'default',
      });
      return;
    }
    if (!feedbackCategory || !feedbackMessage.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please select a category and enter your feedback message.',
        variant: 'destructive',
      });
      return;
    }
    console.log('Feedback Submitted:', { category: feedbackCategory, message: feedbackMessage });
    toast({
      title: 'Feedback Received!',
      description: 'Thank you for sharing your thoughts with us.',
    });
    setFeedbackCategory('');
    setFeedbackMessage('');
    setIsFeedbackModalOpen(false);
  };

  const handleNotificationChannelChange = (
    channel: keyof UserPreferences['notificationChannels'],
    checked: boolean
  ) => {
    setNotificationChannels((prev) => ({ ...prev!, [channel]: checked }));
  };

  const handleNotificationSubscriptionChange = (
    subscription: keyof UserPreferences['notificationSubscriptions'],
    checked: boolean
  ) => {
    setNotificationSubscriptions((prev) => ({ ...prev!, [subscription]: checked }));
  };

  const handleMarkNotificationAsRead = (notificationId: string) => {
    setDisplayedNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    toast({
      title: 'Notification Marked as Read',
      description: 'Conceptual action: marked as read.',
      duration: 2000,
    });
  };

  const handleClearNotification = (notificationId: string) => {
    setDisplayedNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    toast({
      title: 'Notification Cleared',
      description: 'Conceptual action: notification removed from list.',
      duration: 2000,
    });
  };

  const handleMarkAllNotificationsAsRead = () => {
    setDisplayedNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast({
      title: 'All Notifications Marked as Read',
      description: 'Conceptual action: all marked as read.',
      duration: 2000,
    });
  };

  const handleClearAllNotifications = () => {
    setDisplayedNotifications([]);
    toast({
      title: 'All Notifications Cleared',
      description: 'Conceptual action: list cleared.',
      duration: 2000,
    });
  };

  const handleSimulateNewNotification = () => {
    const types = Object.values(NotificationItemType) as NotificationItemType[];
    const randomType = types[Math.floor(Math.random() * types.length)]!;
    const newNotif: NotificationItem = {
      id: `sim-${Date.now()}`,
      type: randomType,
      title: `Simulated: ${randomType.replace('_', ' ')}`,
      message: 'This is a test notification to demonstrate the toast system.',
      timestamp: new Date().toISOString(),
      read: false,
      isUrgent: Math.random() < 0.3,
    };
    setDisplayedNotifications((prev) =>
      [newNotif, ...prev].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    );
    toast({
      title: newNotif.title,
      description: newNotif.message,
      variant: newNotif.isUrgent ? 'destructive' : 'default',
    });
  };

  const handleDeleteAccount = async () => {
    if (isGuestMode || !mongoDbUserId) {
      toast({ title: 'Action Disabled', variant: 'default' });
      return;
    }
    setIsDeletingAccount(true);
    try {
      await deleteUserAccount(mongoDbUserId);
      toast({
        title: 'Account Deletion Requested',
        description: 'Your account is scheduled for deletion. You will be logged out.',
      });
      await signOut(auth);
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      setContextMongoDbUserId(null);
      updateFullBackendUserFields(null);
      router.push('/');
    } catch (error: any) {
      toast({
        title: 'Deletion Failed',
        description: error.message || 'Could not delete your account.',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleDataExportRequest = async () => {
    if (isGuestMode || !mongoDbUserId) {
      toast({ title: 'Action Disabled', variant: 'default' });
      return;
    }
    setIsRequestingExport(true);
    try {
      const result = await requestDataExport(mongoDbUserId);
      toast({ title: 'Data Export Requested', description: result.message });
    } catch (error: any) {
      toast({
        title: 'Export Request Failed',
        description: error.message || 'Could not request data export.',
        variant: 'destructive',
      });
    } finally {
      setIsRequestingExport(false);
    }
  };

  const saveButtonText = isSaving ? 'Saving...' : 'Save All Settings';
  const SaveButtonIcon = isSaving ? Loader2 : Save;

  if ((isLoadingSettings || contextLoading) && !isGuestMode) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const isAuthEmail = auth.currentUser && auth.currentUser.email === userEmail;
  const showRecruiterOnboardingLink =
    selectedRoleInSettings === 'recruiter' &&
    fullBackendUser &&
    fullBackendUser.companyProfileComplete === false &&
    !isGuestMode;

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-4 md:p-6">
      <div className="mb-8 text-center">
        <UserCog className="mx-auto mb-3 h-12 w-12 text-primary" />
        <h1 className="font-bold text-3xl tracking-tight md:text-4xl">App Settings</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Manage your role, personal details, and app preferences.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Users className="mr-2 h-5 w-5 text-primary" />
            Your Role
          </CardTitle>
          <CardDescription>
            Select whether you are currently hiring or looking for a job. This changes the tools and
            features available to you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedRoleInSettings || ''}
            onValueChange={(value: string) => {
              if (value !== selectedRoleInSettings) {
                setSelectedRoleInSettings(value as UserRole);
              }
            }}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2 rounded-md border p-3 transition-colors hover:bg-muted/50">
              <RadioGroupItem value="recruiter" disabled={!!isGuestMode}>
                <></>
              </RadioGroupItem>
              <Label
                htmlFor="role-recruiter"
                className="flex cursor-pointer items-center text-base"
              >
                <Users className="mr-2 h-5 w-5 text-orange-500" />
                I'm Hiring (Recruiter)
              </Label>
            </div>
            <div className="flex items-center space-x-2 rounded-md border p-3 transition-colors hover:bg-muted/50">
              <RadioGroupItem value="jobseeker" disabled={!!isGuestMode}>
                <></>
              </RadioGroupItem>
              <Label
                htmlFor="role-jobseeker"
                className="flex cursor-pointer items-center text-base"
              >
                <Briefcase className="mr-2 h-5 w-5 text-blue-500" />
                I'm Job Hunting (Job Seeker)
              </Label>
            </div>
          </RadioGroup>
          {showRecruiterOnboardingLink && (
            <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm">
              <Building2 className="mr-2 inline h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-700">Your company profile is incomplete.</span>
              <Link
                href="/recruiter-onboarding"
                className="ml-1 inline-flex items-center font-semibold text-blue-600 hover:underline"
              >
                Complete Company Onboarding <ExternalLink className="ml-1 h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedRoleInSettings === 'recruiter' && !isGuestMode && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Building2 className="mr-2 h-5 w-5 text-primary" /> Company Information
            </CardTitle>
            <CardDescription>
              Provide details about your company. This information will be visible on your job
              postings. The Company Name is required to use features like the AI Human Resources
              Assistant.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="companyName" className="flex items-center font-semibold text-base">
                <Building2 className="mr-2 h-4 w-4 text-muted-foreground" /> Company Name{' '}
                <StarIcon className="ml-1 h-3 w-3 fill-destructive text-destructive" />
              </Label>
              <Input
                id="companyName"
                placeholder="Your Company LLC"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className={cn(
                  !companyName.trim() && 'border-destructive focus-visible:ring-destructive'
                )}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="companyIndustry" className="flex items-center text-base">
                <Globe className="mr-2 h-4 w-4 text-muted-foreground" /> Company Industry
              </Label>
              <Input
                id="companyIndustry"
                placeholder="e.g., Software, Marketing, Healthcare"
                value={companyIndustry}
                onChange={(e) => setCompanyIndustry(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="companyDescription" className="flex items-center text-base">
                <Info className="mr-2 h-4 w-4 text-muted-foreground" /> Company Description (Brief)
              </Label>
              <Textarea
                id="companyDescription"
                placeholder="Tell us about your company's mission and vision..."
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="companyCultureHighlightsInput"
                className="flex items-center text-base"
              >
                <Tag className="mr-2 h-4 w-4 text-muted-foreground" /> Company Culture Highlights
                (add one by one)
              </Label>
              <div className="mb-2 flex flex-wrap gap-2">
                {companyCultureHighlightsList.map((highlight, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1 text-sm"
                  >
                    {highlight}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleRemoveCultureHighlight(highlight)}
                      aria-label={`Remove highlight ${highlight}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="companyCultureHighlightsInput"
                  placeholder="e.g., Innovative, Collaborative"
                  value={currentCompanyCultureHighlightInput}
                  onChange={(e) => setCurrentCompanyCultureHighlightInput(e.target.value)}
                  onKeyDown={handleCultureHighlightInputKeyDown}
                  className="flex-grow"
                />
                <Button
                  type="button"
                  onClick={handleAddCultureHighlight}
                  variant="outline"
                  size="sm"
                  disabled={companyCultureHighlightsList.length >= 10}
                >
                  Add
                </Button>
              </div>
              <p className="text-muted-foreground text-xs">
                Max 10 highlights. Helps AI understand your company vibe.
              </p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="companyNeeds" className="flex items-center text-base">
                <ListChecks className="mr-2 h-4 w-4 text-muted-foreground" /> Current Company
                Focus/Needs
              </Label>
              <Input
                id="companyNeeds"
                placeholder="e.g., Expanding engineering team, Launching new product line"
                value={companyNeeds}
                onChange={(e) => setCompanyNeeds(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="companyAddress" className="flex items-center text-base">
                <Home className="mr-2 h-4 w-4 text-muted-foreground" /> Company Address
              </Label>
              <Input
                id="companyAddress"
                placeholder="123 Main St, Anytown, USA"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="companyWebsite" className="flex items-center text-base">
                <LinkIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Company Website
              </Label>
              <Input
                id="companyWebsite"
                type="url"
                placeholder="https://yourcompany.com"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <User className="mr-2 h-5 w-5 text-primary" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Update your contact and personal details. These will be stored in your user profile on
            our backend.
            {selectedRoleInSettings === 'recruiter' && (
              <span className="mt-1 block font-medium text-destructive text-sm">
                Recruiters: Full Name and Email are required to post jobs.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label
              htmlFor="name"
              className={cn(
                'flex items-center text-base',
                selectedRoleInSettings === 'recruiter' && 'font-semibold'
              )}
            >
              <User className="mr-2 h-4 w-4 text-muted-foreground" /> Full Name{' '}
              {selectedRoleInSettings === 'recruiter' && (
                <StarIcon className="ml-1 h-3 w-3 fill-destructive text-destructive" />
              )}
            </Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              disabled={!!isGuestMode}
              className={cn(
                selectedRoleInSettings === 'recruiter' &&
                  !userName.trim() &&
                  'border-destructive focus-visible:ring-destructive'
              )}
            />
          </div>
          <div className="space-y-1">
            <Label
              htmlFor="email"
              className={cn(
                'flex items-center text-base',
                selectedRoleInSettings === 'recruiter' && 'font-semibold'
              )}
            >
              <Mail className="mr-2 h-4 w-4 text-muted-foreground" /> Email Address{' '}
              {selectedRoleInSettings === 'recruiter' && (
                <StarIcon className="ml-1 h-3 w-3 fill-destructive text-destructive" />
              )}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              disabled={isGuestMode ? true : isAuthEmail || undefined}
              className={cn(
                selectedRoleInSettings === 'recruiter' &&
                  !userEmail.trim() &&
                  'border-destructive focus-visible:ring-destructive'
              )}
            />
            {isAuthEmail && !isGuestMode && (
              <p className="text-muted-foreground text-xs">
                Your primary email is managed by your authentication provider. To change it, please
                update it there.
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="address" className="flex items-center text-base">
              <Home className="mr-2 h-4 w-4 text-muted-foreground" /> Street Address (Optional)
            </Label>
            <Input
              id="address"
              placeholder="Enter your street address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={!!isGuestMode}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="country" className="flex items-center text-base">
              <Globe className="mr-2 h-4 w-4 text-muted-foreground" /> Country (Optional)
            </Label>
            <Input
              id="country"
              placeholder="Enter your country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              disabled={isGuestMode}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="documentId" className="flex items-center text-base">
              <ScanLine className="mr-2 h-4 w-4 text-muted-foreground" /> Document ID (Optional, for
              verification concept)
            </Label>
            <Input
              id="documentId"
              placeholder="Enter your document ID number"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              disabled={isGuestMode}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Palette className="mr-2 h-5 w-5 text-primary" />
            Appearance
          </CardTitle>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-base">Theme</Label>
            <RadioGroup
              value={localTheme}
              onValueChange={(value: string) => {
                if (value !== localTheme) {
                  setLocalTheme(value as UserPreferences['theme']);
                }
              }}
              className="flex flex-col gap-2 sm:flex-row"
            >
              <div className="flex flex-1 items-center space-x-2 rounded-md border p-3 transition-colors hover:bg-muted/50">
                <RadioGroupItem value="light" disabled={!!isGuestMode}>
                  <></>
                </RadioGroupItem>
                <Label htmlFor="theme-light" className="flex cursor-pointer items-center">
                  <Sun className="mr-2 h-4 w-4 text-yellow-500" /> Light
                </Label>
              </div>
              <div className="flex flex-1 items-center space-x-2 rounded-md border p-3 transition-colors hover:bg-muted/50">
                <RadioGroupItem value="dark" disabled={!!isGuestMode}>
                  <></>
                </RadioGroupItem>
                <Label htmlFor="theme-dark" className="flex cursor-pointer items-center">
                  <Moon className="mr-2 h-4 w-4 text-blue-400" /> Dark
                </Label>
              </div>
              <div className="flex flex-1 items-center space-x-2 rounded-md border p-3 transition-colors hover:bg-muted/50">
                <RadioGroupItem value="system" disabled={!!isGuestMode}>
                  <></>
                </RadioGroupItem>
                <Label htmlFor="theme-system" className="flex cursor-pointer items-center">
                  <Laptop className="mr-2 h-4 w-4 text-gray-500" /> System
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <SlidersHorizontal className="mr-2 h-5 w-5 text-primary" />
            Personalized Experience
          </CardTitle>
          <CardDescription>Fine-tune how the app works for you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="defaultAIScriptTone" className="flex items-center text-base">
              <Bot className="mr-2 h-4 w-4 text-muted-foreground" /> Default AI Script Tone
            </Label>
            <Select
              value={defaultAIScriptTone}
              onValueChange={(value: AIScriptTone) => setDefaultAIScriptTone(value)}
              disabled={isGuestMode || false}
            >
              <SelectTrigger id="defaultAIScriptTone">
                <SelectValue placeholder="Select default AI script tone" />
              </SelectTrigger>
              <SelectContent>
                {defaultAIScriptToneOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="discoveryItemsPerPage" className="flex items-center text-base">
              <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" /> Discovery Items Per Page
            </Label>
            <Select
              value={String(discoveryItemsPerPage)}
              onValueChange={(value) => setDiscoveryItemsPerPage(Number(value))}
              disabled={isGuestMode || false}
            >
              <SelectTrigger id="discoveryItemsPerPage">
                <SelectValue placeholder="Select items per page" />
              </SelectTrigger>
              <SelectContent>
                {discoveryItemsPerPageOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option} items
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <Label htmlFor="enableExperimentalFeatures" className="flex items-center text-base">
                <Rocket className="mr-2 h-4 w-4 text-muted-foreground" /> Enable Experimental
                Features
              </Label>
              <p className="text-muted-foreground text-xs">
                Try out new features that are still in development.
              </p>
            </div>
            <Switch
              id="enableExperimentalFeatures"
              checked={enableExperimentalFeatures}
              onCheckedChange={setEnableExperimentalFeatures}
              disabled={isGuestMode}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <BellRing className="mr-2 h-5 w-5 text-primary" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose how and what you want to be notified about. Email marketing preferences are
            managed here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="mb-2 block font-semibold text-base">Notification Channels</Label>
            <div className="space-y-2">
              {(
                Object.keys(notificationChannels) as Array<
                  keyof UserPreferences['notificationChannels']
                >
              ).map((channel) => (
                <div
                  key={channel}
                  className="flex items-center justify-between rounded-lg border p-3 shadow-sm"
                >
                  <Label
                    htmlFor={`channel-${channel}`}
                    className="flex items-center text-sm capitalize"
                  >
                    {channel === 'email' && <Mail className="mr-2 h-4 w-4 text-muted-foreground" />}
                    {channel === 'sms' && (
                      <MessageSquareText className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    {channel === 'inAppToast' && (
                      <Bell className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    {channel === 'inAppBanner' && (
                      <Info className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    {(channel as string).replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <Switch
                    id={`channel-${channel}`}
                    checked={notificationChannels[channel]}
                    onCheckedChange={(checked) => handleNotificationChannelChange(channel, checked)}
                    disabled={isGuestMode || channel === 'email' || channel === 'sms'}
                  />
                </div>
              ))}
              <p className="text-muted-foreground text-xs">
                Email and SMS notifications are conceptual for now.
              </p>
            </div>
          </div>
          <div>
            <Label className="mb-2 block font-semibold text-base">
              Notification & Email Subscriptions
            </Label>
            <div className="space-y-2">
              {[
                {
                  key: 'companyReplies',
                  label: 'Company Replies & Direct Messages',
                  Icon: MessageSquareText,
                },
                {
                  key: 'matchUpdates',
                  label: 'New Matches & Compatibility Updates',
                  Icon: HeartHandshake,
                },
                {
                  key: 'applicationStatusChanges',
                  label: 'Application Status Changes',
                  Icon: ListChecks,
                },
                {
                  key: 'platformAnnouncements',
                  label: 'Platform News & Important Announcements',
                  Icon: BellRing,
                },
                {
                  key: 'welcomeAndOnboardingEmails',
                  label: 'Welcome & Onboarding Guidance Emails',
                  Icon: Gift,
                },
                {
                  key: 'contentAndBlogUpdates',
                  label: 'Content Updates & Blog Posts',
                  Icon: Newspaper,
                },
                {
                  key: 'featureAndPromotionUpdates',
                  label: 'New Features & Promotional Offers',
                  Icon: ShoppingBag,
                },
              ].map((subItem) => (
                <div
                  key={subItem.key}
                  className="flex items-center justify-between rounded-lg border p-3 shadow-sm"
                >
                  <Label htmlFor={`sub-${subItem.key}`} className="flex items-center text-sm">
                    <subItem.Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {subItem.label}
                  </Label>
                  <Switch
                    id={`sub-${subItem.key}`}
                    checked={
                      notificationSubscriptions[
                        subItem.key as keyof UserPreferences['notificationSubscriptions']
                      ]
                    }
                    onCheckedChange={(checked) =>
                      handleNotificationSubscriptionChange(
                        subItem.key as keyof UserPreferences['notificationSubscriptions'],
                        checked
                      )
                    }
                    disabled={isGuestMode}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <AiRecommendationSettings
        initialRecruiterWeights={recruiterWeights}
        initialJobSeekerWeights={jobSeekerWeights}
        onRecruiterWeightsChange={setRecruiterWeights}
        onJobSeekerWeightsChange={setJobSeekerWeights}
        isGuestMode={isGuestMode || false}
      />

      {!isGuestMode && (
        <Accordion type="single" collapsible className="w-full" defaultValue="">
          <Card className="shadow-lg">
            <AccordionItem value="notification-history" className="border-b-0">
              <AccordionTrigger className="group px-6 py-4 font-semibold text-xl hover:no-underline">
                <div className="flex items-center">
                  <Bell className="mr-2 h-5 w-5 text-primary transition-colors group-hover:text-primary/80" />
                  Notification History
                  <ChevronDown className="ml-auto h-5 w-5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="px-4 pt-0 pb-4">
                  <NotificationHistoryList
                    notifications={displayedNotifications}
                    onMarkAsRead={handleMarkNotificationAsRead}
                    onClearNotification={handleClearNotification}
                  />
                  {displayedNotifications.length > 0 && (
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMarkAllNotificationsAsRead}
                        className="flex-1"
                      >
                        Mark All as Read
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleClearAllNotifications}
                        className="flex-1"
                      >
                        Clear All Notifications
                      </Button>
                    </div>
                  )}
                </CardContent>
              </AccordionContent>
            </AccordionItem>
          </Card>
        </Accordion>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
            Account Management
          </CardTitle>
          <CardDescription>Manage your account data and status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleDataExportRequest}
            variant="outline"
            className="w-full sm:w-auto"
            disabled={isGuestMode || isRequestingExport}
          >
            {isRequestingExport ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileArchive className="mr-2 h-4 w-4" />
            )}
            {isRequestingExport ? 'Requesting Export...' : 'Request Data Export'}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full sm:w-auto"
                disabled={isGuestMode || isDeletingAccount}
              >
                <UserX className="mr-2 h-4 w-4" /> Delete My Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <ShadAlertDialogTitle>Are you absolutely sure?</ShadAlertDialogTitle>
                <AlertDialogDescription>
                  This action is permanent and cannot be undone. All your data, including profile,
                  matches, and activity, will be deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeletingAccount}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeletingAccount ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Yes, Delete My Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
        <CardFooter>
          <p className="text-muted-foreground text-xs">
            Account deletion and data export are conceptual and will not perform real operations in
            this prototype.
          </p>
        </CardFooter>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <MessageCircleQuestion className="mr-2 h-5 w-5 text-primary" />
            Share Your Thoughts
          </CardTitle>
          <CardDescription>
            Help us improve SwipeHire! Share your feedback, suggestions, or report any issues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isFeedbackModalOpen} onOpenChange={setIsFeedbackModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto" disabled={isGuestMode}>
                Provide Feedback
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Submit Your Feedback</DialogTitle>
                <DialogDescription>
                  We value your input. Let us know how we can make SwipeHire better for you.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="feedbackCategory">Feedback Category</Label>
                  <Select value={feedbackCategory} onValueChange={setFeedbackCategory}>
                    <SelectTrigger id="feedbackCategory">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug_report">Bug Report</SelectItem>
                      <SelectItem value="feature_request">Feature Request</SelectItem>
                      <SelectItem value="general_comment">General Comment</SelectItem>
                      <SelectItem value="usability_issue">Usability Issue</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feedbackMessage">Your Message</Label>
                  <Textarea
                    id="feedbackMessage"
                    placeholder="Please describe your feedback in detail..."
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    rows={5}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="button" onClick={handleFeedbackSubmit}>
                  Submit Feedback
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {!isGuestMode && (
            <Button
              variant="link"
              size="sm"
              onClick={handleSimulateNewNotification}
              className="mt-4 text-xs"
            >
              Simulate New Notification (Dev)
            </Button>
          )}
        </CardContent>
        {isGuestMode && (
          <CardFooter>
            <p className="w-full text-center text-destructive text-xs italic">
              Feedback submission is disabled in Guest Mode.
            </p>
          </CardFooter>
        )}
      </Card>

      {!isGuestMode && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <TrendingUp className="mr-2 h-5 w-5 text-primary" />
              App Usage Insights (Conceptual)
            </CardTitle>
            <CardDescription>
              Basic usage statistics tracked locally. These are for demonstration purposes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <p>Candidate Likes:</p>
              <p className="text-right font-medium">{appStats.candidateLikes}</p>
              <p>Candidate Passes:</p>
              <p className="text-right font-medium">{appStats.candidatePasses}</p>
              <p>Company Likes (Applies):</p>
              <p className="text-right font-medium">{appStats.companyLikes}</p>
              <p>Company Passes:</p>
              <p className="text-right font-medium">{appStats.companyPasses}</p>
              <p>AI Icebreakers Generated:</p>
              <p className="text-right font-medium">{appStats.icebreakersGenerated}</p>
              <p>Simulated Matches Viewed:</p>
              <p className="text-right font-medium">{appStats.matchesViewedCount}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              onClick={handleResetStats}
              className="w-full text-destructive hover:bg-destructive/90 hover:text-destructive-foreground sm:w-auto"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Reset Conceptual Stats
            </Button>
          </CardFooter>
        </Card>
      )}

      <CardFooter className="flex justify-end pt-6">
        <Button
          onClick={handleSaveSettings}
          size="lg"
          disabled={!!(isGuestMode || isLoadingSettings || isSaving)}
        >
          <SaveButtonIcon className={isSaving ? 'mr-2 h-5 w-5 animate-spin' : 'mr-2 h-5 w-5'} />
          {saveButtonText}
        </Button>
      </CardFooter>
    </div>
  );
}
