
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Database, UserPlus, UserSearch } from 'lucide-react';

// This URL should point to your custom backend.
// It's good practice to use an environment variable for this.
const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';

interface User {
  _id: string;
  name: string;
  email: string;
  uniqueSettings?: Record<string, any>;
  featureFlags?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export default function BackendTestPage() {
  const [emailToFetch, setEmailToFetch] = useState('');
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoadingFetch, setIsLoadingFetch] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isLoadingCreate, setIsLoadingCreate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [settingsEmail, setSettingsEmail] = useState('');
  const [uniqueSettingsJson, setUniqueSettingsJson] = useState('{\n  "theme": "dark",\n  "notifications": true\n}');
  const [featureFlagsJson, setFeatureFlagsJson] = useState('{\n  "newDashboard": true,\n  "betaFeatureX": false\n}');
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);


  const { toast } = useToast();

  const handleFetchUser = async () => {
    if (!emailToFetch) {
      toast({ title: "Input Error", description: "Please enter an email to fetch.", variant: "destructive" });
      return;
    }
    setIsLoadingFetch(true);
    setFetchError(null);
    setUserData(null);
    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/api/users/${emailToFetch}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Error: ${response.status}` }));
        throw new Error(errorData.message);
      }
      const data: User = await response.json();
      setUserData(data);
      toast({ title: "User Fetched!", description: `Data for ${data.name} loaded successfully.` });
    } catch (err: any) {
      setFetchError(err.message);
      toast({ title: "Fetch Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoadingFetch(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newName || !newEmail) {
      toast({ title: "Input Error", description: "Please enter name and email to create a user.", variant: "destructive" });
      return;
    }
    setIsLoadingCreate(true);
    setCreateError(null);
    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, email: newEmail }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Error: ${response.status}` }));
        throw new Error(errorData.message);
      }
      const createdUser: User = await response.json();
      toast({ title: "User Created!", description: `${createdUser.name} has been added.` });
      setNewName('');
      setNewEmail('');
    } catch (err: any) {
      setCreateError(err.message);
      toast({ title: "Create User Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoadingCreate(false);
    }
  };

  const handleUpdateSettings = async () => {
    if (!settingsEmail) {
      toast({ title: "Input Error", description: "Please enter the email of the user to update.", variant: "destructive" });
      return;
    }
    let parsedUniqueSettings = {};
    let parsedFeatureFlags = {};
    try {
      if (uniqueSettingsJson.trim()) parsedUniqueSettings = JSON.parse(uniqueSettingsJson);
      if (featureFlagsJson.trim()) parsedFeatureFlags = JSON.parse(featureFlagsJson);
    } catch (e) {
      toast({ title: "JSON Error", description: "Invalid JSON in settings or flags.", variant: "destructive" });
      return;
    }

    setIsLoadingUpdate(true);
    setUpdateError(null);
    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/api/users/${settingsEmail}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uniqueSettings: parsedUniqueSettings, featureFlags: parsedFeatureFlags }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Error: ${response.status}` }));
        throw new Error(errorData.message);
      }
      const updatedData = await response.json();
      toast({ title: "Settings Updated!", description: updatedData.message });
    } catch (err: any) {
      setUpdateError(err.message);
      toast({ title: "Update Settings Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoadingUpdate(false);
    }
  };


  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <header className="text-center">
        <Database className="mx-auto h-12 w-12 text-primary mb-2" />
        <h1 className="text-3xl font-bold">Custom Backend Interaction Test</h1>
        <p className="text-muted-foreground">
          This page demonstrates communication with a separate Node.js/Express/MongoDB backend.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><UserSearch className="mr-2 h-5 w-5" />Fetch User from Backend</CardTitle>
          <CardDescription>Enter an email to fetch user data from your custom backend API.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="email"
              placeholder="Enter user's email (e.g., test@example.com)"
              value={emailToFetch}
              onChange={(e) => setEmailToFetch(e.target.value)}
              disabled={isLoadingFetch}
            />
            <Button onClick={handleFetchUser} disabled={isLoadingFetch} className="w-full sm:w-auto">
              {isLoadingFetch ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoadingFetch ? 'Fetching...' : 'Fetch User'}
            </Button>
          </div>
          {fetchError && <p className="text-sm text-destructive">{fetchError}</p>}
          {userData && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <h3 className="font-semibold text-lg mb-2">User Data:</h3>
              <pre className="text-sm overflow-x-auto">{JSON.stringify(userData, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><UserPlus className="mr-2 h-5 w-5" />Create New User</CardTitle>
          <CardDescription>Add a new user to your MongoDB database via the backend API.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="text"
            placeholder="Enter name (e.g., Jane Doe)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={isLoadingCreate}
          />
          <Input
            type="email"
            placeholder="Enter email (e.g., jane@example.com)"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            disabled={isLoadingCreate}
          />
          <Button onClick={handleCreateUser} disabled={isLoadingCreate} className="w-full">
            {isLoadingCreate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoadingCreate ? 'Creating...' : 'Create User'}
          </Button>
          {createError && <p className="text-sm text-destructive">{createError}</p>}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><UserPlus className="mr-2 h-5 w-5" />Update User Settings/Flags</CardTitle>
          <CardDescription>Update unique settings or feature flags for an existing user.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="email"
            placeholder="User's email to update settings for"
            value={settingsEmail}
            onChange={(e) => setSettingsEmail(e.target.value)}
            disabled={isLoadingUpdate}
          />
          <Textarea
            placeholder="Unique Settings (JSON format)"
            value={uniqueSettingsJson}
            onChange={(e) => setUniqueSettingsJson(e.target.value)}
            rows={4}
            disabled={isLoadingUpdate}
          />
          <Textarea
            placeholder="Feature Flags (JSON format)"
            value={featureFlagsJson}
            onChange={(e) => setFeatureFlagsJson(e.target.value)}
            rows={4}
            disabled={isLoadingUpdate}
          />
          <Button onClick={handleUpdateSettings} disabled={isLoadingUpdate} className="w-full">
            {isLoadingUpdate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoadingUpdate ? 'Updating...' : 'Update Settings'}
          </Button>
          {updateError && <p className="text-sm text-destructive">{updateError}</p>}
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Important Considerations</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-foreground/80 space-y-2">
          <p>1. **Run Your Backend:** This frontend page expects your custom Node.js/Express backend to be running separately (e.g., on port 5000 as configured in `NEXT_PUBLIC_CUSTOM_BACKEND_URL`).</p>
          <p>2. **CORS:** Ensure your Express backend has CORS configured to allow requests from your Next.js frontend origin (e.g., `http://localhost:9002` during development).</p>
          <p>3. **MongoDB Setup:** Your MongoDB instance must be running and the connection string (<code>MONGO_URI</code>) in your backend's <code>server.js</code> must be correct.</p>
          <p>4. **Environment Variables:**
            <ul>
              <li>Frontend (<code>.env</code> or <code>.env.local</code>): <code>NEXT_PUBLIC_CUSTOM_BACKEND_URL=http://localhost:5000</code></li>
              <li>Backend (e.g., in its own <code>.env</code> file or system env): <code>MONGO_URI</code>, <code>BACKEND_PORT</code>, <code>FRONTEND_URL</code>.</li>
            </ul>
          </p>
          <p>5. **Error Handling & Security:** This is a basic example. Real applications require robust error handling, input validation, and security measures (like authentication/authorization for API endpoints).</p>
          <p>6. **Dependencies:** Your custom backend will need its own <code>package.json</code> with dependencies like <code>express</code>, <code>mongoose</code>, <code>cors</code>, and <code>dotenv</code>. You'd run <code>npm install</code> in its directory.</p>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">This setup demonstrates a common pattern for full-stack applications where Next.js handles the frontend and a separate server handles dedicated backend logic and database interactions.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
