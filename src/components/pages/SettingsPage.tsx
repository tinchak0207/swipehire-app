
"use client";

import { useState, useEffect } from 'react';
import type { UserRole, RecruiterPerspectiveWeights, JobSeekerPerspectiveWeights } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from "@/lib/firebase"; // Import db for Firestore
import { doc, getDoc, setDoc } from "firebase/firestore"; // Firestore functions
import { UserCog, Briefcase, Users, ShieldCheck, Mail, User, Home, Globe, ScanLine, Save, MessageSquareText, DollarSign, BarChart3, Sparkles, Film, Brain, Info, TrendingUp, Trash2, MessageCircleQuestion, Settings2, AlertCircle, Loader2, Construction, ListChecks, Rocket } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface SettingsPageProps {
  currentUserRole: UserRole | null;
  onRoleChange: (newRole: UserRole) => void; // This will now primarily trigger Firestore update via HomePage
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

export function SettingsPage({ currentUserRole, onRoleChange, isGuestMode }: SettingsPageProps) {
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
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  const { toast } = useToast();

  const validateWeights = (weights: RecruiterPerspectiveWeights | JobSeekerPerspectiveWeights): boolean => {
    const sum = Object.values(weights).reduce((acc, weight) => acc + Number(weight || 0), 0);
    return sum === 100;
  };

  // Load settings from Firestore
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
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserName(data.name || user.displayName || '');
          setUserEmail(data.email || user.email || '');
          setSelectedRoleInSettings(data.selectedRole || null);
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
        } else {
          // Doc doesn't exist, use Auth info as defaults
          setUserName(user.displayName || '');
          setUserEmail(user.email || '');
          setSelectedRoleInSettings(null); // No role set yet
          setRecruiterWeights(defaultRecruiterWeights);
          setJobSeekerWeights(defaultJobSeekerWeights);
        }
      }).catch(error => {
        console.error("Error fetching user settings from Firestore:", error);
        toast({ title: "Error Loading Settings", description: "Could not load your saved settings.", variant: "destructive" });
        // Fallback to Auth info
        setUserName(user.displayName || '');
        setUserEmail(user.email || '');
      }).finally(() => {
        setIsLoadingSettings(false);
      });
    }
    loadAppStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGuestMode, currentUserRole]);


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
    if (isGuestMode || !auth.currentUser) {
      toast({ title: "Feature Locked", description: "Settings cannot be changed in Guest Mode.", variant: "default" });
      return;
    }
    if (recruiterWeightsError || jobSeekerWeightsError) {
      toast({ title: "Invalid Weights", description: "Please ensure all AI recommendation weights sum to 100% for each perspective.", variant: "destructive" });
      return;
    }

    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const settingsData: any = {
        name: userName,
        // Email is primarily managed by Firebase Auth; only update if different from Auth email and user explicitly changes it.
        // However, if an extension syncs Auth email, this Firestore field might be overwritten.
        // For this prototype, we'll save what's in the form.
        email: userEmail, 
        selectedRole: selectedRoleInSettings,
        address,
        country,
        documentId,
        recruiterAIWeights: recruiterWeights,
        jobSeekerAIWeights: jobSeekerWeights,
        updatedAt: new Date().toISOString(),
      };

      try {
        await setDoc(userDocRef, settingsData, { merge: true });
        toast({
          title: 'Settings Saved',
          description: 'Your preferences and general information have been updated in Firestore.',
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
        console.error("Error saving settings to Firestore:", error);
        let description = "Could not save your settings.";
        if (error.code) {
            description += ` (Error: ${error.code})`;
        } else if (error.message) {
            description += ` (Message: ${error.message})`;
        }
        toast({ title: "Error Saving Settings", description, variant: "destructive" });
      }
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

  const saveButtonText = "Save Settings";
  const SaveButtonIcon = UserCog;

  if (isLoadingSettings && !isGuestMode) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
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
            Update your contact and personal details. These will be stored in your Firestore user document.
            {selectedRoleInSettings === 'recruiter' && " Recruiters: Name and Email are required to post jobs."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-base flex items-center">
              <User className="mr-2 h-4 w-4 text-muted-foreground" /> Full Name
            </Label>
            <Input 
              id="name" 
              placeholder="Enter your full name" 
              value={userName} 
              onChange={(e) => setUserName(e.target.value)} 
              disabled={isGuestMode}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email" className="text-base flex items-center">
              <Mail className="mr-2 h-4 w-4 text-muted-foreground" /> Email Address
            </Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="Enter your email address" 
              value={userEmail} 
              onChange={(e) => setUserEmail(e.target.value)} 
              disabled={isGuestMode || isAuthEmail}
            />
             {isAuthEmail && !isGuestMode && (
              <p className="text-xs text-muted-foreground">Your primary email is managed by Firebase Authentication and synced by the User Document extension. To change it, please use Firebase Auth methods.</p>
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
        <Button onClick={handleSaveSettings} size="lg" disabled={isGuestMode || !!recruiterWeightsError || !!jobSeekerWeightsError || isLoadingSettings}>
          {isLoadingSettings ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <SaveButtonIcon className="mr-2 h-5 w-5" />}
          {saveButtonText}
        </Button>
      </CardFooter>
    </div>
  );
}
    

    

    