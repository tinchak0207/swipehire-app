
"use client";

import { useState, useEffect, type ChangeEvent, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle as ShadDialogTitle } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { UserCircle, Briefcase, TrendingUp, Star, Edit3, Link as LinkIcon, Save, Lock, Loader2, Image as ImageIcon, Globe, Clock, CalendarDays, Type, DollarSign, LanguagesIcon, Eye, Palette as PaletteIcon, X } from 'lucide-react';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { WorkExperienceLevel, EducationLevel, LocationPreference, Availability, JobType, type Candidate } from '@/lib/types';
import NextImage from 'next/image';
import ProfileCard from '@/components/cards/ProfileCard'; // Changed import from SwipeCard/CandidateCardContent
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const envBackendUrl = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL;
const CUSTOM_BACKEND_URL = (envBackendUrl && envBackendUrl.trim() !== "") ? envBackendUrl : 'http://localhost:5000';

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

const jobTypeEnumOptions = Object.values(JobType).filter(jt => jt !== JobType.UNSPECIFIED);


export function MyProfilePage({ isGuestMode }: MyProfilePageProps) {
  const [profileHeadline, setProfileHeadline] = useState('');
  const [experienceSummary, setExperienceSummary] = useState('');
  
  const [skillList, setSkillList] = useState<string[]>([]);
  const [currentSkillInputValue, setCurrentSkillInputValue] = useState('');

  const [desiredWorkStyle, setDesiredWorkStyle] = useState('');
  const [pastProjects, setPastProjects] = useState('');
  const [videoPortfolioLink, setVideoPortfolioLink] = useState('');

  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [workExperienceLevel, setWorkExperienceLevel] = useState<WorkExperienceLevel | string>(WorkExperienceLevel.UNSPECIFIED);
  const [educationLevel, setEducationLevel] = useState<EducationLevel | string>(EducationLevel.UNSPECIFIED);
  const [locationPreference, setLocationPreference] = useState<LocationPreference | string>(LocationPreference.UNSPECIFIED);
  
  const [languageList, setLanguageList] = useState<string[]>([]);
  const [currentLanguageInputValue, setCurrentLanguageInputValue] = useState('');

  const [availability, setAvailability] = useState<Availability | string>(Availability.UNSPECIFIED);
  
  const [jobTypePreferenceList, setJobTypePreferenceList] = useState<JobType[]>([]);
  const [currentSelectedJobType, setCurrentSelectedJobType] = useState<JobType | string>("");


  const [salaryExpectationMin, setSalaryExpectationMin] = useState<string>('');
  const [salaryExpectationMax, setSalaryExpectationMax] = useState<string>('');
  const [selectedCardTheme, setSelectedCardTheme] = useState<string>('default'); // This is for candidate's own card theming choice, ProfileCard itself doesn't use this directly for its base style


  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);


  const { toast } = useToast();
  const { mongoDbUserId } = useUserPreferences();

  useEffect(() => {
    if (isGuestMode || typeof window === 'undefined') {
      setIsFetchingProfile(false);
      return;
    }

    const loadProfile = async () => {
      setIsFetchingProfile(true);
      setAvatarPreview(null); // Reset preview before loading
      if (mongoDbUserId) {
        try {
          const response = await fetch(`${CUSTOM_BACKEND_URL}/api/users/${mongoDbUserId}`);
          if (response.ok) {
            const userData = await response.json();
            setProfileHeadline(userData.profileHeadline || '');
            setExperienceSummary(userData.profileExperienceSummary || '');
            setSkillList(userData.profileSkills ? userData.profileSkills.split(',').map((s:string) => s.trim()).filter((s:string) => s) : []);
            setDesiredWorkStyle(userData.profileDesiredWorkStyle || '');
            setPastProjects(userData.profilePastProjects || '');
            setVideoPortfolioLink(userData.profileVideoPortfolioLink || '');
            setAvatarUrl(userData.profileAvatarUrl || '');
            setWorkExperienceLevel(userData.profileWorkExperienceLevel || WorkExperienceLevel.UNSPECIFIED);
            setEducationLevel(userData.profileEducationLevel || EducationLevel.UNSPECIFIED);
            setLocationPreference(userData.profileLocationPreference || LocationPreference.UNSPECIFIED);
            setLanguageList(userData.profileLanguages ? userData.profileLanguages.split(',').map((s:string) => s.trim()).filter((s:string) => s) : []);
            setAvailability(userData.profileAvailability || Availability.UNSPECIFIED);
            setJobTypePreferenceList(userData.profileJobTypePreference ? userData.profileJobTypePreference.split(',').map((s:string) => s.trim() as JobType).filter((s:JobType) => s && Object.values(JobType).includes(s)) : []);
            setSalaryExpectationMin(userData.profileSalaryExpectationMin?.toString() || '');
            setSalaryExpectationMax(userData.profileSalaryExpectationMax?.toString() || '');
            setSelectedCardTheme(userData.profileCardTheme || 'default'); // Load chosen theme
            setIsFetchingProfile(false);
            return;
          } else {
            console.warn("Failed to fetch profile from backend, status:", response.status, ". Profile fields will be empty or default.");
            toast({
              title: "Profile Not Found or Error",
              description: "Could not load your profile from the server. Please fill in your details.",
              variant: "default",
              duration: 7000,
            });
          }
        } catch (error) {
          console.error("Error fetching profile from backend:", error, ". Profile fields will be empty or default.");
           toast({
              title: "Error Loading Profile",
              description: "An error occurred while trying to load your profile. Please check your connection or try again later.",
              variant: "destructive",
            });
        }
      }
      // If mongoDbUserId is not available or fetch failed, keep fields as default/empty
      setProfileHeadline('');
      setExperienceSummary('');
      setSkillList([]);
      setDesiredWorkStyle('');
      setPastProjects('');
      setVideoPortfolioLink('');
      setAvatarUrl('');
      setWorkExperienceLevel(WorkExperienceLevel.UNSPECIFIED);
      setEducationLevel(EducationLevel.UNSPECIFIED);
      setLocationPreference(LocationPreference.UNSPECIFIED);
      setLanguageList([]);
      setAvailability(Availability.UNSPECIFIED);
      setJobTypePreferenceList([]);
      setSalaryExpectationMin('');
      setSalaryExpectationMax('');
      setSelectedCardTheme('default');
      setIsFetchingProfile(false);
    };

    loadProfile();

  }, [isGuestMode, mongoDbUserId, toast]);

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

  const handleAddSkill = () => {
    const newSkill = currentSkillInputValue.trim();
    if (newSkill && !skillList.includes(newSkill)) {
      setSkillList([...skillList, newSkill]);
    }
    setCurrentSkillInputValue('');
  };

  const handleSkillInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkillList(skillList.filter(skill => skill !== skillToRemove));
  };

  const handleAddLanguage = () => {
    const newLanguage = currentLanguageInputValue.trim();
    if (newLanguage && !languageList.includes(newLanguage)) {
      setLanguageList([...languageList, newLanguage]);
    }
    setCurrentLanguageInputValue('');
  };

  const handleLanguageInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddLanguage();
    }
  };

  const handleRemoveLanguage = (langToRemove: string) => {
    setLanguageList(languageList.filter(lang => lang !== langToRemove));
  };

  const handleAddJobTypePreference = () => {
    const newJobType = currentSelectedJobType as JobType;
    if (newJobType && jobTypeEnumOptions.includes(newJobType) && !jobTypePreferenceList.includes(newJobType)) {
      if (jobTypePreferenceList.length < 5) { // Limit to 5 preferences
        setJobTypePreferenceList([...jobTypePreferenceList, newJobType]);
      } else {
        toast({ title: "Limit Reached", description: "You can select up to 5 job type preferences.", variant: "default"});
      }
    }
    setCurrentSelectedJobType(""); // Reset select
  };
  
  const handleRemoveJobTypePreference = (jobTypeToRemove: JobType) => {
    setJobTypePreferenceList(jobTypePreferenceList.filter(jt => jt !== jobTypeToRemove));
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

    let finalAvatarUrl = avatarUrl; 

    if (avatarFile) {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      try {
        const avatarUploadResponse = await fetch(`${CUSTOM_BACKEND_URL}/api/users/${mongoDbUserId}/avatar`, {
          method: 'POST',
          body: formData,
        });

        if (!avatarUploadResponse.ok) {
          const errorData = await avatarUploadResponse.json().catch(() => ({ message: "Avatar upload failed with non-JSON response." }));
          throw new Error(errorData.message || `Avatar upload failed: ${avatarUploadResponse.statusText}`);
        }

        const avatarUploadResult = await avatarUploadResponse.json();
        finalAvatarUrl = avatarUploadResult.profileAvatarUrl;
        setAvatarUrl(finalAvatarUrl); 
        toast({ title: "Avatar Uploaded!", description: "New avatar image saved to server." });

      } catch (uploadError: any) {
        console.error("Error uploading avatar:", uploadError);
        toast({
          title: 'Avatar Upload Failed',
          description: uploadError.message || "Could not upload your avatar image. Profile text data will still be saved with the previous avatar.",
          variant: "destructive",
        });
      }
    }

    const profileData = {
      profileHeadline,
      profileExperienceSummary: experienceSummary,
      profileSkills: skillList.join(','),
      profileDesiredWorkStyle: desiredWorkStyle,
      profilePastProjects: pastProjects,
      profileVideoPortfolioLink: videoPortfolioLink,
      profileAvatarUrl: finalAvatarUrl,
      profileWorkExperienceLevel: workExperienceLevel,
      profileEducationLevel: educationLevel,
      profileLocationPreference: locationPreference,
      profileLanguages: languageList.join(','),
      profileAvailability: availability,
      profileJobTypePreference: jobTypePreferenceList.join(','),
      profileSalaryExpectationMin: salaryExpectationMin ? parseInt(salaryExpectationMin, 10) : undefined,
      profileSalaryExpectationMax: salaryExpectationMax ? parseInt(salaryExpectationMax, 10) : undefined,
      profileCardTheme: selectedCardTheme,
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
      if (savedUserResponse.user && savedUserResponse.user.profileAvatarUrl) {
          setAvatarUrl(savedUserResponse.user.profileAvatarUrl);
      }
      if (savedUserResponse.user && savedUserResponse.user.profileCardTheme) {
          setSelectedCardTheme(savedUserResponse.user.profileCardTheme);
      }
      setAvatarFile(null); 
      setAvatarPreview(null); 

      toast({
        title: 'Profile Updated & Published!',
        description: 'Your profile has been saved to the backend and is visible to recruiters.',
      });

    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: 'Error Saving Profile',
        description: error.message || "An unknown error occurred while saving to backend.",
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
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const currentDisplayAvatarUrl = avatarPreview
    ? avatarPreview
    : avatarUrl && avatarUrl.startsWith('/uploads/')
      ? `${CUSTOM_BACKEND_URL}${avatarUrl}`
      : avatarUrl || `https://placehold.co/96x96.png?text=${profileHeadline?.[0] || 'P'}`; // Changed placeholder size
  

  const candidatePreviewData: Candidate = {
    id: mongoDbUserId || 'preview-user',
    name: 'Your Name (Preview)', 
    role: profileHeadline,
    experienceSummary,
    skills: skillList,
    avatarUrl: currentDisplayAvatarUrl,
    videoResumeUrl: videoPortfolioLink || undefined,
    location: 'Your Location (Preview)', // You might want to add a form field for actual location
    desiredWorkStyle: desiredWorkStyle,
    pastProjects,
    workExperienceLevel: workExperienceLevel as WorkExperienceLevel,
    educationLevel: educationLevel as EducationLevel,
    locationPreference: locationPreference as LocationPreference,
    languages: languageList,
    salaryExpectationMin: salaryExpectationMin ? parseInt(salaryExpectationMin) : undefined,
    salaryExpectationMax: salaryExpectationMax ? parseInt(salaryExpectationMax) : undefined,
    availability: availability as Availability,
    jobTypePreference: jobTypePreferenceList,
    cardTheme: selectedCardTheme, // This will be passed to ProfileCard but ProfileCard doesn't use it directly
    profileStrength: 80, // Example value
    personalityAssessment: [], // Example value
    optimalWorkStyles: [], // Example value
    isUnderestimatedTalent: false, // Example value
  };


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
              {currentDisplayAvatarUrl ? (
                <NextImage 
                  src={currentDisplayAvatarUrl} 
                  alt="Avatar Preview" 
                  width={80} 
                  height={80} 
                  className="rounded-full object-cover border" 
                  data-ai-hint="user avatar" 
                  unoptimized={currentDisplayAvatarUrl.startsWith(CUSTOM_BACKEND_URL) || currentDisplayAvatarUrl.startsWith('http://localhost')}
                />
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
          
          <div className="space-y-2">
            <Label htmlFor="skillsInput" className="text-base flex items-center">
              <Star className="mr-2 h-4 w-4 text-muted-foreground" /> My Skills (add one by one)
            </Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skillList.map((skill, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 text-sm py-1 px-2">
                  {skill}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemoveSkill(skill)}
                    aria-label={`Remove skill ${skill}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="skillsInput"
                placeholder="Type a skill (e.g., React) and press Enter"
                value={currentSkillInputValue}
                onChange={(e) => setCurrentSkillInputValue(e.target.value)}
                onKeyDown={handleSkillInputKeyDown}
                className="flex-grow"
              />
              <Button type="button" onClick={handleAddSkill} variant="outline" size="sm">Add Skill</Button>
            </div>
            <p className="text-xs text-muted-foreground">Enter skills individually. They will appear as tags above.</p>
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
          
          <div className="space-y-2">
            <Label htmlFor="languageInput" className="text-base flex items-center">
              <LanguagesIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Languages Spoken (add one by one)
            </Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {languageList.map((lang, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 text-sm py-1 px-2">
                  {lang}
                  <Button type="button" variant="ghost" size="icon" className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleRemoveLanguage(lang)} aria-label={`Remove language ${lang}`}>
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input id="languageInput" placeholder="Type a language (e.g., Spanish) and press Enter" value={currentLanguageInputValue} onChange={(e) => setCurrentLanguageInputValue(e.target.value)} onKeyDown={handleLanguageInputKeyDown} className="flex-grow"/>
              <Button type="button" onClick={handleAddLanguage} variant="outline" size="sm">Add Language</Button>
            </div>
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

          <div className="space-y-2">
            <Label className="text-base flex items-center">
              <Type className="mr-2 h-4 w-4 text-muted-foreground" /> Preferred Job Types
            </Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {jobTypePreferenceList.map((jobType, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 text-sm py-1 px-2">
                  {formatEnumLabel(jobType)}
                  <Button type="button" variant="ghost" size="icon" className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleRemoveJobTypePreference(jobType)} aria-label={`Remove job type ${jobType}`}>
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Select value={currentSelectedJobType} onValueChange={(value) => setCurrentSelectedJobType(value as JobType)} >
                <SelectTrigger id="jobTypePreferenceSelect" className="flex-grow">
                  <SelectValue placeholder="Select job type preference" />
                </SelectTrigger>
                <SelectContent>
                  {jobTypeEnumOptions.map(type => (
                    <SelectItem key={type} value={type} disabled={jobTypePreferenceList.includes(type)}>
                      {formatEnumLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={handleAddJobTypePreference} variant="outline" size="sm" disabled={!currentSelectedJobType || jobTypePreferenceList.includes(currentSelectedJobType as JobType) || jobTypePreferenceList.length >=5}>
                Add Preference
              </Button>
            </div>
             <p className="text-xs text-muted-foreground">Select up to 5 job type preferences.</p>
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
          {/* Card Theme selection is removed as ProfileCard doesn't use themes the same way CompanyCardContent does. ProfileCard has a fixed style. */}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center pt-6 gap-4">
          <Button variant="outline" onClick={() => setIsPreviewModalOpen(true)}>
            <Eye className="mr-2 h-4 w-4" /> Preview My Talent Card
          </Button>
          <Button onClick={handleSaveProfile} size="lg" disabled={isLoading || !mongoDbUserId}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            Update & Publish My Profile
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="sm:max-w-sm p-0 bg-transparent border-none shadow-none data-[state=open]:animate-none data-[state=closed]:animate-none">
          <ShadDialogTitle className="sr-only">Talent Card Preview</ShadDialogTitle>
            <div className="w-full max-w-sm mx-auto aspect-[9/16] sm:aspect-auto sm:h-auto">
                <ProfileCard
                    candidate={candidatePreviewData}
                    onAction={() => {}} // No-op for preview
                    isLiked={false} // Not relevant for preview
                    isGuestMode={true} // To show locked buttons
                    isPreviewMode={true} // Ensures ProfileCard disables its own interactions
                />
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
