
"use client";

import { useState, useEffect, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { UserCircle, Briefcase, TrendingUp, Star, Edit3, Link as LinkIcon, Save, Lock, Loader2, Image as ImageIcon, Globe, Clock, CalendarDays, Type, DollarSign, LanguagesIcon } from 'lucide-react';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { WorkExperienceLevel, EducationLevel, LocationPreference, Availability, JobType } from '@/lib/types';
import NextImage from 'next/image'; // Renamed to avoid conflict with Lucide's Image icon

const LOCAL_STORAGE_JOBSEEKER_PROFILE_KEY = 'currentUserJobSeekerProfile';
const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';

interface MyProfilePageProps {
  isGuestMode?: boolean;
}

// Helper function to format enum values for display
const formatEnumLabel = (value: string) => {
  if (!value) return "";
  return value
    .replace(/_/g, ' ') // Replace underscores with spaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};


export function MyProfilePage({ isGuestMode }: MyProfilePageProps) {
  const [profileHeadline, setProfileHeadline] = useState('');
  const [experienceSummary, setExperienceSummary] = useState('');
  const [skills, setSkills] = useState('');
  const [desiredWorkStyle, setDesiredWorkStyle] = useState('');
  const [pastProjects, setPastProjects] = useState('');
  const [videoPortfolioLink, setVideoPortfolioLink] = useState('');
  
  // Avatar states
  const [avatarUrl, setAvatarUrl] = useState(''); 
  const [avatarFile, setAvatarFile] = useState<File | null>(null); 
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null); 

  const [workExperienceLevel, setWorkExperienceLevel] = useState<WorkExperienceLevel | string>(WorkExperienceLevel.UNSPECIFIED);
  const [educationLevel, setEducationLevel] = useState<EducationLevel | string>(EducationLevel.UNSPECIFIED);
  const [locationPreference, setLocationPreference] = useState<LocationPreference | string>(LocationPreference.UNSPECIFIED);
  const [languages, setLanguages] = useState('');
  const [availability, setAvailability] = useState<Availability | string>(Availability.UNSPECIFIED);
  const [jobTypePreference, setJobTypePreference] = useState('');
  const [salaryExpectationMin, setSalaryExpectationMin] = useState<string>('');
  const [salaryExpectationMax, setSalaryExpectationMax] = useState<string>('');


  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);

  const { toast } = useToast();
  const { mongoDbUserId } = useUserPreferences();

  useEffect(() => {
    if (isGuestMode || typeof window === 'undefined') {
      setIsFetchingProfile(false);
      return;
    }

    const loadProfile = async () => {
      setIsFetchingProfile(true);
      setAvatarPreview(null); 
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
            setAvatarUrl(userData.profileAvatarUrl || ''); 
            setWorkExperienceLevel(userData.profileWorkExperienceLevel || WorkExperienceLevel.UNSPECIFIED);
            setEducationLevel(userData.profileEducationLevel || EducationLevel.UNSPECIFIED);
            setLocationPreference(userData.profileLocationPreference || LocationPreference.UNSPECIFIED);
            setLanguages(userData.profileLanguages || '');
            setAvailability(userData.profileAvailability || Availability.UNSPECIFIED);
            setJobTypePreference(userData.profileJobTypePreference || '');
            setSalaryExpectationMin(userData.profileSalaryExpectationMin?.toString() || '');
            setSalaryExpectationMax(userData.profileSalaryExpectationMax?.toString() || '');
            setIsFetchingProfile(false);
            return;
          } else {
            console.warn("Failed to fetch profile from backend, status:", response.status, ". Falling back to localStorage if available.");
          }
        } catch (error) {
          console.error("Error fetching profile from backend:", error, ". Falling back to localStorage if available.");
        }
      }

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
          setAvatarUrl(savedProfile.avatarUrl || savedProfile.profileAvatarUrl || ''); 
          setWorkExperienceLevel(savedProfile.workExperienceLevel || WorkExperienceLevel.UNSPECIFIED);
          setEducationLevel(savedProfile.educationLevel || EducationLevel.UNSPECIFIED);
          setLocationPreference(savedProfile.locationPreference || LocationPreference.UNSPECIFIED);
          setLanguages(savedProfile.languages || '');
          setAvailability(savedProfile.availability || Availability.UNSPECIFIED);
          setJobTypePreference(savedProfile.jobTypePreference || '');
          setSalaryExpectationMin(savedProfile.salaryExpectationMin?.toString() || '');
          setSalaryExpectationMax(savedProfile.salaryExpectationMax?.toString() || '');
        } catch (e) {
          console.error("Error parsing saved profile from localStorage:", e);
        }
      }
      setIsFetchingProfile(false);
    };

    loadProfile();

  }, [isGuestMode, mongoDbUserId]);

  const handleAvatarFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        toast({ title: "File Too Large", description: "Avatar image must be less than 5MB.", variant: "destructive" });
        event.target.value = ''; 
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast({ title: "Invalid File Type", description: "Please select an image file (PNG, JPG, GIF).", variant: "destructive" });
        event.target.value = ''; 
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast({ title: "Avatar Preview Updated", description: "Click 'Update & Publish My Profile' to save changes including the new avatar." });
    } else {
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  };

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
    
    let currentAvatarFinalUrl = avatarUrl; // Start with the current avatar URL (could be existing or manually typed link if file not changed)

    // Step 1: Upload avatar if a new file is selected
    if (avatarFile) {
      const formData = new FormData();
      formData.append('avatar', avatarFile); // The backend expects 'avatar' as the field name

      try {
        const avatarUploadResponse = await fetch(`${CUSTOM_BACKEND_URL}/api/users/${mongoDbUserId}/avatar`, {
          method: 'POST',
          body: formData,
          // Browser sets Content-Type for FormData automatically
        });

        if (!avatarUploadResponse.ok) {
          const errorData = await avatarUploadResponse.json().catch(() => ({ message: "Avatar upload failed with non-JSON response." }));
          throw new Error(errorData.message || `Avatar upload failed: ${avatarUploadResponse.statusText}`);
        }

        const avatarUploadResult = await avatarUploadResponse.json();
        currentAvatarFinalUrl = avatarUploadResult.profileAvatarUrl; // Get the server-generated URL
        toast({ title: "Avatar Uploaded!", description: "New avatar image saved to server." });
      
      } catch (uploadError: any) {
        console.error("Error uploading avatar:", uploadError);
        toast({
          title: 'Avatar Upload Failed',
          description: uploadError.message || "Could not upload your avatar image. Profile text data will still be saved with the previous avatar.",
          variant: "destructive",
        });
        // Continue to save profile text data with the old avatarUrl (currentAvatarFinalUrl is still the old one)
      }
    }
    
    // Step 2: Save the rest of the profile data (including the potentially updated finalAvatarUrl)
    const profileData = {
      profileHeadline,
      profileExperienceSummary: experienceSummary,
      profileSkills: skills,
      profileDesiredWorkStyle: desiredWorkStyle,
      profilePastProjects: pastProjects,
      profileVideoPortfolioLink: videoPortfolioLink,
      profileAvatarUrl: currentAvatarFinalUrl, // Use the URL from upload, or existing if no new file
      profileWorkExperienceLevel: workExperienceLevel,
      profileEducationLevel: educationLevel,
      profileLocationPreference: locationPreference,
      profileLanguages: languages,
      profileAvailability: availability,
      profileJobTypePreference: jobTypePreference,
      profileSalaryExpectationMin: salaryExpectationMin ? parseInt(salaryExpectationMin, 10) : undefined,
      profileSalaryExpectationMax: salaryExpectationMax ? parseInt(salaryExpectationMax, 10) : undefined,
    };

    try {
      const profileSaveResponse = await fetch(`${CUSTOM_BACKEND_URL}/api/users/${mongoDbUserId}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (!profileSaveResponse.ok) {
        const errorData = await profileSaveResponse.json().catch(() => ({ message: "An unknown error occurred while saving profile data." }));
        throw new Error(errorData.message || `Failed to save profile data: ${profileSaveResponse.statusText}`);
      }
      
      const savedUserResponse = await profileSaveResponse.json();
      // Update local state with the potentially new avatar URL from server
      if (savedUserResponse.user && savedUserResponse.user.profileAvatarUrl) {
          setAvatarUrl(savedUserResponse.user.profileAvatarUrl);
      }
      // Clear file input related states after successful save of everything
      setAvatarFile(null); 
      setAvatarPreview(null);

      if (typeof window !== 'undefined') {
         const localDataToSave = { ...profileData, avatarUrl: currentAvatarFinalUrl }; 
         localStorage.setItem(LOCAL_STORAGE_JOBSEEKER_PROFILE_KEY, JSON.stringify(localDataToSave));
      }

      toast({
        title: 'Profile Updated & Published!',
        description: 'Your profile has been saved to the backend and is visible to recruiters.',
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

  // Construct the full avatar URL if it's a relative path from backend
  const displayAvatarUrl = avatarUrl && avatarUrl.startsWith('/uploads/') 
    ? `${CUSTOM_BACKEND_URL}${avatarUrl}` 
    : avatarUrl;


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
          <div className="space-y-2">
            <Label htmlFor="avatarUpload" className="text-base flex items-center">
              <ImageIcon className="mr-2 h-4 w-4 text-muted-foreground" /> My Avatar (Upload Image)
            </Label>
            <div className="flex items-center gap-4">
              {avatarPreview ? (
                <NextImage src={avatarPreview} alt="Avatar Preview" width={80} height={80} className="rounded-full object-cover border" data-ai-hint="user avatar"/>
              ) : displayAvatarUrl ? (
                <NextImage src={displayAvatarUrl} alt="Current Avatar" width={80} height={80} className="rounded-full object-cover border" data-ai-hint="user avatar" unoptimized={displayAvatarUrl.startsWith('http://localhost')}/>
              ) : (
                <UserCircle className="h-20 w-20 text-muted-foreground border rounded-full p-1" />
              )}
              <Input 
                id="avatarUpload" 
                type="file"
                accept="image/*" 
                onChange={handleAvatarFileChange} 
                className="file:text-primary file:font-semibold file:bg-primary/10 file:hover:bg-primary/20 file:rounded-md file:px-3 file:py-1.5 file:mr-3 file:border-none"
              />
            </div>
            <p className="text-xs text-muted-foreground">Max 5MB. PNG, JPG, GIF.</p>
          </div>

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
            <Label htmlFor="workExperienceLevel" className="text-base flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" /> Work Experience Level
            </Label>
            <Select value={workExperienceLevel} onValueChange={(value) => setWorkExperienceLevel(value as WorkExperienceLevel)}>
              <SelectTrigger id="workExperienceLevel"><SelectValue placeholder="Select experience level" /></SelectTrigger>
              <SelectContent>
                {Object.values(WorkExperienceLevel).map(level => (
                  <SelectItem key={level} value={level}>{formatEnumLabel(level)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="educationLevel" className="text-base flex items-center">
              <UserCircle className="mr-2 h-4 w-4 text-muted-foreground" /> Education Level
            </Label>
            <Select value={educationLevel} onValueChange={(value) => setEducationLevel(value as EducationLevel)}>
              <SelectTrigger id="educationLevel"><SelectValue placeholder="Select education level" /></SelectTrigger>
              <SelectContent>
                {Object.values(EducationLevel).map(level => (
                  <SelectItem key={level} value={level}>{formatEnumLabel(level)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Label htmlFor="locationPreference" className="text-base flex items-center">
              <Globe className="mr-2 h-4 w-4 text-muted-foreground" /> My Location Preference
            </Label>
            <Select value={locationPreference} onValueChange={(value) => setLocationPreference(value as LocationPreference)}>
              <SelectTrigger id="locationPreference"><SelectValue placeholder="Select location preference" /></SelectTrigger>
              <SelectContent>
                {Object.values(LocationPreference).map(pref => (
                  <SelectItem key={pref} value={pref}>{formatEnumLabel(pref)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="languages" className="text-base flex items-center">
              <LanguagesIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Languages Spoken (comma-separated)
            </Label>
            <Input 
              id="languages" 
              placeholder="e.g., English, Spanish, French" 
              value={languages} 
              onChange={(e) => setLanguages(e.target.value)} 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
                <Label htmlFor="salaryExpectationMin" className="text-base flex items-center">
                <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" /> Min Salary Expectation (Annual)
                </Label>
                <Input 
                id="salaryExpectationMin" 
                type="number"
                placeholder="e.g., 80000" 
                value={salaryExpectationMin} 
                onChange={(e) => setSalaryExpectationMin(e.target.value)} 
                />
            </div>
            <div className="space-y-1">
                <Label htmlFor="salaryExpectationMax" className="text-base flex items-center">
                <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" /> Max Salary Expectation (Annual)
                </Label>
                <Input 
                id="salaryExpectationMax" 
                type="number"
                placeholder="e.g., 120000" 
                value={salaryExpectationMax} 
                onChange={(e) => setSalaryExpectationMax(e.target.value)} 
                />
            </div>
          </div>
           <div className="space-y-1">
            <Label htmlFor="availability" className="text-base flex items-center">
              <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" /> My Availability
            </Label>
            <Select value={availability} onValueChange={(value) => setAvailability(value as Availability)}>
              <SelectTrigger id="availability"><SelectValue placeholder="Select availability" /></SelectTrigger>
              <SelectContent>
                {Object.values(Availability).map(avail => (
                  <SelectItem key={avail} value={avail}>{formatEnumLabel(avail)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="jobTypePreference" className="text-base flex items-center">
              <Type className="mr-2 h-4 w-4 text-muted-foreground" /> Preferred Job Types (comma-separated)
            </Label>
             <Input 
              id="jobTypePreference" 
              placeholder="e.g., Full-time, Contract" 
              value={jobTypePreference} 
              onChange={(e) => setJobTypePreference(e.target.value)} 
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

