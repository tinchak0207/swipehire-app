
"use client";

import { useState, useEffect } from 'react';
import type { UserRole, RecruiterPerspectiveWeights, JobSeekerPerspectiveWeights } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { UserCog, Briefcase, Users, ShieldCheck, Mail, User, Home, Globe, ScanLine, Save, BadgeCheck, FileText, MessageSquareText, DollarSign, BarChart3, Sparkles, Film, Construction, Brain, Info, TrendingUp, Trash2, MessageCircleQuestion, Settings2, AlertCircle } from 'lucide-react'; // Added Settings2, AlertCircle
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface SettingsPageProps {
  currentUserRole: UserRole | null;
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

export function SettingsPage({ currentUserRole, onRoleChange, isGuestMode }: SettingsPageProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(currentUserRole);
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

  const { toast } = useToast();

  const validateWeights = (weights: RecruiterPerspectiveWeights | JobSeekerPerspectiveWeights): boolean => {
    const sum = Object.values(weights).reduce((acc, weight) => acc + Number(weight || 0), 0);
    return sum === 100;
  };

  useEffect(() => {
    if (!isGuestMode) {
      const savedRecruiterWeights = localStorage.getItem('userRecruiterAIWeights');
      if (savedRecruiterWeights) {
        try {
          const parsed = JSON.parse(savedRecruiterWeights);
          if (validateWeights(parsed)) setRecruiterWeights(parsed);
        } catch (e) { console.error("Error parsing recruiter weights from localStorage", e); }
      }
      const savedJobSeekerWeights = localStorage.getItem('userJobSeekerAIWeights');
      if (savedJobSeekerWeights) {
        try {
          const parsed = JSON.parse(savedJobSeekerWeights);
          if (validateWeights(parsed)) setJobSeekerWeights(parsed);
        } catch (e) { console.error("Error parsing job seeker weights from localStorage", e); }
      }
    }
  }, [isGuestMode]);


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

  useEffect(() => {
    if (isGuestMode) {
      setSelectedRole(null);
      setUserName('Guest User');
      setUserEmail('');
      setAddress('');
      setCountry('');
      setDocumentId('');
      setAppStats(initialAppStats); // Clear stats for guest
      setRecruiterWeights(defaultRecruiterWeights);
      setJobSeekerWeights(defaultJobSeekerWeights);
      return;
    }

    setSelectedRole(currentUserRole);
    const savedName = localStorage.getItem('userNameSettings');
    const savedEmail = localStorage.getItem('userEmailSettings');
    const savedAddress = localStorage.getItem('userAddressSettings');
    const savedCountry = localStorage.getItem('userCountrySettings');
    const savedDocumentId = localStorage.getItem('userDocumentIdSettings');

    if (savedName) setUserName(savedName);
    if (savedEmail) setUserEmail(savedEmail);
    if (savedAddress) setAddress(savedAddress);
    if (savedCountry) setCountry(savedCountry);
    if (savedDocumentId) setDocumentId(savedDocumentId);

    loadAppStats();
  }, [currentUserRole, isGuestMode]);

  const handleSaveSettings = () => {
    if (isGuestMode) {
      toast({ title: "Feature Locked", description: "Settings cannot be changed in Guest Mode.", variant: "default" });
      return;
    }
    if (recruiterWeightsError || jobSeekerWeightsError) {
      toast({ title: "Invalid Weights", description: "Please ensure all AI recommendation weights sum to 100% for each perspective.", variant: "destructive" });
      return;
    }

    if (selectedRole && selectedRole !== currentUserRole) {
      onRoleChange(selectedRole);
    }
    localStorage.setItem('userNameSettings', userName);
    localStorage.setItem('userEmailSettings', userEmail);
    localStorage.setItem('userAddressSettings', address);
    localStorage.setItem('userCountrySettings', country);
    localStorage.setItem('userDocumentIdSettings', documentId);

    if (selectedRole === 'recruiter') {
        const profileComplete = userName.trim() !== '' && userEmail.trim() !== '';
        localStorage.setItem('recruiterProfileComplete', JSON.stringify(profileComplete));
    } else {
        localStorage.removeItem('recruiterProfileComplete');
    }

    localStorage.setItem('userRecruiterAIWeights', JSON.stringify(recruiterWeights));
    localStorage.setItem('userJobSeekerAIWeights', JSON.stringify(jobSeekerWeights));

    toast({
      title: 'Settings Saved',
      description: 'Your preferences and general information have been updated.',
    });
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
      loadAppStats(); // Reload stats to show zeros
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
    // In a real app, you'd send this data to a backend.
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


  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <UserCog className="mx-auto h-12 w-12 text-primary mb-3" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">App Settings</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Manage your role, personal details, and app preferences.
        </p>
      </div>

      {/* Role Selection Card */}
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
            value={selectedRole ?? undefined}
            onValueChange={(value: UserRole) => setSelectedRole(value)}
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

      {/* Personal Information Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <User className="mr-2 h-5 w-5 text-primary" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Update your contact and personal details. 
            {selectedRole === 'recruiter' && " Recruiters: Name and Email are required to post jobs."}
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
              disabled={isGuestMode}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="address" className="text-base flex items-center">
              <Home className="mr-2 h-4 w-4 text-muted-foreground" /> Street Address
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
              <Globe className="mr-2 h-4 w-4 text-muted-foreground" /> Country
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
              <ScanLine className="mr-2 h-4 w-4 text-muted-foreground" /> Document ID (e.g., National ID, Passport)
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
      
      {/* AI Recommendation Customization Card */}
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


      {/* Identity Verification Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
            Identity Verification
          </CardTitle>
          <CardDescription>Verify your identity to build trust and credibility on the platform. (Planned Feature)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We are working on a system to allow you to verify your identity. This will enhance the credibility of your profile or job postings.
            Future verification methods may include:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pl-4">
            <li>Corporate Mailbox Verification</li>
            <li>Job References</li>
            <li>Colleague Cross-Checking</li>
            <li>Document Upload (e.g., professional certificates)</li>
          </ul>
          <div className="p-4 border-2 border-dashed rounded-md text-center bg-muted/50">
            <BadgeCheck className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
            <p className="font-semibold">Verification Portal Coming Soon</p>
            <p className="text-xs text-muted-foreground">Securely upload documents and complete verification steps here.</p>
          </div>
           <Button variant="outline" disabled className="w-full">
            Upload Certificate or Document (Disabled)
          </Button>
        </CardContent>
      </Card>

      {/* App Feedback Card */}
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
      
      {/* App Usage Insights Card */}
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

      {/* Data, Privacy & AI Ethics Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Info className="mr-2 h-5 w-5 text-primary" /> 
            Data, Privacy & AI Ethics
          </CardTitle>
          <CardDescription>Our commitment to responsible technology and protecting your information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            At SwipeHire, we take data privacy, platform usage, and the ethical implications of AI seriously. Below are resources to understand our policies (details coming soon in a full production app):
          </p>
          <div className="space-y-3">
            <div>
              <Label className="flex items-center text-base font-medium text-foreground">
                <FileText className="mr-2 h-4 w-4 text-muted-foreground" /> Platform Usage Policy
              </Label>
              <p className="text-xs text-muted-foreground pl-6">
                Learn about the terms and conditions for using SwipeHire. <span className="italic text-primary/80">(Full policy coming soon)</span>
              </p>
            </div>
            <div>
              <Label className="flex items-center text-base font-medium text-foreground">
                <ShieldCheck className="mr-2 h-4 w-4 text-muted-foreground" /> Data Protection & Privacy
              </Label>
              <p className="text-xs text-muted-foreground pl-6">
                Understand how we collect, use, and protect your personal information and video content. <span className="italic text-primary/80">(Full policy coming soon)</span>
              </p>
            </div>
            <div>
              <Label className="flex items-center text-base font-medium text-foreground">
                <Brain className="mr-2 h-4 w-4 text-muted-foreground" /> AI & Your Data
              </Label>
              <p className="text-xs text-muted-foreground pl-6">
                How AI uses data to provide recommendations and how you can manage your preferences. We are committed to transparency. <span className="italic text-primary/80">(More details coming soon)</span>
              </p>
            </div>
            <div>
              <Label className="flex items-center text-base font-medium text-foreground">
                <Sparkles className="mr-2 h-4 w-4 text-muted-foreground" /> AI Bias Mitigation
              </Label>
              <p className="text-xs text-muted-foreground pl-6">
                Our commitment to fairness and ongoing efforts to identify and mitigate potential biases in AI recommendations and tools. <span className="italic text-primary/80">(Learn more coming soon)</span>
              </p>
            </div>
          </div>
           <Button variant="outline" disabled className="w-full mt-4">
            View Full Policies (Coming Soon)
          </Button>
        </CardContent>
      </Card>

      {/* Employee Evaluation System Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
             <MessageSquareText className="mr-2 h-5 w-5 text-primary" />
            Employee Evaluation System (Conceptual)
          </CardTitle>
          <CardDescription>Settings related to how company culture and work environments are reviewed (Future Feature).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
                This section will allow users to manage settings related to an upcoming employee evaluation system. Our goal is to provide a platform for transparent and constructive feedback.
            </p>
            <div className="p-3 border rounded-md bg-muted/30 space-y-2">
                <p className="text-xs font-medium text-foreground">Key Principles (Planned):</p>
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5 pl-4">
                    <li>Anonymous and secure submissions.</li>
                    <li>Multi-dimensional evaluation (work environment, colleagues, management).</li>
                    <li>Mechanisms for ensuring rating credibility and filtering malicious content.</li>
                    <li>Balanced reporting to show a comprehensive view.</li>
                </ul>
            </div>
            <Button variant="outline" disabled className="w-full">
                Manage Evaluation Preferences (Disabled)
            </Button>
        </CardContent>
      </Card>

      {/* Subscription Plans for Recruiters Card */}
      {selectedRole === 'recruiter' && !isGuestMode && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <DollarSign className="mr-2 h-5 w-5 text-primary" />
              Subscription Plans (Future)
            </CardTitle>
            <CardDescription>
              Unlock powerful features to find the best talent faster.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              SwipeHire aims to provide value at every level. While core features are available to all, advanced functionalities for enterprises will be available through tiered subscriptions:
            </p>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-primary">Basic (Free)</h4>
                <ul className="list-disc list-inside pl-4 text-muted-foreground text-xs">
                  <li>Limited swipe opportunities (e.g., 50/month)</li>
                  <li>Basic screening criteria</li>
                  <li>Standard recommendation algorithm</li>
                  <li>Basic chat function</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-primary">Professional Edition ($299/month - Conceptual)</h4>
                <ul className="list-disc list-inside pl-4 text-muted-foreground text-xs">
                  <li>Unlimited right-sliding opportunities</li>
                  <li>Advanced Screening (Skill Set, Salary Expectation, Arrival Time)</li>
                  <li>Priority Recommendation (Candidates have priority to see corporate information)</li>
                  <li>Batch Operation Functions</li>
                  <li>Detailed Analysis Report</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-primary">Enterprise Edition ($899/month - Conceptual)</h4>
                <ul className="list-disc list-inside pl-4 text-muted-foreground text-xs">
                  <li>All Professional features</li>
                  <li>Multi-Person Collaboration</li>
                  <li>Customized Filtering Criteria</li>
                  <li>API Integration Capability</li>
                  <li>Dedicated Account Manager</li>
                  <li>Brand Exposure Optimization</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-primary">Customized Edition (Contact Us)</h4>
                <ul className="list-disc list-inside pl-4 text-muted-foreground text-xs">
                  <li>All Enterprise features</li>
                  <li>Proprietary Recruitment Funnel Design</li>
                  <li>Deep Integration with Enterprise Systems</li>
                  <li>Professional Consulting Services</li>
                  <li>Data Analysis & Insight Reports</li>
                </ul>
              </div>
            </div>
            <Button variant="outline" disabled className="w-full">
              <BarChart3 className="mr-2 h-4 w-4" /> Manage Subscription (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Value-Added Services for Job Seekers Card */}
      {selectedRole === 'jobseeker' && !isGuestMode && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Sparkles className="mr-2 h-5 w-5 text-primary" />
              Value-Added Services for Job Seekers (Future)
            </CardTitle>
            <CardDescription>
              Accelerate your job search and stand out to recruiters.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-primary">Free Basic Functions</h4>
              <ul className="list-disc list-inside pl-4 text-muted-foreground text-xs">
                <li>Basic Resume Builder</li>
                <li>AI Script Generation (3 times per month)</li>
                <li>Basic Video Recording Function</li>
                <li>Standard Recommendation Algorithm</li>
                <li>Basic Chat Function</li>
                <li>20 Swipe Right Opportunities per month</li>
              </ul>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-primary">Job Search Acceleration Package ($99/month - Conceptual)</h4>
                <ul className="list-disc list-inside pl-4 text-muted-foreground text-xs">
                  <li>Unlimited AI Script Generation</li>
                  <li>Professional Video Filters & Effects</li>
                  <li>Advanced Resume Templates</li>
                  <li>Priority Referrals (Increase Exposure by 30%)</li>
                  <li>Unlimited Right-Sliding Opportunities</li>
                  <li>Interview Preparation Resources</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-primary">Job Hunter Pack ($199/month - Conceptual)</h4>
                <ul className="list-disc list-inside pl-4 text-muted-foreground text-xs">
                  <li>All features of Job Hunting Package</li>
                  <li>Professional image consulting</li>
                  <li>Resume review by industry experts</li>
                  <li>Mock interview practice</li>
                  <li>Career planning guidance</li>
                  <li>Priority notification of inbound opportunities</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-primary">Super Member ($399/month - Conceptual)</h4>
                <ul className="list-disc list-inside pl-4 text-muted-foreground text-xs">
                  <li>All features of the Career Master Package</li>
                  <li>One-on-one career counselor</li>
                  <li>Headhunting service</li>
                  <li>Salary negotiation guidance</li>
                  <li>Background check report</li>
                  <li>Lifetime Member Exclusive Events</li>
                </ul>
              </div>
            </div>
            <Button variant="outline" disabled className="w-full">
              <Film className="mr-2 h-4 w-4" /> Explore Job Seeker Plans (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Save Settings Footer */}
      <CardFooter className="flex justify-end pt-6">
        <Button onClick={handleSaveSettings} size="lg" disabled={isGuestMode || !!recruiterWeightsError || !!jobSeekerWeightsError}>
          <SaveButtonIcon className="mr-2 h-5 w-5" />
          {saveButtonText}
        </Button>
      </CardFooter>
    </div>
  );
}
