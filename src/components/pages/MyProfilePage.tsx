'use client';

import {
  Activity,
  BarChart3,
  Briefcase,
  CalendarDays,
  CheckCircle,
  Clock,
  DollarSign,
  Edit3,
  Eye,
  FileText,
  Globe,
  Image as ImageIcon,
  LanguagesIcon,
  Link as LinkIcon,
  Loader2,
  Lock,
  MapPin,
  Palette as PaletteIcon,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Type,
  UserCircle,
  X,
} from 'lucide-react';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import { type KeyboardEvent, useEffect, useState } from 'react';
import ProfileCard from '@/components/cards/ProfileCard';
import { ShareModal } from '@/components/share/ShareModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CustomFileInput } from '@/components/ui/custom-file-input';
import { Dialog, DialogContent, DialogTitle as ShadDialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useToast } from '@/hooks/use-toast';
import {
  Availability,
  type BackendUser,
  type Candidate,
  EducationLevel,
  JobType,
  LocationPreference,
  WorkExperienceLevel,
} from '@/lib/types';

const envBackendUrl = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL;
const CUSTOM_BACKEND_URL =
  envBackendUrl && envBackendUrl.trim() !== '' ? envBackendUrl : 'http://localhost:5000';

interface MyProfilePageProps {
  isGuestMode?: boolean;
}

const formatEnumLabel = (value: string) => {
  if (!value) return '';
  return value
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const jobTypeEnumOptions = Object.values(JobType).filter((jt) => jt !== JobType.UNSPECIFIED);

const cardThemeOptions = [
  { value: 'default', label: 'Default Theme' },
  { value: 'ocean', label: 'Ocean Breeze' },
  { value: 'sunset', label: 'Sunset Glow' },
  { value: 'forest', label: 'Forest Green' },
  { value: 'professional-dark', label: 'Professional Dark' },
  { value: 'lavender', label: 'Lavender Bliss' },
];

export function MyProfilePage({ isGuestMode }: MyProfilePageProps) {
  const router = useRouter();
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

  const [workExperienceLevel, setWorkExperienceLevel] = useState<WorkExperienceLevel | string>(
    WorkExperienceLevel.UNSPECIFIED
  );
  const [educationLevel, setEducationLevel] = useState<EducationLevel | string>(
    EducationLevel.UNSPECIFIED
  );
  const [locationPreference, setLocationPreference] = useState<LocationPreference | string>(
    LocationPreference.UNSPECIFIED
  );

  const [languageList, setLanguageList] = useState<string[]>([]);
  const [currentLanguageInputValue, setCurrentLanguageInputValue] = useState('');

  const [availability, setAvailability] = useState<Availability | string>(Availability.UNSPECIFIED);

  const [jobTypePreferenceList, setJobTypePreferenceList] = useState<JobType[]>([]);
  const [currentSelectedJobType, setCurrentSelectedJobType] = useState<JobType | string>('');

  const [salaryExpectationMin, setSalaryExpectationMin] = useState<string>('');
  const [salaryExpectationMax, setSalaryExpectationMax] = useState<string>('');

  const [profileVisibility, setProfileVisibility] = useState<string>('public');
  const [selectedCardTheme, setSelectedCardTheme] = useState<string>('default');

  // Client-side conceptual analytics
  const [profileViews, setProfileViews] = useState(0);
  const [profileShares, setProfileShares] = useState(0);
  const [videoPlays, setVideoPlays] = useState(0);
  const [videoCompletionRate, setVideoCompletionRate] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isShareProfileModalOpen, setIsShareProfileModalOpen] = useState(false);

  const { toast } = useToast();
  const { mongoDbUserId, fullBackendUser, updateFullBackendUserFields } = useUserPreferences();

  // Load client-side conceptual analytics on mount
  useEffect(() => {
    if (isGuestMode || typeof window === 'undefined') return;
    setProfileViews(
      Number.parseInt(localStorage.getItem(`profileViews_${mongoDbUserId || 'guest'}`) || '234', 10)
    );
    setProfileShares(
      Number.parseInt(localStorage.getItem(`profileShares_${mongoDbUserId || 'guest'}`) || '56', 10)
    );
    setVideoPlays(
      Number.parseInt(localStorage.getItem(`videoPlays_${mongoDbUserId || 'guest'}`) || '102', 10)
    );
    setVideoCompletionRate(
      Number.parseInt(
        localStorage.getItem(`videoCompletionRate_${mongoDbUserId || 'guest'}`) || '78',
        10
      )
    );
  }, [mongoDbUserId, isGuestMode]);

  // Save client-side conceptual analytics when they change
  useEffect(() => {
    if (isGuestMode || typeof window === 'undefined') return;
    localStorage.setItem(`profileViews_${mongoDbUserId || 'guest'}`, profileViews.toString());
  }, [profileViews, mongoDbUserId, isGuestMode]);
  useEffect(() => {
    if (isGuestMode || typeof window === 'undefined') return;
    localStorage.setItem(`profileShares_${mongoDbUserId || 'guest'}`, profileShares.toString());
  }, [profileShares, mongoDbUserId, isGuestMode]);
  useEffect(() => {
    if (isGuestMode || typeof window === 'undefined') return;
    localStorage.setItem(`videoPlays_${mongoDbUserId || 'guest'}`, videoPlays.toString());
  }, [videoPlays, mongoDbUserId, isGuestMode]);
  useEffect(() => {
    if (isGuestMode || typeof window === 'undefined') return;
    localStorage.setItem(
      `videoCompletionRate_${mongoDbUserId || 'guest'}`,
      videoCompletionRate.toString()
    );
  }, [videoCompletionRate, mongoDbUserId, isGuestMode]);

  useEffect(() => {
    if (isGuestMode || typeof window === 'undefined') {
      setIsFetchingProfile(false);
      return;
    }

    setIsFetchingProfile(true);
    setAvatarPreview(null);

    const populateProfileData = (userData: BackendUser | null) => {
      if (userData) {
        setProfileHeadline(userData.profileHeadline || '');
        setExperienceSummary(userData.profileExperienceSummary || '');
        setSkillList(
          userData.profileSkills
            ? userData.profileSkills
                .split(',')
                .map((s: string) => s.trim())
                .filter((s: string) => s)
            : []
        );
        setDesiredWorkStyle(userData.profileDesiredWorkStyle || '');
        setPastProjects(userData.profilePastProjects || '');
        setVideoPortfolioLink(userData.profileVideoPortfolioLink || '');
        setAvatarUrl(userData.profileAvatarUrl || '');
        setWorkExperienceLevel(
          (userData.profileWorkExperienceLevel as WorkExperienceLevel) ||
            WorkExperienceLevel.UNSPECIFIED
        );
        setEducationLevel(
          (userData.profileEducationLevel as EducationLevel) || EducationLevel.UNSPECIFIED
        );
        setLocationPreference(
          (userData.profileLocationPreference as LocationPreference) ||
            LocationPreference.UNSPECIFIED
        );
        setLanguageList(
          userData.profileLanguages
            ? userData.profileLanguages
                .split(',')
                .map((s: string) => s.trim())
                .filter((s: string) => s)
            : []
        );
        setAvailability((userData.profileAvailability as Availability) || Availability.UNSPECIFIED);
        setJobTypePreferenceList(
          userData.profileJobTypePreference
            ? userData.profileJobTypePreference
                .split(',')
                .map((s: string) => s.trim() as JobType)
                .filter((s: JobType) => s && Object.values(JobType).includes(s))
            : []
        );
        setSalaryExpectationMin(userData.profileSalaryExpectationMin?.toString() || '');
        setSalaryExpectationMax(userData.profileSalaryExpectationMax?.toString() || '');
        setSelectedCardTheme(userData.profileCardTheme || 'default');
        setProfileVisibility(userData.profileVisibility || 'public');
      } else {
        toast({
          title: 'Profile Not Found',
          description: 'Could not load your profile. Please fill in details.',
          variant: 'default',
        });
      }
      setIsFetchingProfile(false);
    };

    if (fullBackendUser) {
      populateProfileData(fullBackendUser);
    } else if (mongoDbUserId) {
      const loadProfile = async () => {
        try {
          const response = await fetch(`${CUSTOM_BACKEND_URL}/api/users/${mongoDbUserId}`);
          if (response.ok) {
            const userData: BackendUser = await response.json();
            populateProfileData(userData);
            updateFullBackendUserFields(userData); // Update context after fetch
          } else {
            populateProfileData(null); // To show toast and set defaults
          }
        } catch (_error) {
          toast({
            title: 'Error Loading Profile',
            description: 'Could not load your profile.',
            variant: 'destructive',
          });
          populateProfileData(null);
        }
      };
      loadProfile();
    } else {
      setIsFetchingProfile(false);
    }
  }, [isGuestMode, mongoDbUserId, fullBackendUser, toast, updateFullBackendUserFields]);

  const handleAvatarFileSelected = (file: File | null) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Avatar image must be less than 5MB.',
          variant: 'destructive',
        });
        setAvatarFile(null);
        setAvatarPreview(avatarUrl || null);
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File Type',
          description: 'Please select an image file (PNG, JPG, GIF).',
          variant: 'destructive',
        });
        setAvatarFile(null);
        setAvatarPreview(avatarUrl || null);
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast({
        title: 'Avatar Preview Updated',
        description:
          "Click 'Update & Publish My Profile' to save changes including the new avatar.",
      });
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
    setSkillList(skillList.filter((skill) => skill !== skillToRemove));
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
    setLanguageList(languageList.filter((lang) => lang !== langToRemove));
  };

  const handleAddJobTypePreference = () => {
    const newJobType = currentSelectedJobType as JobType;
    if (
      newJobType &&
      jobTypeEnumOptions.includes(newJobType as (typeof jobTypeEnumOptions)[number]) &&
      !jobTypePreferenceList.includes(newJobType)
    ) {
      if (jobTypePreferenceList.length < 5) {
        setJobTypePreferenceList([...jobTypePreferenceList, newJobType]);
      } else {
        toast({
          title: 'Limit Reached',
          description: 'You can select up to 5 job type preferences.',
          variant: 'default',
        });
      }
    }
    setCurrentSelectedJobType('');
  };

  const handleRemoveJobTypePreference = (jobTypeToRemove: JobType) => {
    setJobTypePreferenceList(jobTypePreferenceList.filter((jt) => jt !== jobTypeToRemove));
  };

  const handleSaveProfile = async () => {
    if (isGuestMode) {
      toast({
        title: 'Action Disabled',
        description: 'Please sign in to save your profile.',
        variant: 'default',
      });
      return;
    }
    if (!mongoDbUserId) {
      toast({
        title: 'User Not Identified',
        description: 'Cannot save profile. Please ensure you are fully logged in.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    let finalAvatarUrl = avatarUrl;

    if (avatarFile) {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      try {
        const avatarUploadResponse = await fetch(
          `${CUSTOM_BACKEND_URL}/api/users/${mongoDbUserId}/avatar`,
          {
            method: 'POST',
            body: formData,
          }
        );
        if (!avatarUploadResponse.ok) {
          const errorData = await avatarUploadResponse
            .json()
            .catch(() => ({ message: 'Avatar upload failed with non-JSON response.' }));
          throw new Error(
            errorData.message || `Avatar upload failed: ${avatarUploadResponse.statusText}`
          );
        }
        const avatarUploadResult = await avatarUploadResponse.json();
        finalAvatarUrl = avatarUploadResult.profileAvatarUrl;
        setAvatarUrl(finalAvatarUrl);
        toast({ title: 'Avatar Uploaded!', description: 'New avatar image saved to server.' });
      } catch (uploadError: any) {
        console.error('Error uploading avatar:', uploadError);
        toast({
          title: 'Avatar Upload Failed',
          description:
            uploadError.message ||
            'Could not upload your avatar image. Profile text data will still be saved with the previous avatar.',
          variant: 'destructive',
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
      profileSalaryExpectationMin: salaryExpectationMin
        ? Number.parseInt(salaryExpectationMin, 10)
        : undefined,
      profileSalaryExpectationMax: salaryExpectationMax
        ? Number.parseInt(salaryExpectationMax, 10)
        : undefined,
      profileCardTheme: selectedCardTheme,
      profileVisibility: profileVisibility,
    };

    try {
      const profileSaveResponse = await fetch(
        `${CUSTOM_BACKEND_URL}/api/users/${mongoDbUserId}/profile`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileData),
        }
      );
      if (!profileSaveResponse.ok) {
        const errorData = await profileSaveResponse
          .json()
          .catch(() => ({ message: 'An unknown error occurred while saving profile data.' }));
        throw new Error(
          errorData.message || `Failed to save profile data: ${profileSaveResponse.statusText}`
        );
      }
      const savedUserResponse = await profileSaveResponse.json();
      if (savedUserResponse.user) {
        updateFullBackendUserFields(savedUserResponse.user); // Update context
        setAvatarUrl(savedUserResponse.user.profileAvatarUrl || finalAvatarUrl); // Ensure local state matches
        setSelectedCardTheme(savedUserResponse.user.profileCardTheme || 'default');
        setProfileVisibility(savedUserResponse.user.profileVisibility || 'public');
      }
      setAvatarFile(null);
      setAvatarPreview(null);
      localStorage.setItem(
        'currentUserJobSeekerProfile',
        JSON.stringify({
          id: mongoDbUserId,
          name: fullBackendUser?.name || 'User',
          role: profileHeadline,
          avatarUrl: finalAvatarUrl,
        })
      );
      toast({
        title: 'Profile Updated & Published!',
        description: 'Your profile has been saved to the backend and is visible to recruiters.',
      });
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error Saving Profile',
        description: error.message || 'An unknown error occurred while saving to backend.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateProfileActivity = () => {
    if (isGuestMode) {
      toast({
        title: 'Action Disabled',
        description: 'Activity simulation is for logged-in users.',
        variant: 'default',
      });
      return;
    }
    setProfileViews((prev) => prev + Math.floor(Math.random() * 10) + 1);
    setProfileShares((prev) => prev + Math.floor(Math.random() * 3) + 1);
    if (videoPortfolioLink) {
      setVideoPlays((prev) => prev + Math.floor(Math.random() * 5) + 1);
      setVideoCompletionRate((prev) => Math.min(100, prev + Math.floor(Math.random() * 10) + 1));
    }
    toast({
      title: 'Activity Simulated!',
      description: 'Profile engagement stats updated (client-side conceptual).',
    });
  };

  if (isGuestMode) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 animate-pulse rounded-full bg-white blur-3xl" />
          <div className="absolute right-1/4 bottom-1/4 h-96 w-96 animate-pulse rounded-full bg-white blur-3xl delay-1000" />
        </div>

        <div className="relative z-10 w-full max-w-lg">
          <div className="animate-fade-in rounded-3xl border border-white/20 bg-white/10 p-10 text-center shadow-2xl backdrop-blur-xl">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm">
              <Lock className="h-12 w-12 text-white" />
            </div>
            <h2 className="mb-6 font-bold text-3xl text-white tracking-tight">Access Restricted</h2>
            <p className="mb-8 text-lg text-white/80 leading-relaxed">
              Managing your profile is a feature for registered users. Please sign in using the
              Login button in the header to create or edit your profile.
            </p>
            <div className="h-1 w-full rounded-full bg-gradient-to-r from-white/20 via-white/40 to-white/20" />
          </div>
          <div className="mt-12 flex justify-center">
            <div className="h-1 w-24 rounded-full bg-gradient-to-r from-white/20 via-white/60 to-white/20" />
          </div>
        </div>
      </div>
    );
  }

  if (isFetchingProfile) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/3 left-1/3 h-96 w-96 animate-pulse rounded-full bg-white blur-3xl" />
          <div className="absolute right-1/3 bottom-1/3 h-96 w-96 animate-pulse rounded-full bg-white blur-3xl delay-500" />
        </div>

        <div className="relative z-10 animate-fade-in text-center">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm">
            <Loader2 className="h-12 w-12 animate-spin text-white" />
          </div>
          <p className="font-medium text-white/90 text-xl">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const currentDisplayAvatarUrl = avatarPreview
    ? avatarPreview
    : avatarUrl?.startsWith('/uploads/')
      ? `${CUSTOM_BACKEND_URL}${avatarUrl}`
      : avatarUrl || `https://placehold.co/96x96.png?text=${profileHeadline?.[0] || 'P'}`;

  const candidatePreviewData: Candidate = {
    id: mongoDbUserId || 'preview-user',
    name: fullBackendUser?.name || 'Your Name (Preview)',
    role: profileHeadline,
    experienceSummary,
    skills: skillList,
    avatarUrl: currentDisplayAvatarUrl,
    videoResumeUrl: videoPortfolioLink || '',
    location:
      fullBackendUser?.address && fullBackendUser?.country
        ? `${fullBackendUser.address}, ${fullBackendUser.country}`
        : fullBackendUser?.country || 'Your Location (Preview)',
    desiredWorkStyle: desiredWorkStyle,
    pastProjects,
    workExperienceLevel: workExperienceLevel as WorkExperienceLevel,
    educationLevel: educationLevel as EducationLevel,
    locationPreference: locationPreference as LocationPreference,
    languages: languageList,
    salaryExpectationMin: salaryExpectationMin ? Number.parseInt(salaryExpectationMin) : 0,
    salaryExpectationMax: salaryExpectationMax ? Number.parseInt(salaryExpectationMax) : 0,
    availability: availability as Availability,
    jobTypePreference: jobTypePreferenceList,
    cardTheme: selectedCardTheme,
    profileStrength:
      Math.round(
        (Object.values({
          profileHeadline,
          experienceSummary,
          skillList,
          desiredWorkStyle,
          pastProjects,
          videoPortfolioLink,
          avatarUrl,
          workExperienceLevel,
          educationLevel,
          locationPreference,
          languageList,
          availability,
          jobTypePreferenceList,
          salaryExpectationMin,
          salaryExpectationMax,
        }).filter(
          (v) =>
            v &&
            (typeof v !== 'string' || v.trim() !== '') &&
            (typeof v !== 'object' || (Array.isArray(v) ? v.length > 0 : Object.keys(v).length > 0))
        ).length /
          18) *
          80
      ) + 20,
    personalityAssessment: [],
    optimalWorkStyles: [],
    isUnderestimatedTalent: false,
  };

  const appOriginForShare =
    typeof window !== 'undefined' ? window.location.origin : 'https://swipehire-app.com';

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 h-96 w-96 animate-pulse rounded-full bg-white blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-96 w-96 animate-pulse rounded-full bg-white blur-3xl delay-1000" />
        <div className="absolute bottom-1/4 left-1/3 h-96 w-96 animate-pulse rounded-full bg-white blur-3xl delay-2000" />
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5" />
        <div className="relative mx-auto max-w-5xl px-6 py-20 text-center">
          <div className="animate-fade-in">
            <div className="mx-auto mb-10 flex h-32 w-32 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-white/20 to-white/10 shadow-2xl backdrop-blur-sm">
              <UserCircle className="h-16 w-16 text-white" />
            </div>
            <h1 className="mb-8 font-bold text-6xl text-white tracking-tight md:text-7xl">
              My Professional Profile
            </h1>
            <p className="mx-auto max-w-3xl text-2xl text-white/80 leading-relaxed">
              Craft your profile to stand out to recruiters. This information will be visible to top
              companies and hiring managers.
            </p>
            <div className="mt-12 flex justify-center">
              <div className="h-1 w-24 rounded-full bg-gradient-to-r from-white/20 via-white/60 to-white/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-5xl space-y-12 px-6 pb-20">
        <Card className="animate-fade-in overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl">
          <CardHeader className="border-white/20 border-b bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm">
            <CardTitle className="flex items-center font-bold text-3xl text-white">
              <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm">
                <Edit3 className="h-6 w-6 text-white" />
              </div>
              Edit Your Discoverable Profile
            </CardTitle>
            <CardDescription className="text-white/80 text-xl">
              This information will be visible to recruiters. Make it compelling!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-10 p-10">
            {/* Avatar Section */}
            <div className="rounded-2xl border border-gray-200/50 bg-gradient-to-r from-gray-50 to-gray-100 p-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  {currentDisplayAvatarUrl ? (
                    <NextImage
                      src={currentDisplayAvatarUrl}
                      alt="Avatar Preview"
                      width={96}
                      height={96}
                      className="rounded-full border-4 border-white object-cover shadow-lg"
                      data-ai-hint="user avatar"
                      unoptimized={
                        currentDisplayAvatarUrl.startsWith(CUSTOM_BACKEND_URL) ||
                        currentDisplayAvatarUrl.startsWith('http://localhost')
                      }
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-gray-200 to-gray-300 shadow-lg">
                      <UserCircle className="h-12 w-12 text-gray-600" />
                    </div>
                  )}
                  <div className="-bottom-2 -right-2 absolute flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-600 to-gray-700 shadow-lg">
                    <ImageIcon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <CustomFileInput
                  id="avatarUpload"
                  fieldLabel="Professional Avatar"
                  buttonText="Upload New Photo"
                  buttonIcon={<ImageIcon className="mr-2 h-4 w-4" />}
                  selectedFileName={avatarFile?.name || null}
                  onFileSelected={handleAvatarFileSelected}
                  inputProps={{ accept: 'image/*' }}
                  fieldDescription="Max 5MB. PNG, JPG, GIF recommended."
                  className="flex-grow"
                />
              </div>
            </div>

            {/* Professional Headline */}
            <div className="space-y-3">
              <Label
                htmlFor="profileHeadline"
                className="flex items-center rounded-lg bg-black px-4 py-2 font-semibold text-lg text-white"
              >
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300">
                  <Briefcase className="h-4 w-4 text-gray-700" />
                </div>
                Professional Headline
              </Label>
              <Input
                id="profileHeadline"
                placeholder="e.g., Senior Software Engineer, Aspiring UX Designer"
                value={profileHeadline}
                onChange={(e) => setProfileHeadline(e.target.value)}
                className="h-12 rounded-xl border-gray-300 text-lg focus:border-gray-500 focus:ring-gray-500"
              />
              <p className="text-gray-500 text-sm">
                This appears as your main title on your profile card
              </p>
            </div>

            {/* Experience Summary */}
            <div className="space-y-3">
              <Label
                htmlFor="experienceSummary"
                className="flex items-center rounded-lg bg-black px-4 py-2 font-semibold text-lg text-white"
              >
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300">
                  <TrendingUp className="h-4 w-4 text-gray-700" />
                </div>
                Experience Summary
              </Label>
              <Textarea
                id="experienceSummary"
                placeholder="Briefly describe your key experience and what you bring to the table..."
                value={experienceSummary}
                onChange={(e) => setExperienceSummary(e.target.value)}
                className="min-h-[120px] resize-none rounded-xl border-gray-300 text-lg focus:border-gray-500 focus:ring-gray-500"
              />
              <p className="text-gray-500 text-sm">
                Highlight your most relevant experience and achievements
              </p>
            </div>

            {/* Skills Section */}
            <div className="space-y-4">
              <Label
                htmlFor="skillsInput"
                className="flex items-center rounded-lg bg-black px-4 py-2 font-semibold text-lg text-white"
              >
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300">
                  <Star className="h-4 w-4 text-gray-700" />
                </div>
                Professional Skills
              </Label>

              {skillList.length > 0 && (
                <div className="rounded-xl border border-gray-200/50 bg-gradient-to-r from-gray-50 to-gray-100 p-4">
                  <div className="flex flex-wrap gap-2">
                    {skillList.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-2 border border-gray-200 bg-white px-3 py-2 text-sm transition-colors hover:border-gray-300"
                      >
                        <Sparkles className="h-3 w-3 text-gray-600" />
                        {skill}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 rounded-full p-0 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600"
                          onClick={() => handleRemoveSkill(skill)}
                          aria-label={`Remove skill ${skill}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Input
                  id="skillsInput"
                  placeholder="Type a skill (e.g., React, Python, Design) and press Enter"
                  value={currentSkillInputValue}
                  onChange={(e) => setCurrentSkillInputValue(e.target.value)}
                  onKeyDown={handleSkillInputKeyDown}
                  className="h-12 flex-grow rounded-xl border-gray-300 text-lg focus:border-gray-500 focus:ring-gray-500"
                />
                <Button
                  type="button"
                  onClick={handleAddSkill}
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-xl border-gray-300 px-6 transition-colors hover:border-gray-500 hover:bg-gray-50"
                >
                  <Star className="mr-2 h-4 w-4" />
                  Add Skill
                </Button>
              </div>
              <p className="text-gray-500 text-sm">
                Add your key technical and soft skills. Press Enter or click "Add Skill" to include
                each one.
              </p>
            </div>

            {/* Professional Details Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Work Experience Level */}
              <div className="space-y-3">
                <Label
                  htmlFor="workExperienceLevel"
                  className="flex items-center rounded-lg bg-black px-4 py-2 font-semibold text-lg text-white"
                >
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300">
                    <Clock className="h-4 w-4 text-gray-700" />
                  </div>
                  Experience Level
                </Label>
                <Select
                  value={workExperienceLevel}
                  onValueChange={(value) => setWorkExperienceLevel(value as WorkExperienceLevel)}
                >
                  <SelectTrigger
                    id="workExperienceLevel"
                    className="h-12 rounded-xl border-gray-300 text-lg focus:border-gray-500 focus:ring-gray-500"
                  >
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(WorkExperienceLevel).map((level) => (
                      <SelectItem key={level} value={level}>
                        {formatEnumLabel(level)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Education Level */}
              <div className="space-y-3">
                <Label
                  htmlFor="educationLevel"
                  className="flex items-center rounded-lg bg-black px-4 py-2 font-semibold text-lg text-white"
                >
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300">
                    <UserCircle className="h-4 w-4 text-gray-700" />
                  </div>
                  Education Level
                </Label>
                <Select
                  value={educationLevel}
                  onValueChange={(value) => setEducationLevel(value as EducationLevel)}
                >
                  <SelectTrigger
                    id="educationLevel"
                    className="h-12 rounded-xl border-gray-300 text-lg focus:border-gray-500 focus:ring-gray-500"
                  >
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(EducationLevel).map((level) => (
                      <SelectItem key={level} value={level}>
                        {formatEnumLabel(level)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Work Style & Location */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Desired Work Style */}
              <div className="space-y-3">
                <Label
                  htmlFor="desiredWorkStyle"
                  className="flex items-center rounded-lg bg-black px-4 py-2 font-semibold text-lg text-white"
                >
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300">
                    <Briefcase className="h-4 w-4 text-gray-700" />
                  </div>
                  Work Style
                </Label>
                <Input
                  id="desiredWorkStyle"
                  placeholder="e.g., Fully Remote, Hybrid, Collaborative team"
                  value={desiredWorkStyle}
                  onChange={(e) => setDesiredWorkStyle(e.target.value)}
                  className="h-12 rounded-xl border-gray-300 text-lg focus:border-gray-500 focus:ring-gray-500"
                />
              </div>

              {/* Location Preference */}
              <div className="space-y-3">
                <Label
                  htmlFor="locationPreference"
                  className="flex items-center rounded-lg bg-black px-4 py-2 font-semibold text-lg text-white"
                >
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300">
                    <MapPin className="h-4 w-4 text-gray-700" />
                  </div>
                  Location Preference
                </Label>
                <Select
                  value={locationPreference}
                  onValueChange={(value) => setLocationPreference(value as LocationPreference)}
                >
                  <SelectTrigger
                    id="locationPreference"
                    className="h-12 rounded-xl border-gray-300 text-lg focus:border-gray-500 focus:ring-gray-500"
                  >
                    <SelectValue placeholder="Select location preference" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(LocationPreference).map((pref) => (
                      <SelectItem key={pref} value={pref}>
                        {formatEnumLabel(pref)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Languages Section */}
            <div className="space-y-4">
              <Label
                htmlFor="languageInput"
                className="flex items-center rounded-lg bg-black px-4 py-2 font-semibold text-lg text-white"
              >
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300">
                  <LanguagesIcon className="h-4 w-4 text-gray-700" />
                </div>
                Languages Spoken
              </Label>

              {languageList.length > 0 && (
                <div className="rounded-xl border border-gray-200/50 bg-gradient-to-r from-gray-50 to-gray-100 p-4">
                  <div className="flex flex-wrap gap-2">
                    {languageList.map((lang, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-2 border border-gray-200 bg-white px-3 py-2 text-sm transition-colors hover:border-gray-300"
                      >
                        <Globe className="h-3 w-3 text-gray-600" />
                        {lang}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 rounded-full p-0 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600"
                          onClick={() => handleRemoveLanguage(lang)}
                          aria-label={`Remove language ${lang}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Input
                  id="languageInput"
                  placeholder="Type a language (e.g., Spanish, Mandarin) and press Enter"
                  value={currentLanguageInputValue}
                  onChange={(e) => setCurrentLanguageInputValue(e.target.value)}
                  onKeyDown={handleLanguageInputKeyDown}
                  className="h-12 flex-grow rounded-xl border-gray-300 text-lg focus:border-gray-500 focus:ring-gray-500"
                />
                <Button
                  type="button"
                  onClick={handleAddLanguage}
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-xl border-gray-300 px-6 transition-colors hover:border-gray-500 hover:bg-gray-50"
                >
                  <LanguagesIcon className="mr-2 h-4 w-4" />
                  Add Language
                </Button>
              </div>
              <p className="text-gray-500 text-sm">
                Add languages you speak fluently. This helps with international opportunities.
              </p>
            </div>

            {/* Salary Expectations */}
            <div className="space-y-4">
              <Label className="flex items-center rounded-lg bg-black px-4 py-2 font-semibold text-lg text-white">
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300">
                  <DollarSign className="h-4 w-4 text-gray-700" />
                </div>
                Salary Expectations (Annual)
              </Label>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="salaryExpectationMin"
                    className="font-medium text-gray-700 text-sm"
                  >
                    Minimum Expected
                  </Label>
                  <div className="relative">
                    <DollarSign className="-translate-y-1/2 absolute top-1/2 left-3 h-5 w-5 transform text-gray-400" />
                    <Input
                      id="salaryExpectationMin"
                      type="number"
                      placeholder="80,000"
                      value={salaryExpectationMin}
                      onChange={(e) => setSalaryExpectationMin(e.target.value)}
                      className="h-12 rounded-xl border-gray-300 pl-10 text-lg focus:border-gray-500 focus:ring-gray-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="salaryExpectationMax"
                    className="font-medium text-gray-700 text-sm"
                  >
                    Maximum Expected
                  </Label>
                  <div className="relative">
                    <DollarSign className="-translate-y-1/2 absolute top-1/2 left-3 h-5 w-5 transform text-gray-400" />
                    <Input
                      id="salaryExpectationMax"
                      type="number"
                      placeholder="120,000"
                      value={salaryExpectationMax}
                      onChange={(e) => setSalaryExpectationMax(e.target.value)}
                      className="h-12 rounded-xl border-gray-300 pl-10 text-lg focus:border-gray-500 focus:ring-gray-500"
                    />
                  </div>
                </div>
              </div>
              <p className="text-gray-500 text-sm">
                Provide your expected salary range to help recruiters match you with appropriate
                opportunities.
              </p>
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="availability"
                className="flex items-center rounded-lg bg-black px-4 py-2 text-base text-white"
              >
                <CalendarDays className="mr-2 h-4 w-4 text-white" /> My Availability
              </Label>
              <Select
                value={availability}
                onValueChange={(value) => setAvailability(value as Availability)}
              >
                <SelectTrigger id="availability">
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Availability).map((avail) => (
                    <SelectItem key={avail} value={avail}>
                      {formatEnumLabel(avail)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center rounded-lg bg-black px-4 py-2 text-base text-white">
                <Type className="mr-2 h-4 w-4 text-white" /> Preferred Job Types
              </Label>
              <div className="mb-2 flex flex-wrap gap-2">
                {jobTypePreferenceList.map((jobType, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1 text-sm"
                  >
                    {formatEnumLabel(jobType)}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleRemoveJobTypePreference(jobType)}
                      aria-label={`Remove job type ${jobType}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={currentSelectedJobType}
                  onValueChange={(value) => setCurrentSelectedJobType(value as JobType)}
                >
                  <SelectTrigger id="jobTypePreferenceSelect" className="flex-grow">
                    <SelectValue placeholder="Select job type preference" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTypeEnumOptions.map((type) => (
                      <SelectItem
                        key={type}
                        value={type}
                        disabled={jobTypePreferenceList.includes(type)}
                      >
                        {formatEnumLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={handleAddJobTypePreference}
                  variant="outline"
                  size="sm"
                  disabled={
                    !currentSelectedJobType ||
                    jobTypePreferenceList.includes(currentSelectedJobType as JobType) ||
                    jobTypePreferenceList.length >= 5
                  }
                >
                  Add Preference
                </Button>
              </div>
              <p className="text-muted-foreground text-xs">Select up to 5 job type preferences.</p>
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="pastProjects"
                className="flex items-center rounded-lg bg-black px-4 py-2 text-base text-white"
              >
                <Edit3 className="mr-2 h-4 w-4 text-white" /> My Key Past Projects/Achievements
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
              <Label
                htmlFor="videoPortfolioLink"
                className="flex items-center rounded-lg bg-black px-4 py-2 text-base text-white"
              >
                <LinkIcon className="mr-2 h-4 w-4 text-white" /> Link to My Video Resume/Portfolio
              </Label>
              <Input
                id="videoPortfolioLink"
                type="url"
                placeholder="https://example.com/my-portfolio-or-video.mp4"
                value={videoPortfolioLink}
                onChange={(e) => setVideoPortfolioLink(e.target.value)}
              />
            </div>

            <div className="space-y-1 border-t pt-4">
              <Label
                htmlFor="selectedCardTheme"
                className="flex items-center rounded-lg bg-black px-4 py-2 text-base text-white"
              >
                <PaletteIcon className="mr-2 h-4 w-4 text-white" /> Profile Card Theme
              </Label>
              <Select
                value={selectedCardTheme}
                onValueChange={setSelectedCardTheme}
                disabled={!!isGuestMode}
              >
                <SelectTrigger id="selectedCardTheme">
                  <SelectValue placeholder="Select card theme" />
                </SelectTrigger>
                <SelectContent>
                  {cardThemeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">
                This theme will be applied to your profile card visible to recruiters.
              </p>
            </div>

            <div className="space-y-1 border-t pt-4">
              <Label
                htmlFor="profileVisibility"
                className="flex items-center rounded-lg bg-black px-4 py-2 text-base text-white"
              >
                <ShieldCheck className="mr-2 h-4 w-4 text-white" /> Profile Visibility
              </Label>
              <Select
                value={profileVisibility}
                onValueChange={setProfileVisibility}
                disabled={!!isGuestMode}
              >
                <SelectTrigger id="profileVisibility">
                  <SelectValue placeholder="Set profile visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public (Link Anyone Can View)</SelectItem>
                  <SelectItem value="recruiters_only">Recruiters Only (Conceptual)</SelectItem>
                  <SelectItem value="private">Only Me (Conceptual)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">
                Controls who can see your profile. This setting is now saved to your backend
                profile.
              </p>
            </div>
          </CardContent>
          <CardFooter className="border-gray-200/50 border-t bg-gradient-to-r from-gray-50 to-gray-100 p-8">
            <div className="flex w-full flex-col items-center justify-between gap-6 lg:flex-row">
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="h-12 rounded-xl border-gray-300 px-6 shadow-sm transition-all duration-200 hover:border-gray-500 hover:bg-white hover:shadow-md"
                >
                  <Eye className="mr-2 h-5 w-5" />
                  Preview Card
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsShareProfileModalOpen(true)}
                  disabled={!mongoDbUserId || isGuestMode}
                  className="h-12 rounded-xl border-gray-300 px-6 shadow-sm transition-all duration-200 hover:border-gray-500 hover:bg-white hover:shadow-md disabled:opacity-50"
                >
                  <Share2 className="mr-2 h-5 w-5" />
                  Share Profile
                </Button>
              </div>
              <Button
                onClick={handleSaveProfile}
                size="lg"
                disabled={isLoading || !mongoDbUserId}
                className="h-14 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 px-8 font-semibold text-lg text-white shadow-lg transition-all duration-200 hover:from-gray-900 hover:to-black hover:shadow-xl disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-3 h-5 w-5" />
                    Update & Publish Profile
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Resume Optimization Card */}
        <Card className="animate-fade-in overflow-hidden rounded-3xl border border-gray-200/50 bg-white/80 shadow-2xl backdrop-blur-sm">
          <CardHeader className="border-gray-200/50 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <CardTitle className="flex items-center font-bold text-2xl text-gray-900">
              <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300">
                <FileText className="h-5 w-5 text-gray-700" />
              </div>
              Resume Optimization Tools
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              Enhance your resume with AI-powered analysis and optimization to increase your chances
              of landing interviews.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="rounded-2xl border border-gray-200/50 bg-gradient-to-r from-gray-50 to-gray-100 p-6">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-600 to-gray-700 shadow-lg">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="mb-3 font-bold text-gray-900 text-xl">
                    AI-Powered Resume Analysis
                  </h3>
                  <p className="mb-4 text-gray-600 leading-relaxed">
                    Get detailed feedback on your resume including ATS compatibility, keyword
                    optimization, and personalized suggestions to improve your job application
                    success rate.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="secondary"
                      className="border border-gray-200 bg-white px-3 py-1 text-gray-700"
                    >
                      ATS Optimization
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="border border-gray-200 bg-white px-3 py-1 text-gray-700"
                    >
                      Keyword Analysis
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="border border-gray-200 bg-white px-3 py-1 text-gray-700"
                    >
                      Grammar Check
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="border border-gray-200 bg-white px-3 py-1 text-gray-700"
                    >
                      Format Suggestions
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-gray-200/50 border-t bg-gradient-to-r from-gray-50 to-gray-100 p-8">
            <Button
              onClick={() => router.push('/resume-optimizer')}
              className="h-12 w-full rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 font-semibold text-lg text-white shadow-lg transition-all duration-200 hover:from-gray-900 hover:to-black hover:shadow-xl"
              disabled={isGuestMode}
            >
              {isGuestMode ? (
                <>
                  <Lock className="mr-3 h-5 w-5" />
                  Sign In to Optimize Resume
                </>
              ) : (
                <>
                  <Sparkles className="mr-3 h-5 w-5" />
                  Optimize My Resume
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Profile Analytics Card */}
        <Card className="animate-fade-in overflow-hidden rounded-3xl border border-gray-200/50 bg-white/80 shadow-2xl backdrop-blur-sm">
          <CardHeader className="border-gray-200/50 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <CardTitle className="flex items-center font-bold text-2xl text-gray-900">
              <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300">
                <BarChart3 className="h-5 w-5 text-gray-700" />
              </div>
              Profile Analytics
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              See how your profile is performing (these are demo metrics stored in your browser).
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-xl border border-gray-200/50 bg-gradient-to-r from-gray-50 to-gray-100 p-4 text-center">
                <div className="mb-1 font-bold text-3xl text-gray-900">{profileViews}</div>
                <div className="font-medium text-gray-600 text-sm">Profile Views</div>
              </div>
              <div className="rounded-xl border border-gray-200/50 bg-gradient-to-r from-gray-50 to-gray-100 p-4 text-center">
                <div className="mb-1 font-bold text-3xl text-gray-900">{profileShares}</div>
                <div className="font-medium text-gray-600 text-sm">Profile Shares</div>
              </div>
              {videoPortfolioLink && (
                <>
                  <div className="rounded-xl border border-gray-200/50 bg-gradient-to-r from-gray-50 to-gray-100 p-4 text-center">
                    <div className="mb-1 font-bold text-3xl text-gray-900">{videoPlays}</div>
                    <div className="font-medium text-gray-600 text-sm">Video Plays</div>
                  </div>
                  <div className="rounded-xl border border-gray-200/50 bg-gradient-to-r from-gray-50 to-gray-100 p-4 text-center">
                    <div className="mb-1 font-bold text-3xl text-gray-900">
                      {videoCompletionRate}%
                    </div>
                    <div className="font-medium text-gray-600 text-sm">Completion Rate</div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-gray-200/50 border-t bg-gradient-to-r from-gray-50 to-gray-100 p-8">
            <Button
              variant="outline"
              onClick={handleSimulateProfileActivity}
              disabled={isGuestMode}
              className="h-12 w-full rounded-xl border-gray-300 font-semibold text-lg shadow-sm transition-all duration-200 hover:border-gray-500 hover:bg-white hover:shadow-md"
            >
              <Activity className="mr-3 h-5 w-5" />
              Simulate Activity
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="border-none bg-transparent p-0 shadow-none data-[state=closed]:animate-none data-[state=open]:animate-none sm:max-w-sm">
          <ShadDialogTitle className="sr-only">Talent Card Preview</ShadDialogTitle>
          <div className="mx-auto aspect-[9/16] w-full max-w-sm sm:aspect-auto sm:h-auto">
            <ProfileCard
              candidate={candidatePreviewData}
              onAction={() => {}}
              isLiked={false}
              isGuestMode={true}
              isPreviewMode={true}
            />
          </div>
        </DialogContent>
      </Dialog>

      <ShareModal
        isOpen={isShareProfileModalOpen}
        onOpenChange={setIsShareProfileModalOpen}
        title="Share Your Professional Profile"
        itemName={fullBackendUser?.name || 'My Profile'}
        itemDescription={profileHeadline || 'Check out my profile on SwipeHire!'}
        itemType="profile"
        shareUrl={mongoDbUserId ? `${appOriginForShare}/user/${mongoDbUserId}` : ''}
        qrCodeLogoUrl="/assets/logo-favicon.png"
      />
    </div>
  );
}
