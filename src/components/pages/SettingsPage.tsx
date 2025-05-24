
"use client";

import { useState, useEffect } from 'react';
import type { UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { UserCog, Briefcase, Users, ShieldCheck, Mail, User } from 'lucide-react';

interface SettingsPageProps {
  currentUserRole: UserRole | null;
  onRoleChange: (newRole: UserRole) => void;
  // onSettingsSave: (settings: { name: string; email: string }) => void; // For future use
}

export function SettingsPage({ currentUserRole, onRoleChange }: SettingsPageProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(currentUserRole);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    setSelectedRole(currentUserRole);
    // Load saved name and email from localStorage if they exist
    const savedName = localStorage.getItem('userNameSettings');
    const savedEmail = localStorage.getItem('userEmailSettings');
    if (savedName) setUserName(savedName);
    if (savedEmail) setUserEmail(savedEmail);
  }, [currentUserRole]);

  const handleSaveSettings = () => {
    if (selectedRole && selectedRole !== currentUserRole) {
      onRoleChange(selectedRole);
    }
    // Save name and email to localStorage
    localStorage.setItem('userNameSettings', userName);
    localStorage.setItem('userEmailSettings', userEmail);

    // onSettingsSave({ name: userName, email: userEmail }); // For future backend integration
    toast({
      title: 'Settings Saved',
      description: 'Your preferences have been updated.',
    });
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <UserCog className="mx-auto h-12 w-12 text-primary mb-3" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Manage your profile, role, and verification status.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Briefcase className="mr-2 h-5 w-5 text-primary" />
            Change Your Role
          </CardTitle>
          <CardDescription>Select whether you are currently hiring or looking for a job.</CardDescription>
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
          <CardDescription>Update your contact details.</CardDescription>
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
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
            Identity Verification
          </CardTitle>
          <CardDescription>Verify your identity to build trust (Feature Coming Soon).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We are working on a system to allow you to verify your identity by submitting relevant documents or certificates. 
            This will help enhance the credibility of your profile.
          </p>
          <div className="p-4 border-2 border-dashed rounded-md text-center bg-muted/50">
            <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
            <p className="font-semibold">Verification Portal Coming Soon</p>
            <p className="text-xs text-muted-foreground">Upload certificates and complete verification steps here.</p>
          </div>
           <Button variant="outline" disabled className="w-full">
            Upload Certificate (Disabled)
          </Button>
        </CardContent>
      </Card>

      <CardFooter className="flex justify-end pt-6">
        <Button onClick={handleSaveSettings} size="lg">
          <UserCog className="mr-2 h-5 w-5" />
          Save Settings
        </Button>
      </CardFooter>
    </div>
  );
}
