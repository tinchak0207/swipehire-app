
"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import type { UserRole, RecruiterPerspectiveWeights, JobSeekerPerspectiveWeights, UserPreferences, AIScriptTone } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { auth } from "@/lib/firebase"; 
// Firestore imports removed
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { UserCog, Briefcase, Users, ShieldCheck, Mail, User, Home, Globe, ScanLine, Save, MessageSquareText, DollarSign, BarChart3, Sparkles, Film, Brain, Info, TrendingUp, Trash2, MessageCircleQuestion, Settings2, AlertCircle, Loader2, Construction, ListChecks, Rocket, Palette, Moon, Sun, Laptop, SlidersHorizontal, Bot, BookOpen, Star as StarIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';

interface SettingsPageProps {
  currentUserRole: UserRole | null; // This is the role from HomePage (derived from Firebase or backend)
  onRoleChange: (newRole: UserRole) => void; 
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


export function SettingsPage({ currentUserRole, onRoleChange, isGuestMode }: SettingsPageProps) {
  const { preferences: contextPreferences, setPreferences: setContextPreferences, loadingPreferences: contextLoading, mongoDbUserId, fetchAndSetUserPreferences } = useUserPreferences();
  
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
  const [recruiterWeightsError, setRecruiterWeightsError] = useState<string | null>(null);
  const [jobSeekerWeightsError, setJobSeekerWeightsError] = useState<string | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true); // For loading name, email, etc.
  const [isSaving, setIsSaving] = useState(false); // For save button loading state

  // State for new preferences
  const [localTheme, setLocalTheme] = useState<UserPreferences['theme']>(contextPreferences.theme);
  const [localFeatureFlags, setLocalFeatureFlags] = useState<Record<string, boolean>>(contextPreferences.featureFlags || {});
  const [defaultAIScriptTone, setDefaultAIScriptTone] = useState<AIScriptTone>(contextPreferences.defaultAIScriptTone || 'professional');
  const [discoveryItemsPerPage, setDiscoveryItemsPerPage] = useState<number>(contextPreferences.discoveryItemsPerPage || 10);
  const [enableExperimentalFeatures, setEnableExperimentalFeatures] = useState<boolean>(contextPreferences.enableExperimentalFeatures || false);


  const { toast } = useToast();

  const validateWeights = (weights: RecruiterPerspectiveWeights | JobSeekerPerspectiveWeights): boolean => {
    const sum = Object.values(weights).reduce((acc, weight) => acc + Number(weight || 0), 0);
    return sum === 100;
  };

  useEffect(() => {
    if (!contextLoading) {
      setLocalTheme(contextPreferences.theme);
      setLocalFeatureFlags(contextPreferences.featureFlags || {});
      setDefaultAIScriptTone(contextPreferences.defaultAIScriptTone || 'professional');
      setDiscoveryItemsPerPage(contextPreferences.discoveryItemsPerPage || 10);
      setEnableExperimentalFeatures(contextPreferences.enableExperimentalFeatures || false);
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
    const user = auth.currentUser; // Firebase user

    if (user && mongoDbUserId) { // Ensure we have MongoDB ID to fetch
      fetch(`${CUSTOM_BACKEND_URL}/api/users/${mongoDbUserId}`)
        .then(res => {
          if (!res.ok) throw new Error(`User not found in MongoDB or backend error: ${res.status}`);
          return res.json();
        })
        .then(data => {
          setUserName(data.name || user.displayName || '');
          setUserEmail(data.email || user.email || '');
          setSelectedRoleInSettings(data.selectedRole || currentUserRole || null);
          setAddress(data.address || '');
          setCountry(data.country || '');
          setDocumentId(data.documentId || '');

          if (data.recruiterAIWeights && validateWeights(data.recruiterAIWeights)) {
            setRecruiterWeights(data.recruiterAIWeights);
          } else {
            setRecruiterWeights(defaultRecruiterWeights);
          }
          if (data.jobSeekerAIWeights && validateWeights(data.jobSeekerAIWeights)) {
            setJobSeekerWeights(data.jobSeekerAIWeights);
          } else {
            setJobSeekerWeights(defaultJobSeekerWeights);
          }
          // Preferences (theme, feature flags, and new tailored ones) are loaded by UserPreferencesContext and synced to local state
        })
        .catch(error => {
          console.error("Error fetching user settings from MongoDB backend:", error);
          toast({ title: "Error Loading Settings", description: "Could not load your saved settings. Please ensure your profile is complete.", variant: "destructive" });
          setUserName(user.displayName || '');
          setUserEmail(user.email || '');
          setSelectedRoleInSettings(currentUserRole || null); 
        })
        .finally(() => {
          setIsLoadingSettings(false);
        });
    } else if (user && !mongoDbUserId) {
      setUserName(user.displayName || '');
      setUserEmail(user.email || '');
      setSelectedRoleInSettings(currentUserRole || null);
      setIsLoadingSettings(false); 
       toast({ title: "Profile Sync Pending", description: "Your profile data is being synced. Some settings might be unavailable until sync is complete.", variant: "default", duration: 7000 });
    } else {
      setIsLoadingSettings(false); 
    }
    loadAppStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGuestMode, currentUserRole, mongoDbUserId]); 


  useEffect(() => {
    setRecruiterWeightsError(validateWeights(recruiterWeights) ? null : "Weights must sum to 100%.");
  }, [recruiterWeights]);

  useEffect(() => {
    setJobSeekerWeightsError(validateWeights(jobSeekerWeights) ? null : "Weights must sum to 100%.");
  }, [jobSeekerWeights]);


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
    if (recruiterWeightsError || jobSeekerWeightsError) {
      toast({ title: "Invalid Weights", description: "Please ensure all AI recommendation weights sum to 100% for each perspective.", variant: "destructive" });
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
      };
      
      try {
        // Use the new POST proxy endpoint
        const response = await fetch(`${CUSTOM_BACKEND_URL}/api/proxy/users/${mongoDbUserId}/settings`, {
          method: 'POST', // Changed from PUT to POST
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settingsData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `Failed to save settings. Status: ${response.status}` }));
          throw new Error(errorData.message);
        }
        
        await setContextPreferences(currentPreferencesToSave); 
        
        toast({
          title: 'Settings Saved',
          description: 'Your preferences and general information have been updated.',
        });
        if (selectedRoleInSettings && selectedRoleInSettings !== currentUserRole) {
          onRoleChange(selectedRoleInSettings); 
        }
        if (selectedRoleInSettings === 'recruiter' && userName.trim() !== '' && userEmail.trim() !== '') {
            localStorage.setItem('recruiterProfileComplete', 'true');
        } else if (selectedRoleInSettings === 'recruiter') {
            localStorage.setItem('recruiterProfileComplete', 'false');
        } else {
             localStorage.removeItem('recruiterProfileComplete');
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

  const handleWeightChange = (
    perspective: 'recruiter' | 'jobSeeker',
    field: keyof RecruiterPerspectiveWeights | keyof JobSeekerPerspectiveWeights,
    value: string
  ) => {
    const numValue = parseInt(value, 10);
    const val = isNaN(numValue) ? 0 : Math.max(0, Math.min(100, numValue));

    if (perspective === 'recruiter') {
      setRecruiterWeights(prev => ({ ...prev, [field]: val }));
    } else {
      setJobSeekerWeights(prev => ({ ...prev, [field]: val }));
    }
  };
  
  const handleFeatureFlagChange = (flagName: string, checked: boolean) => {
    setLocalFeatureFlags(prev => ({...prev, [flagName]: checked }));
  };


  const saveButtonText = isSaving ? "Saving..." : "Save Settings";
  const SaveButtonIcon = isSaving ? Loader2 : UserCog;

  if ((isLoadingSettings || contextLoading) && !isGuestMode) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const isAuthEmail = auth.currentUser && auth.currentUser.email === userEmail;


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
      
      {!isGuestMode && (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Settings2 className="mr-2 h-5 w-5 text-primary" />
            AI Recommendation Customization
          </CardTitle>
          <CardDescription>
            Adjust how our AI weighs different factors when matching candidates to jobs (for recruiters) or jobs to you (for job seekers). Ensure weights for each perspective sum to 100%.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-md mb-2 text-foreground">Recruiter Perspective (Candidate to Job Fit)</h4>
            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(recruiterWeights) as Array<keyof RecruiterPerspectiveWeights>).map((key) => (
                <div key={key} className="space-y-1">
                  <Label htmlFor={`recruiter-${key}`} className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').replace(' Score', '')}</Label>
                  <Input
                    id={`recruiter-${key}`}
                    type="number"
                    min="0" max="100" step="5"
                    value={recruiterWeights[key]}
                    onChange={(e) => handleWeightChange('recruiter', key, e.target.value)}
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
            {recruiterWeightsError && <p className="text-xs text-destructive mt-2 flex items-center"><AlertCircle size={14} className="mr-1"/> {recruiterWeightsError}</p>}
          </div>

          <div>
            <h4 className="font-semibold text-md mb-2 text-foreground">Job Seeker Perspective (Job to Candidate Fit)</h4>
            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(jobSeekerWeights) as Array<keyof JobSeekerPerspectiveWeights>).map((key) => (
                <div key={key} className="space-y-1">
                  <Label htmlFor={`jobseeker-${key}`} className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').replace(' Score', '')}</Label>
                  <Input
                    id={`jobseeker-${key}`}
                    type="number"
                    min="0" max="100" step="5"
                    value={jobSeekerWeights[key]}
                    onChange={(e) => handleWeightChange('jobSeeker', key, e.target.value)}
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
            {jobSeekerWeightsError && <p className="text-xs text-destructive mt-2 flex items-center"><AlertCircle size={14} className="mr-1"/> {jobSeekerWeightsError}</p>}
          </div>
        </CardContent>
      </Card>
      )}

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
          disabled={isGuestMode || !!recruiterWeightsError || !!jobSeekerWeightsError || isLoadingSettings || contextLoading || (!mongoDbUserId && !isGuestMode) || isSaving}
        >
          <SaveButtonIcon className={isSaving ? "mr-2 h-5 w-5 animate-spin" : "mr-2 h-5 w-5"} />
          {saveButtonText}
        </Button>
      </CardFooter>
    </div>
  );
}

