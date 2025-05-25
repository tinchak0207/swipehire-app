
"use client";

import { useState, useEffect } from 'react';
import type { UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea'; // Textarea specific to job seeker profile now in MyProfilePage
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { UserCog, Briefcase, Users, ShieldCheck, Mail, User, Home, Globe, ScanLine, Edit3, Star, Link as LinkIcon, TrendingUp, Save, BadgeCheck, FileText, MessageSquare, DollarSign, BarChart3, Sparkles, Film, Construction, UserCircle } from 'lucide-react';

interface SettingsPageProps {
  currentUserRole: UserRole | null;
  onRoleChange: (newRole: UserRole) => void;
}

export function SettingsPage({ currentUserRole, onRoleChange }: SettingsPageProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(currentUserRole);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [documentId, setDocumentId] = useState('');

  // Job Seeker Specific Fields - MOVED TO MyProfilePage.tsx
  // const [profileHeadline, setProfileHeadline] = useState('');
  // const [experienceSummary, setExperienceSummary] = useState('');
  // const [skills, setSkills] = useState(''); // Comma-separated
  // const [desiredWorkStyle, setDesiredWorkStyle] = useState('');
  // const [pastProjects, setPastProjects] = useState('');
  // const [videoPortfolioLink, setVideoPortfolioLink] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    setSelectedRole(currentUserRole);
    // Load general settings
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

    // Job seeker specific settings are now handled in MyProfilePage.tsx
  }, [currentUserRole]);

  const handleSaveSettings = () => {
    if (selectedRole && selectedRole !== currentUserRole) {
      onRoleChange(selectedRole);
    }
    // Save general settings
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

    // Job seeker specific settings are saved in MyProfilePage.tsx

    toast({
      title: 'Settings Saved',
      description: 'Your preferences and general information have been updated.',
    });
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
            />
          </div>
        </CardContent>
      </Card>

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

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
             <MessageSquare className="mr-2 h-5 w-5 text-primary" />
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

      {selectedRole === 'recruiter' && (
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

      {selectedRole === 'jobseeker' && (
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

      <CardFooter className="flex justify-end pt-6">
        <Button onClick={handleSaveSettings} size="lg">
          <SaveButtonIcon className="mr-2 h-5 w-5" />
          {saveButtonText}
        </Button>
      </CardFooter>
    </div>
  );
}
