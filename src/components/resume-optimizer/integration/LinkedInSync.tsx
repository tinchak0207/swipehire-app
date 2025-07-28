import {
  AlertCircle,
  Award,
  Building,
  Calendar,
  CheckCircle,
  ExternalLink,
  GraduationCap,
  Linkedin,
  RefreshCw,
  Shield,
  User,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';

interface LinkedInSyncProps {
  userProfile: {
    name: string;
    email: string;
    currentRole?: string;
    experience?: any[];
    education?: any[];
    skills?: string[];
  };
  onSyncComplete?: (data: any) => void;
}

export const LinkedInSync: React.FC<LinkedInSyncProps> = ({ userProfile, onSyncComplete }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'completed' | 'error'>('idle');
  const [linkedInData, setLinkedInData] = useState<any>(null);

  const handleLinkedInSync = async () => {
    setIsSyncing(true);
    setSyncStatus('syncing');
    setSyncProgress(0);

    try {
      // Simulate API calls to LinkedIn
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setSyncProgress(i);
      }

      // Mock LinkedIn data
      const mockLinkedInData = {
        profile: {
          name: userProfile.name,
          headline: userProfile.currentRole || 'Professional',
          location: 'San Francisco, CA',
          connections: 542,
          profilePicture: null,
        },
        experience: userProfile.experience || [
          {
            id: 1,
            title: 'Senior Software Engineer',
            company: 'Tech Corp',
            location: 'San Francisco, CA',
            startDate: '2020-01-01',
            endDate: null,
            isCurrent: true,
            description: 'Leading development of cloud-based solutions',
          },
        ],
        education: userProfile.education || [
          {
            id: 1,
            school: 'Stanford University',
            degree: 'Master of Science',
            fieldOfStudy: 'Computer Science',
            startDate: '2016-09-01',
            endDate: '2018-06-01',
          },
        ],
        skills: userProfile.skills || ['JavaScript', 'React', 'Node.js', 'Cloud Computing'],
      };

      setLinkedInData(mockLinkedInData);
      setSyncStatus('completed');

      // Notify parent component
      onSyncComplete?.(mockLinkedInData);

      toast({
        title: 'LinkedIn Sync Successful',
        description: 'Your LinkedIn profile has been successfully synced with your resume.',
      });
    } catch (_error) {
      setSyncStatus('error');
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync with LinkedIn. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualConnect = () => {
    // In a real implementation, this would redirect to LinkedIn OAuth
    toast({
      title: 'Connect to LinkedIn',
      description: 'You will be redirected to LinkedIn to authorize access.',
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Linkedin className="h-5 w-5 text-blue-600" />
          LinkedIn Integration
        </CardTitle>
        <CardDescription>
          Sync your LinkedIn profile with your resume to keep information up-to-date
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-3">
              <Linkedin className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">LinkedIn Profile Sync</h3>
              <p className="text-muted-foreground text-sm">
                {syncStatus === 'completed'
                  ? 'Profile synced successfully'
                  : 'Connect your LinkedIn profile'}
              </p>
            </div>
          </div>

          {syncStatus === 'completed' ? (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              <CheckCircle className="mr-1 h-3 w-3" />
              Synced
            </Badge>
          ) : syncStatus === 'error' ? (
            <Badge variant="destructive" className="flex items-center">
              <AlertCircle className="mr-1 h-3 w-3" />
              Error
            </Badge>
          ) : (
            <Button
              onClick={handleManualConnect}
              disabled={isSyncing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Connect
            </Button>
          )}
        </div>

        {isSyncing && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Syncing your profile...</span>
              <span>{syncProgress}%</span>
            </div>
            <Progress value={syncProgress} className="w-full" />
          </div>
        )}

        {syncStatus === 'completed' && linkedInData && (
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h4 className="mb-3 flex items-center gap-2 font-medium">
                <User className="h-4 w-4" />
                Profile Information
              </h4>
              <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p>{linkedInData.profile.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Headline</p>
                  <p>{linkedInData.profile.headline}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Connections</p>
                  <p>{linkedInData.profile.connections} connections</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p>{linkedInData.profile.location}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <h4 className="mb-3 flex items-center gap-2 font-medium">
                  <Building className="h-4 w-4" />
                  Experience
                </h4>
                <ul className="space-y-3">
                  {linkedInData.experience.slice(0, 2).map((exp: any) => (
                    <li key={exp.id} className="text-sm">
                      <p className="font-medium">{exp.title}</p>
                      <p className="text-muted-foreground">{exp.company}</p>
                      <p className="text-muted-foreground text-xs">
                        {exp.startDate ? new Date(exp.startDate).getFullYear() : ''} -
                        {exp.isCurrent
                          ? 'Present'
                          : exp.endDate
                            ? new Date(exp.endDate).getFullYear()
                            : ''}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="mb-3 flex items-center gap-2 font-medium">
                  <GraduationCap className="h-4 w-4" />
                  Education
                </h4>
                <ul className="space-y-3">
                  {linkedInData.education.slice(0, 2).map((edu: any) => (
                    <li key={edu.id} className="text-sm">
                      <p className="font-medium">{edu.school}</p>
                      <p className="text-muted-foreground">
                        {edu.degree}, {edu.fieldOfStudy}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {edu.startDate ? new Date(edu.startDate).getFullYear() : ''} -
                        {edu.endDate ? new Date(edu.endDate).getFullYear() : ''}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="mb-3 flex items-center gap-2 font-medium">
                <Award className="h-4 w-4" />
                Top Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {linkedInData.skills.slice(0, 8).map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Button
            onClick={handleLinkedInSync}
            disabled={isSyncing}
            className="flex items-center gap-2"
          >
            {isSyncing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Button>

          <Button variant="outline" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy Policy
          </Button>
        </div>

        <div className="pt-2 text-muted-foreground text-xs">
          <p className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            We only access publicly available information from your LinkedIn profile.
          </p>
          <p className="mt-1 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Last sync: {syncStatus === 'completed' ? new Date().toLocaleString() : 'Never'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LinkedInSync;
