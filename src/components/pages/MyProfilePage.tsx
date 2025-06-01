
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UserCircle, Briefcase, TrendingUp, Star, Edit3, Link as LinkIcon, Save, Lock } from 'lucide-react'; // Added Lock

interface MyProfilePageProps {
  isGuestMode?: boolean;
}

// Define the key for localStorage
const LOCAL_STORAGE_JOBSEEKER_PROFILE_KEY = 'currentUserJobSeekerProfile';

export function MyProfilePage({ isGuestMode }: MyProfilePageProps) {
  const [profileHeadline, setProfileHeadline] = useState('');
  const [experienceSummary, setExperienceSummary] = useState('');
  const [skills, setSkills] = useState(''); 
  const [desiredWorkStyle, setDesiredWorkStyle] = useState('');
  const [pastProjects, setPastProjects] = useState('');
  const [videoPortfolioLink, setVideoPortfolioLink] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    if (isGuestMode || typeof window === 'undefined') return;

    const savedProfileString = localStorage.getItem(LOCAL_STORAGE_JOBSEEKER_PROFILE_KEY);
    if (savedProfileString) {
      try {
        const savedProfile = JSON.parse(savedProfileString);
        if (savedProfile.profileHeadline) setProfileHeadline(savedProfile.profileHeadline);
        if (savedProfile.experienceSummary) setExperienceSummary(savedProfile.experienceSummary);
        if (savedProfile.skills) setSkills(savedProfile.skills); // Keep as string
        if (savedProfile.desiredWorkStyle) setDesiredWorkStyle(savedProfile.desiredWorkStyle);
        if (savedProfile.pastProjects) setPastProjects(savedProfile.pastProjects);
        if (savedProfile.videoPortfolioLink) setVideoPortfolioLink(savedProfile.videoPortfolioLink);
      } catch (e) {
        console.error("Error parsing saved profile from localStorage:", e);
        // Optionally clear corrupted data
        // localStorage.removeItem(LOCAL_STORAGE_JOBSEEKER_PROFILE_KEY);
      }
    }
  }, [isGuestMode]);

  const handleSaveProfile = () => {
    if (isGuestMode) {
      toast({ title: "Action Disabled", description: "Please sign in to save your profile.", variant: "default"});
      return;
    }
    if (typeof window !== 'undefined') {
      const profileData = {
        profileHeadline,
        experienceSummary,
        skills, // Save as string
        desiredWorkStyle,
        pastProjects,
        videoPortfolioLink,
      };
      localStorage.setItem(LOCAL_STORAGE_JOBSEEKER_PROFILE_KEY, JSON.stringify(profileData));
      toast({
        title: 'Profile Updated & Published!',
        description: 'Your profile is now visible to recruiters with the latest information. (Refresh Find Talent to see changes reflected on the first candidate card).',
        duration: 7000,
      });
    }
  };

  if (isGuestMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6 bg-background">
        <Lock className="h-16 w-16 text-red-400 mb-6" />
        <h2 className="text-2xl font-semibold text-red-500 mb-3">Access Restricted</h2>
        <p className="text-muted-foreground max-w-md">
          Managing your profile is a feature for registered users. Please sign in using the Login button in the header to create or edit your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <UserCircle className="mx-auto h-12 w-12 text-primary mb-3" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">My Professional Profile</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Craft your profile to stand out to recruiters. This information will be visible to them.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Edit3 className="mr-2 h-5 w-5 text-primary" />
            Edit Your Discoverable Profile
          </CardTitle>
          <CardDescription>This information will be visible to recruiters. Make it compelling!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-1">
            <Label htmlFor="profileHeadline" className="text-base flex items-center">
              <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" /> My Professional Headline / Role
            </Label>
            <Input 
              id="profileHeadline" 
              placeholder="e.g., Senior Software Engineer, Aspiring UX Designer" 
              value={profileHeadline} 
              onChange={(e) => setProfileHeadline(e.target.value)} 
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="experienceSummary" className="text-base flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-muted-foreground" /> My Experience Summary
            </Label>
            <Textarea 
              id="experienceSummary" 
              placeholder="Briefly describe your key experience and what you bring to the table." 
              value={experienceSummary} 
              onChange={(e) => setExperienceSummary(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="skills" className="text-base flex items-center">
              <Star className="mr-2 h-4 w-4 text-muted-foreground" /> My Skills (comma-separated)
            </Label>
            <Input 
              id="skills" 
              placeholder="e.g., React, Python, Project Management, Figma" 
              value={skills} 
              onChange={(e) => setSkills(e.target.value)} 
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="desiredWorkStyle" className="text-base flex items-center">
              <UserCircle className="mr-2 h-4 w-4 text-muted-foreground" /> My Desired Work Style
            </Label>
            <Input 
              id="desiredWorkStyle" 
              placeholder="e.g., Fully Remote, Hybrid, Collaborative team" 
              value={desiredWorkStyle} 
              onChange={(e) => setDesiredWorkStyle(e.target.value)} 
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="pastProjects" className="text-base flex items-center">
              <Edit3 className="mr-2 h-4 w-4 text-muted-foreground" /> My Key Past Projects/Achievements
            </Label>
            <Textarea 
              id="pastProjects" 
              placeholder="Briefly highlight 1-2 significant projects or achievements." 
              value={pastProjects} 
              onChange={(e) => setPastProjects(e.target.value)}
              className="min-h-[80px]" 
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="videoPortfolioLink" className="text-base flex items-center">
              <LinkIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Link to My Video Resume/Portfolio
            </Label>
            <Input 
              id="videoPortfolioLink" 
              type="url"
              placeholder="https://example.com/my-portfolio-or-video.mp4" 
              value={videoPortfolioLink} 
              onChange={(e) => setVideoPortfolioLink(e.target.value)} 
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end pt-6">
          <Button onClick={handleSaveProfile} size="lg">
            <Save className="mr-2 h-5 w-5" />
            Update & Publish My Profile
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}


    