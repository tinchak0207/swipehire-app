
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UserCircle, Briefcase, TrendingUp, Star, Edit3, Link as LinkIcon, Save, Lock, Loader2 } from 'lucide-react'; // Added Loader2
import { useUserPreferences } from '@/contexts/UserPreferencesContext'; // Import useUserPreferences

interface MyProfilePageProps {
  isGuestMode?: boolean;
}

const LOCAL_STORAGE_JOBSEEKER_PROFILE_KEY = 'currentUserJobSeekerProfile';
const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';

export function MyProfilePage({ isGuestMode }: MyProfilePageProps) {
  const [profileHeadline, setProfileHeadline] = useState('');
  const [experienceSummary, setExperienceSummary] = useState('');
  const [skills, setSkills] = useState(''); 
  const [desiredWorkStyle, setDesiredWorkStyle] = useState('');
  const [pastProjects, setPastProjects] = useState('');
  const [videoPortfolioLink, setVideoPortfolioLink] = useState('');
  const [isLoading, setIsLoading] = useState(false); // For save button loading state
  const [isFetchingProfile, setIsFetchingProfile] = useState(true); // For initial profile load

  const { toast } = useToast();
  const { mongoDbUserId } = useUserPreferences(); // Get mongoDbUserId

  useEffect(() => {
    if (isGuestMode || typeof window === 'undefined') {
      setIsFetchingProfile(false);
      return;
    }

    const loadProfile = async () => {
      setIsFetchingProfile(true);
      // First, try to load from backend if mongoDbUserId is available
      if (mongoDbUserId) {
        try {
          const response = await fetch(`${CUSTOM_BACKEND_URL}/api/users/${mongoDbUserId}`);
          if (response.ok) {
            const userData = await response.json();
            setProfileHeadline(userData.profileHeadline || '');
            setExperienceSummary(userData.profileExperienceSummary || '');
            setSkills(userData.profileSkills || '');
            setDesiredWorkStyle(userData.profileDesiredWorkStyle || '');
            setPastProjects(userData.profilePastProjects || '');
            setVideoPortfolioLink(userData.profileVideoPortfolioLink || '');
            setIsFetchingProfile(false);
            return; // Profile loaded from backend
          } else {
            console.warn("Failed to fetch profile from backend, status:", response.status, ". Falling back to localStorage.");
          }
        } catch (error) {
          console.error("Error fetching profile from backend:", error, ". Falling back to localStorage.");
        }
      }

      // Fallback to localStorage if backend fetch fails or no mongoDbUserId yet
      const savedProfileString = localStorage.getItem(LOCAL_STORAGE_JOBSEEKER_PROFILE_KEY);
      if (savedProfileString) {
        try {
          const savedProfile = JSON.parse(savedProfileString);
          setProfileHeadline(savedProfile.profileHeadline || '');
          setExperienceSummary(savedProfile.experienceSummary || '');
          setSkills(savedProfile.skills || '');
          setDesiredWorkStyle(savedProfile.desiredWorkStyle || '');
          setPastProjects(savedProfile.pastProjects || '');
          setVideoPortfolioLink(savedProfile.videoPortfolioLink || '');
        } catch (e) {
          console.error("Error parsing saved profile from localStorage:", e);
        }
      }
      setIsFetchingProfile(false);
    };

    loadProfile();

  }, [isGuestMode, mongoDbUserId]);

  const handleSaveProfile = async () => {
    if (isGuestMode) {
      toast({ title: "Action Disabled", description: "Please sign in to save your profile.", variant: "default"});
      return;
    }
    if (!mongoDbUserId) {
      toast({ title: "User Not Identified", description: "Cannot save profile. Please ensure you are fully logged in.", variant: "destructive"});
      return;
    }

    setIsLoading(true);
    const profileData = {
      profileHeadline,
      profileExperienceSummary: experienceSummary,
      profileSkills: skills,
      profileDesiredWorkStyle: desiredWorkStyle,
      profilePastProjects: pastProjects,
      profileVideoPortfolioLink: videoPortfolioLink,
    };

    try {
      // Save to MongoDB backend
      const response = await fetch(`${CUSTOM_BACKEND_URL}/api/users/${mongoDbUserId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "An unknown error occurred while saving to backend."}));
        throw new Error(errorData.message || `Failed to save profile to backend. Status: ${response.status}`);
      }
      
      // Also save to local storage for immediate reflection in CandidateDiscoveryPage (current behavior)
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_JOBSEEKER_PROFILE_KEY, JSON.stringify(profileData));
      }

      toast({
        title: 'Profile Updated & Published!',
        description: 'Your profile has been saved to the backend and is visible to recruiters. (Refresh Find Talent to see changes on the first card).',
        duration: 7000,
      });

    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: 'Error Saving Profile',
        description: error.message || "Could not save your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

  if (isFetchingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your profile...</p>
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
          <Button onClick={handleSaveProfile} size="lg" disabled={isLoading || !mongoDbUserId}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            Update & Publish My Profile
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
