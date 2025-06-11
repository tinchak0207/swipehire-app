
"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import type { UserRole, RecruiterPerspectiveWeights, JobSeekerPerspectiveWeights, UserPreferences, AIScriptTone, NotificationItem } from '@/lib/types';
import { mockNotifications } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth"; // Import signOut
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { AiRecommendationSettings } from '@/components/settings/AiRecommendationSettings';
import { UserCog, Briefcase, Users, ShieldCheck, Mail, User, Home, Globe, ScanLine, Save, MessageSquareText, DollarSign, BarChart3, Sparkles, Film, Brain, Info, TrendingUp, Trash2, MessageCircleQuestion, AlertCircle, Loader2, Construction, ListChecks, Rocket, Palette, Moon, Sun, Laptop, SlidersHorizontal, Bot, BookOpen, Star as StarIcon, Bell, BellOff, BellRing, HeartHandshake, ChevronDown, Building2, ExternalLink, FileArchive, UserX, Gift, Newspaper, ShoppingBag } from 'lucide-react'; // Added Gift, Newspaper, ShoppingBag
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle as ShadAlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"; // Added AlertDialog
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { NotificationHistoryList } from '@/components/notifications/NotificationHistoryList';
import { NotificationItemType } from '@/lib/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { deleteUserAccount, requestDataExport } from '@/services/userService'; // Import new services

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';

interface SettingsPageProps {
  currentUserRole: UserRole | null;
  // onRoleChange: (newRole: UserRole) => void; // This prop might become less critical if role changes are primarily handled via backend save
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
  const { preferences: contextPreferences, setPreferences: setContextPreferences, updateFullBackendUserFields, loadingPreferences: contextLoading, mongoDbUserId, fullBackendUser, setMongoDbUserId: setContextMongoDbUserId } = useUserPreferences();
  const router = useRouter();

  const [selectedRoleInSettings, setSelectedRoleInSettings] = useState<UserRole | null>(currentUserRole);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [appStats, setAppStats] = useState<AppStats>(initialAppStats);

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackCategory, setFeedbackCategory] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const [recruiterWeights, setRecruiterWeights] = useState<RecruiterPerspectiveWeights>(defaultRecruiterWeights);
  const [jobSeekerWeights, setJobSeekerWeights] = useState<JobSeekerPerspectiveWeights>(defaultJobSeekerWeights);

  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isRequestingExport, setIsRequestingExport] = useState(false);


  const [localTheme, setLocalTheme] = useState<UserPreferences['theme']>(contextPreferences.theme);
  const [localFeatureFlags, setLocalFeatureFlags] = useState<Record<string, boolean>>(contextPreferences.featureFlags || {});
  const [defaultAIScriptTone, setDefaultAIScriptTone] = useState<AIScriptTone>(contextPreferences.defaultAIScriptTone || 'professional');
  const [discoveryItemsPerPage, setDiscoveryItemsPerPage] = useState<number>(contextPreferences.discoveryItemsPerPage || 10);
  const [enableExperimentalFeatures, setEnableExperimentalFeatures] = useState<boolean>(contextPreferences.enableExperimentalFeatures || false);

  const [notificationChannels, setNotificationChannels] = useState(contextPreferences.notificationChannels || { email: true, sms: false, inAppToast: true, inAppBanner: true });
  const [notificationSubscriptions, setNotificationSubscriptions] = useState(
    contextPreferences.notificationSubscriptions || { 
      companyReplies: true, matchUpdates: true, applicationStatusChanges: true, platformAnnouncements: true,
      welcomeAndOnboardingEmails: true, contentAndBlogUpdates: false, featureAndPromotionUpdates: false,
    }
  );
  const [displayedNotifications, setDisplayedNotifications] = useState<NotificationItem[]>(mockNotifications);


  const { toast } = useToast();

  useEffect(() => {
    if (!contextLoading) {
      setLocalTheme(contextPreferences.theme);
      setLocalFeatureFlags(contextPreferences.featureFlags || {});
      setDefaultAIScriptTone(contextPreferences.defaultAIScriptTone || 'professional');
      setDiscoveryItemsPerPage(contextPreferences.discoveryItemsPerPage || 10);
      setEnableExperimentalFeatures(contextPreferences.enableExperimentalFeatures || false);
      setNotificationChannels(contextPreferences.notificationChannels || { email: true, sms: false, inAppToast: true, inAppBanner: true });
      setNotificationSubscriptions(contextPreferences.notificationSubscriptions || { 
        companyReplies: true, matchUpdates: true, applicationStatusChanges: true, platformAnnouncements: true,
        welcomeAndOnboardingEmails: true, contentAndBlogUpdates: false, featureAndPromotionUpdates: false,
      });
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
        setIsLoadingSettings(false);
    } else if (user && !fullBackendUser && !contextLoading) {
      setUserName(user.displayName || '');
      setUserEmail(user.email || '');
      setSelectedRoleInSettings(currentUserRole || null);
      setRecruiterWeights(defaultRecruiterWeights);
      setJobSeekerWeights(defaultJobSeekerWeights);
      setIsLoadingSettings(false);
      if (mongoDbUserId) {
        toast({ title: "Profile Data Syncing", description: "Some settings are using defaults until your full profile loads.", variant: "default", duration: 5000 });
      }
    } else if (!contextLoading) {
      setIsLoadingSettings(false);
    }
    loadAppStats();
  }, [isGuestMode, currentUserRole, mongoDbUserId, toast, fullBackendUser, contextLoading]);

  const loadAppStats = () => {
    if (typeof window !== 'undefined' && !isGuestMode) {
      const stats: Partial<AppStats> = {};
      analyticsKeys.forEach(key => {
        stats[key] = parseInt(localStorage.getItem(`analytics_${key}`) || '0', 10);
      });
      setAppStats(stats as AppStats);
    } else {
      setAppStats(initialAppStats);
    }
  };

  const handleSaveSettings = async () => {
    if (isGuestMode || !auth.currentUser || !mongoDbUserId) {
      toast({ title: "Feature Locked", description: "Settings cannot be changed in Guest Mode or if profile is not synced.", variant: "default" });
      return;
    }

    setIsSaving(true);
    const user = auth.currentUser;
    if (user && mongoDbUserId) {

      const currentPreferencesToSave: UserPreferences = {
        theme: localTheme,
        featureFlags: localFeatureFlags,
        defaultAIScriptTone: defaultAIScriptTone,
        discoveryItemsPerPage: discoveryItemsPerPage,
        enableExperimentalFeatures: enableExperimentalFeatures,
        notificationChannels: notificationChannels,
        notificationSubscriptions: notificationSubscriptions,
      };

      const settingsData: any = {
        name: userName,
        email: userEmail,
        selectedRole: selectedRoleInSettings,
        address,
        country,
        documentId,
        recruiterAIWeights: recruiterWeights,
        jobSeekerAIWeights: jobSeekerWeights,
        preferences: currentPreferencesToSave,
        ...(selectedRoleInSettings === 'recruiter' && {
            companyNameForJobs: fullBackendUser?.companyName || fullBackendUser?.companyNameForJobs || userName,
            companyIndustryForJobs: fullBackendUser?.companyIndustry || fullBackendUser?.companyIndustryForJobs || 'Unspecified',
            companyProfileComplete: fullBackendUser?.companyProfileComplete === undefined ? false : fullBackendUser.companyProfileComplete,
        })
      };

      try {
        const response = await fetch(`${CUSTOM_BACKEND_URL}/api/proxy/users/${mongoDbUserId}/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settingsData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `Failed to save settings. Status: ${response.status}` }));
          throw new Error(errorData.message);
        }

        const savedUserData = await response.json();
        if (savedUserData.user) {
          updateFullBackendUserFields(savedUserData.user); 
        }
        await setContextPreferences(currentPreferencesToSave);

        const companyProfileIsComplete = selectedRoleInSettings === 'recruiter' && savedUserData.user?.companyProfileComplete;
        if (typeof window !== 'undefined') {
            localStorage.setItem('userSelectedRole', selectedRoleInSettings || '');
            localStorage.setItem('recruiterCompanyProfileComplete', companyProfileIsComplete ? 'true' : 'false');
        }

        if (selectedRoleInSettings === 'recruiter' && !companyProfileIsComplete) {
             toast({ title: 'Settings Saved', description: 'Role updated to Recruiter. Your company profile setup is still pending. You can complete it via the link below or you might be redirected.', duration: 8000});
        } else {
            toast({ title: 'Settings Saved', description: 'Your preferences and general information have been updated.' });
        }

      } catch (error: any) {
        console.error("Error saving settings to MongoDB backend:", error);
        let description = "Could not save your settings.";
        if (error.message) { description = error.message; }
        toast({ title: "Error Saving Settings", description, variant: "destructive" });
      } finally {
        setIsSaving(false);
      }
    } else {
        setIsSaving(false);
    }
  };

  const handleResetStats = () => {
    if (isGuestMode) {
      toast({ title: "Action Disabled", description: "Stats are not applicable in Guest Mode.", variant: "default" });
      return;
    }
    if (typeof window !== 'undefined') {
      analyticsKeys.forEach(key => {
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
        toast({ title: "Action Disabled", description: "Please sign in to submit feedback.", variant: "default" });
        return;
    }
    if (!feedbackCategory || !feedbackMessage.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a category and enter your feedback message.",
        variant: "destructive",
      });
      return;
    }
    console.log("Feedback Submitted:", { category: feedbackCategory, message: feedbackMessage });
    toast({
      title: "Feedback Received!",
      description: "Thank you for sharing your thoughts with us.",
    });
    setFeedbackCategory('');
    setFeedbackMessage('');
    setIsFeedbackModalOpen(false);
  };

  const handleFeatureFlagChange = (flagName: string, checked: boolean) => {
    setLocalFeatureFlags(prev => ({...prev, [flagName]: checked }));
  };

  const handleNotificationChannelChange = (channel: keyof UserPreferences['notificationChannels'], checked: boolean) => {
    setNotificationChannels(prev => ({ ...prev!, [channel]: checked }));
  };

  const handleNotificationSubscriptionChange = (subscription: keyof UserPreferences['notificationSubscriptions'], checked: boolean) => {
    setNotificationSubscriptions(prev => ({ ...prev!, [subscription]: checked }));
  };

  const handleMarkNotificationAsRead = (notificationId: string) => {
    setDisplayedNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    toast({ title: "Notification Marked as Read", description: "Conceptual action: marked as read.", duration: 2000 });
  };

  const handleClearNotification = (notificationId: string) => {
    setDisplayedNotifications(prev => prev.filter(n => n.id !== notificationId));
    toast({ title: "Notification Cleared", description: "Conceptual action: notification removed from list.", duration: 2000 });
  };

  const handleMarkAllNotificationsAsRead = () => {
    setDisplayedNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({ title: "All Notifications Marked as Read", description: "Conceptual action: all marked as read.", duration: 2000 });
  };

  const handleClearAllNotifications = () => {
    setDisplayedNotifications([]);
    toast({ title: "All Notifications Cleared", description: "Conceptual action: list cleared.", duration: 2000 });
  };

  const handleSimulateNewNotification = () => {
    const types = Object.values(NotificationItemType);
    const randomType = types[Math.floor(Math.random() * types.length)];
    const newNotif: NotificationItem = {
      id: `sim-${Date.now()}`,
      type: randomType,
      title: `Simulated: ${randomType.replace('_', ' ')}`,
      message: "This is a test notification to demonstrate the toast system.",
      timestamp: new Date().toISOString(),
      read: false,
      isUrgent: Math.random() < 0.3,
    };
    setDisplayedNotifications(prev => [newNotif, ...prev].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    toast({
      title: newNotif.title,
      description: newNotif.message,
      variant: newNotif.isUrgent ? 'destructive' : 'default',
    });
  };

  const handleDeleteAccount = async () => {
    if (isGuestMode || !mongoDbUserId) {
      toast({ title: "Action Disabled", variant: "default" });
      return;
    }
    setIsDeletingAccount(true);
    try {
      await deleteUserAccount(mongoDbUserId);
      toast({ title: "Account Deletion Requested", description: "Your account is scheduled for deletion. You will be logged out." });
      await signOut(auth);
      if (typeof window !== 'undefined') {
        localStorage.clear(); 
        sessionStorage.clear();
      }
      setContextMongoDbUserId(null); 
      updateFullBackendUserFields(null); 
      router.push('/'); 
    } catch (error: any) {
      toast({ title: "Deletion Failed", description: error.message || "Could not delete your account.", variant: "destructive" });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleDataExportRequest = async () => {
    if (isGuestMode || !mongoDbUserId) {
      toast({ title: "Action Disabled", variant: "default" });
      return;
    }
    setIsRequestingExport(true);
    try {
      const result = await requestDataExport(mongoDbUserId);
      toast({ title: "Data Export Requested", description: result.message });
    } catch (error: any) {
      toast({ title: "Export Request Failed", description: error.message || "Could not request data export.", variant: "destructive" });
    } finally {
      setIsRequestingExport(false);
    }
  };


  const saveButtonText = isSaving ? "Saving..." : "Save All Settings";
  const SaveButtonIcon = isSaving ? Loader2 : Save; 

  if ((isLoadingSettings || contextLoading) && !isGuestMode) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const isAuthEmail = auth.currentUser && auth.currentUser.email === userEmail;
  const showRecruiterOnboardingLink = selectedRoleInSettings === 'recruiter' && fullBackendUser && fullBackendUser.companyProfileComplete === false && !isGuestMode;


  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <UserCog className="mx-auto h-12 w-12 text-primary mb-3" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">App Settings</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Manage your role, personal details, and app preferences.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Users className="mr-2 h-5 w-5 text-primary" />
            Your Role
          </CardTitle>
          <CardDescription>Select whether you are currently hiring or looking for a job. This changes the tools and features available to you.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedRoleInSettings ?? undefined}
            onValueChange={(value: UserRole) => setSelectedRoleInSettings(value)}
            className="space-y-2"
            disabled={isGuestMode}
          >
            <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="recruiter" id="role-recruiter" />
              <Label htmlFor="role-recruiter" className="flex items-center text-base cursor-pointer">
                <Users className="mr-2 h-5 w-5 text-orange-500" />
                I'm Hiring (Recruiter)
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="jobseeker" id="role-jobseeker" />
              <Label htmlFor="role-jobseeker" className="flex items-center text-base cursor-pointer">
                <Briefcase className="mr-2 h-5 w-5 text-blue-500" />
                I'm Job Hunting (Job Seeker)
              </Label>
            </div>
          </RadioGroup>
           {showRecruiterOnboardingLink && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
              <Building2 className="h-5 w-5 text-blue-600 inline mr-2" />
              <span className="text-blue-700 font-medium">Your company profile is incomplete.</span>
              <Link href="/recruiter-onboarding" className="ml-1 text-blue-600 hover:underline font-semibold inline-flex items-center">
                  Complete Company Onboarding <ExternalLink className="ml-1 h-3.5 w-3.5"/>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <User className="mr-2 h-5 w-5 text-primary" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Update your contact and personal details. These will be stored in your user profile on our backend.
            {selectedRoleInSettings === 'recruiter' && <span className="block mt-1 text-sm font-medium text-destructive">Recruiters: Full Name and Email are required to post jobs.</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name" className={cn("text-base flex items-center", selectedRoleInSettings === 'recruiter' && "font-semibold")}>
              <User className="mr-2 h-4 w-4 text-muted-foreground" /> Full Name {selectedRoleInSettings === 'recruiter' && <StarIcon className="ml-1 h-3 w-3 text-destructive fill-destructive" />}
            </Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              disabled={isGuestMode}
              className={cn(selectedRoleInSettings === 'recruiter' && !userName.trim() && "border-destructive focus-visible:ring-destructive")}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email" className={cn("text-base flex items-center", selectedRoleInSettings === 'recruiter' && "font-semibold")}>
              <Mail className="mr-2 h-4 w-4 text-muted-foreground" /> Email Address {selectedRoleInSettings === 'recruiter' && <StarIcon className="ml-1 h-3 w-3 text-destructive fill-destructive" />}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              disabled={isGuestMode || isAuthEmail}
              className={cn(selectedRoleInSettings === 'recruiter' && !userEmail.trim() && "border-destructive focus-visible:ring-destructive")}
            />
             {isAuthEmail && !isGuestMode && (
              <p className="text-xs text-muted-foreground">Your primary email is managed by your authentication provider. To change it, please update it there.</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="address" className="text-base flex items-center">
              <Home className="mr-2 h-4 w-4 text-muted-foreground" /> Street Address (Optional)
            </Label>
            <Input
              id="address"
              placeholder="Enter your street address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isGuestMode}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="country" className="text-base flex items-center">
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
            <Label htmlFor="documentId" className="text-base flex items-center">
              <ScanLine className="mr-2 h-4 w-4 text-muted-foreground" /> Document ID (Optional, for verification concept)
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
              onValueChange={(value: UserPreferences['theme']) => setLocalTheme(value)}
              className="flex flex-col sm:flex-row gap-2"
              disabled={isGuestMode}
            >
              <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted/50 transition-colors flex-1">
                <RadioGroupItem value="light" id="theme-light" />
                <Label htmlFor="theme-light" className="flex items-center cursor-pointer"><Sun className="mr-2 h-4 w-4 text-yellow-500" /> Light</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted/50 transition-colors flex-1">
                <RadioGroupItem value="dark" id="theme-dark" />
                <Label htmlFor="theme-dark" className="flex items-center cursor-pointer"><Moon className="mr-2 h-4 w-4 text-blue-400" /> Dark</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted/50 transition-colors flex-1">
                <RadioGroupItem value="system" id="theme-system" />
                <Label htmlFor="theme-system" className="flex items-center cursor-pointer"><Laptop className="mr-2 h-4 w-4 text-gray-500" /> System</Label>
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
            <Label htmlFor="defaultAIScriptTone" className="text-base flex items-center">
              <Bot className="mr-2 h-4 w-4 text-muted-foreground" /> Default AI Script Tone
            </Label>
            <Select
              value={defaultAIScriptTone}
              onValueChange={(value: AIScriptTone) => setDefaultAIScriptTone(value)}
              disabled={isGuestMode}
            >
              <SelectTrigger id="defaultAIScriptTone">
                <SelectValue placeholder="Select default AI script tone" />
              </SelectTrigger>
              <SelectContent>
                {defaultAIScriptToneOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="discoveryItemsPerPage" className="text-base flex items-center">
              <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" /> Discovery Items Per Page
            </Label>
            <Select
              value={String(discoveryItemsPerPage)}
              onValueChange={(value) => setDiscoveryItemsPerPage(Number(value))}
              disabled={isGuestMode}
            >
              <SelectTrigger id="discoveryItemsPerPage">
                <SelectValue placeholder="Select items per page" />
              </SelectTrigger>
              <SelectContent>
                {discoveryItemsPerPageOptions.map(option => (
                  <SelectItem key={option} value={String(option)}>
                    {option} items
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <Label htmlFor="enableExperimentalFeatures" className="text-base flex items-center">
                <Rocket className="mr-2 h-4 w-4 text-muted-foreground" /> Enable Experimental Features
              </Label>
              <p className="text-xs text-muted-foreground">
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
            <CardDescription>Choose how and what you want to be notified about. Email marketing preferences are managed here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <Label className="text-base font-semibold mb-2 block">Notification Channels</Label>
                <div className="space-y-2">
                    {(Object.keys(notificationChannels) as Array<keyof UserPreferences['notificationChannels']>).map(channel => (
                        <div key={channel} className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                            <Label htmlFor={`channel-${channel}`} className="text-sm capitalize flex items-center">
                                {channel === 'email' && <Mail className="mr-2 h-4 w-4 text-muted-foreground"/>}
                                {channel === 'sms' && <MessageSquareText className="mr-2 h-4 w-4 text-muted-foreground"/>}
                                {channel === 'inAppToast' && <Bell className="mr-2 h-4 w-4 text-muted-foreground"/>}
                                {channel === 'inAppBanner' && <Info className="mr-2 h-4 w-4 text-muted-foreground"/>}
                                {channel.replace(/([A-Z])/g, ' $1').trim()}
                            </Label>
                            <Switch id={`channel-${channel}`} checked={notificationChannels[channel]} onCheckedChange={(checked) => handleNotificationChannelChange(channel, checked)} disabled={isGuestMode || channel === 'email' || channel === 'sms'}/>
                        </div>
                    ))}
                    <p className="text-xs text-muted-foreground">Email and SMS notifications are conceptual for now.</p>
                </div>
            </div>
            <div>
                <Label className="text-base font-semibold mb-2 block">Notification & Email Subscriptions</Label>
                <div className="space-y-2">
                    {[
                        { key: 'companyReplies', label: 'Company Replies & Direct Messages', Icon: MessageSquareText },
                        { key: 'matchUpdates', label: 'New Matches & Compatibility Updates', Icon: HeartHandshake },
                        { key: 'applicationStatusChanges', label: 'Application Status Changes', Icon: ListChecks },
                        { key: 'platformAnnouncements', label: 'Platform News & Important Announcements', Icon: BellRing },
                        { key: 'welcomeAndOnboardingEmails', label: 'Welcome & Onboarding Guidance Emails', Icon: Gift },
                        { key: 'contentAndBlogUpdates', label: 'Content Updates & Blog Posts', Icon: Newspaper },
                        { key: 'featureAndPromotionUpdates', label: 'New Features & Promotional Offers', Icon: ShoppingBag },
                    ].map(subItem => (
                         <div key={subItem.key} className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                            <Label htmlFor={`sub-${subItem.key}`} className="text-sm flex items-center">
                                <subItem.Icon className="mr-2 h-4 w-4 text-muted-foreground"/>
                                {subItem.label}
                            </Label>
                            <Switch id={`sub-${subItem.key}`} checked={notificationSubscriptions[subItem.key as keyof UserPreferences['notificationSubscriptions']]} onCheckedChange={(checked) => handleNotificationSubscriptionChange(subItem.key as keyof UserPreferences['notificationSubscriptions'], checked)} disabled={isGuestMode}/>
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
        isGuestMode={isGuestMode}
      />

      {!isGuestMode && (
      <Accordion type="single" collapsible className="w-full" defaultValue={undefined}>
          <Card className="shadow-lg">
            <AccordionItem value="notification-history" className="border-b-0">
              <AccordionTrigger className="px-6 py-4 text-xl font-semibold hover:no-underline group">
                <div className="flex items-center">
                  <Bell className="mr-2 h-5 w-5 text-primary group-hover:text-primary/80 transition-colors" />
                  Notification History
                  <ChevronDown className="h-5 w-5 ml-auto text-muted-foreground group-data-[state=open]:rotate-180 transition-transform" />
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="pt-0 pb-4 px-4">
                  <NotificationHistoryList
                    notifications={displayedNotifications}
                    onMarkAsRead={handleMarkNotificationAsRead}
                    onClearNotification={handleClearNotification}
                  />
                  {displayedNotifications.length > 0 && (
                    <div className="flex flex-col sm:flex-row gap-2 mt-3">
                      <Button variant="outline" size="sm" onClick={handleMarkAllNotificationsAsRead} className="flex-1">Mark All as Read</Button>
                      <Button variant="destructive" size="sm" onClick={handleClearAllNotifications} className="flex-1">Clear All Notifications</Button>
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
          <Button onClick={handleDataExportRequest} variant="outline" className="w-full sm:w-auto" disabled={isGuestMode || isRequestingExport}>
            {isRequestingExport ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileArchive className="mr-2 h-4 w-4" />}
            {isRequestingExport ? "Requesting Export..." : "Request Data Export"}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto" disabled={isGuestMode || isDeletingAccount}>
                <UserX className="mr-2 h-4 w-4" /> Delete My Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <ShadAlertDialogTitle>Are you absolutely sure?</ShadAlertDialogTitle>
                <AlertDialogDescription>
                  This action is permanent and cannot be undone. All your data, including profile, matches, and activity, will be deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeletingAccount}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  {isDeletingAccount ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Yes, Delete My Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Account deletion and data export are conceptual and will not perform real operations in this prototype.
          </p>
        </CardFooter>
      </Card>


      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <MessageCircleQuestion className="mr-2 h-5 w-5 text-primary" />
            Share Your Thoughts
          </CardTitle>
          <CardDescription>Help us improve SwipeHire! Share your feedback, suggestions, or report any issues.</CardDescription>
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
            <Button variant="link" size="sm" onClick={handleSimulateNewNotification} className="mt-4 text-xs">Simulate New Notification (Dev)</Button>
          )}
        </CardContent>
         {isGuestMode && (
          <CardFooter>
            <p className="text-xs text-destructive italic w-full text-center">Feedback submission is disabled in Guest Mode.</p>
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
              <p>Candidate Likes:</p><p className="font-medium text-right">{appStats.candidateLikes}</p>
              <p>Candidate Passes:</p><p className="font-medium text-right">{appStats.candidatePasses}</p>
              <p>Company Likes (Applies):</p><p className="font-medium text-right">{appStats.companyLikes}</p>
              <p>Company Passes:</p><p className="font-medium text-right">{appStats.companyPasses}</p>
              <p>AI Icebreakers Generated:</p><p className="font-medium text-right">{appStats.icebreakersGenerated}</p>
              <p>Simulated Matches Viewed:</p><p className="font-medium text-right">{appStats.matchesViewedCount}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={handleResetStats} className="w-full sm:w-auto text-destructive hover:text-destructive-foreground hover:bg-destructive/90">
              <Trash2 className="mr-2 h-4 w-4" /> Reset Conceptual Stats
            </Button>
          </CardFooter>
        </Card>
      )}

      <CardFooter className="flex justify-end pt-6">
        <Button
          onClick={handleSaveSettings}
          size="lg"
          disabled={isGuestMode || isLoadingSettings || contextLoading || (!mongoDbUserId && !isGuestMode) || isSaving}
        >
          <SaveButtonIcon className={isSaving ? "mr-2 h-5 w-5 animate-spin" : "mr-2 h-5 w-5"} />
          {saveButtonText}
        </Button>
      </CardFooter>
    </div>
  );
}
