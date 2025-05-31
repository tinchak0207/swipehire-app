
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Database, UserPlus, UserSearch, Settings, Save } from 'lucide-react';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';

interface UserPreferences {
  theme?: 'light' | 'dark';
  featureFlags?: Record<string, boolean>;
}

interface User {
  _id: string; // MongoDB ObjectId
  name: string;
  email: string;
  preferences?: UserPreferences;
  createdAt?: string;
  updatedAt?: string;
}

export default function BackendTestPage() {
  const [userIdToFetch, setUserIdToFetch] = useState('');
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoadingFetch, setIsLoadingFetch] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTheme, setNewTheme] = useState<'light' | 'dark'>('light');
  const [newFeatureFlagsJson, setNewFeatureFlagsJson] = useState('{\n  "newFeatureX": true,\n  "betaAccess": false\n}');
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);
  const [isLoadingCreate, setIsLoadingCreate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [userIdToUpdate, setUserIdToUpdate] = useState('');
  const [updatePreferencesJson, setUpdatePreferencesJson] = useState('{\n  "theme": "dark",\n  "featureFlags": {\n    "newFeatureX": true,\n    "betaAccess": true,\n    "anotherFlag": false\n  }\n}');
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleFetchUser = async () => {
    if (!userIdToFetch) {
      toast({ title: "Input Error", description: "Please enter a User ID to fetch.", variant: "destructive" });
      return;
    }
    setIsLoadingFetch(true);
    setFetchError(null);
    setUserData(null);
    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/api/users/${userIdToFetch}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Error: ${response.status} - ${response.statusText}` }));
        throw new Error(errorData.message);
      }
      const data: User = await response.json();
      setUserData(data);
      toast({ title: "User Fetched!", description: `Data for ${data.name} (ID: ${data._id}) loaded.` });
    } catch (err: any) {
      setFetchError(err.message);
      toast({ title: "Fetch Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoadingFetch(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newName || !newEmail) {
      toast({ title: "Input Error", description: "Please enter name and email.", variant: "destructive" });
      return;
    }
    let parsedFeatureFlags = {};
    try {
      if (newFeatureFlagsJson.trim()) parsedFeatureFlags = JSON.parse(newFeatureFlagsJson);
    } catch (e) {
      toast({ title: "JSON Error", description: "Invalid JSON for Feature Flags.", variant: "destructive" });
      return;
    }

    setIsLoadingCreate(true);
    setCreateError(null);
    setCreatedUserId(null);
    try {
      const payload = {
        name: newName,
        email: newEmail,
        preferences: {
          theme: newTheme,
          featureFlags: parsedFeatureFlags,
        },
      };
      const response = await fetch(`${CUSTOM_BACKEND_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Error: ${response.status} - ${response.statusText}` }));
        throw new Error(errorData.message);
      }
      const { user: createdUser }: { user: User } = await response.json(); // Assuming backend returns { message: string, user: User }
      toast({ title: "User Created!", description: `${createdUser.name} (ID: ${createdUser._id}) has been added.` });
      setCreatedUserId(createdUser._id);
      setUserIdToFetch(createdUser._id); // Pre-fill for easy fetching
      setUserIdToUpdate(createdUser._id); // Pre-fill for easy updating
      // Optionally clear form fields
      // setNewName(''); setNewEmail(''); setNewTheme('light'); setNewFeatureFlagsJson('{\n  "newFeatureX": true,\n  "betaAccess": false\n}');
    } catch (err: any) {
      setCreateError(err.message);
      toast({ title: "Create User Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoadingCreate(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!userIdToUpdate) {
      toast({ title: "Input Error", description: "Please enter the User ID of the user to update.", variant: "destructive" });
      return;
    }
    let parsedPreferences = {};
    try {
      if (updatePreferencesJson.trim()) parsedPreferences = JSON.parse(updatePreferencesJson);
    } catch (e) {
      toast({ title: "JSON Error", description: "Invalid JSON for Preferences.", variant: "destructive" });
      return;
    }

    setIsLoadingUpdate(true);
    setUpdateError(null);
    try {
      // The backend expects the fields to update, e.g. { "preferences": { ... } }
      // or { "name": "New Name" }. Here we are updating the entire preferences object.
      const payload = { preferences: parsedPreferences }; 
      
      const response = await fetch(`${CUSTOM_BACKEND_URL}/api/users/${userIdToUpdate}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Error: ${response.status} - ${response.statusText}` }));
        throw new Error(errorData.message);
      }
      const { message, user: updatedUser }: { message: string, user: User } = await response.json();
      toast({ title: "User Updated!", description: `${message} (User: ${updatedUser.name})` });
      setUserData(updatedUser); // Update displayed data if this user was fetched
    } catch (err: any) {
      setUpdateError(err.message);
      toast({ title: "Update User Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoadingUpdate(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <header className="text-center">
        <Database className="mx-auto h-12 w-12 text-primary mb-2" />
        <h1 className="text-3xl font-bold">Custom Backend Database Interaction</h1>
        <p className="text-muted-foreground">
          Test page for creating, fetching, and updating user data (including unique preferences) via a custom Node.js/Express/MongoDB backend.
        </p>
      </header>

      {/* Create User Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><UserPlus className="mr-2 h-5 w-5" />Create New User</CardTitle>
          <CardDescription>Add a new user with name, email, and preferences to your MongoDB database.</CardDescription>
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
          <div className="space-y-1">
            <Label htmlFor="newTheme">Theme Preference</Label>
            <Select value={newTheme} onValueChange={(value: 'light' | 'dark') => setNewTheme(value)} disabled={isLoadingCreate}>
              <SelectTrigger id="newTheme">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="newFeatureFlags">Feature Flags (JSON)</Label>
            <Textarea
              id="newFeatureFlags"
              placeholder='e.g., { "newDashboard": true, "betaAccess": false }'
              value={newFeatureFlagsJson}
              onChange={(e) => setNewFeatureFlagsJson(e.target.value)}
              rows={3}
              disabled={isLoadingCreate}
            />
          </div>
          <Button onClick={handleCreateUser} disabled={isLoadingCreate} className="w-full">
            {isLoadingCreate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4"/>}
            {isLoadingCreate ? 'Creating...' : 'Create User'}
          </Button>
          {createdUserId && <p className="text-sm text-green-600">User created with ID: {createdUserId}</p>}
          {createError && <p className="text-sm text-destructive">{createError}</p>}
        </CardContent>
      </Card>

      {/* Fetch User Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><UserSearch className="mr-2 h-5 w-5" />Fetch User by ID</CardTitle>
          <CardDescription>Enter a User ID (MongoDB ObjectId) to fetch their data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="text"
              placeholder="Enter User ID (e.g., 60d5ecb8d3b9f3252c1a8a9f)"
              value={userIdToFetch}
              onChange={(e) => setUserIdToFetch(e.target.value)}
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
      
      {/* Update User Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Settings className="mr-2 h-5 w-5" />Update User Preferences</CardTitle>
          <CardDescription>Update preferences (theme, feature flags) for an existing user by their ID.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="text"
            placeholder="User ID to update"
            value={userIdToUpdate}
            onChange={(e) => setUserIdToUpdate(e.target.value)}
            disabled={isLoadingUpdate}
          />
          <div className="space-y-1">
            <Label htmlFor="updatePreferences">Preferences (JSON format for the 'preferences' field)</Label>
            <Textarea
              id="updatePreferences"
              placeholder='e.g., { "theme": "dark", "featureFlags": { "newDashboard": true, "betaAccess": true } }'
              value={updatePreferencesJson}
              onChange={(e) => setUpdatePreferencesJson(e.target.value)}
              rows={5}
              disabled={isLoadingUpdate}
            />
            <p className="text-xs text-muted-foreground">
              The entire 'preferences' object provided here will replace the existing one on the backend.
            </p>
          </div>
          <Button onClick={handleUpdateUser} disabled={isLoadingUpdate} className="w-full">
            {isLoadingUpdate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4"/>}
            {isLoadingUpdate ? 'Updating...' : 'Update Preferences'}
          </Button>
          {updateError && <p className="text-sm text-destructive">{updateError}</p>}
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Important Considerations</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-foreground/80 space-y-2">
          <p>1. **Run Your Backend:** This frontend page expects your custom Node.js/Express backend (from the guide) to be running separately (e.g., on port 5000).</p>
          <p>2. **CORS:** Ensure your Express backend has CORS configured to allow requests from your Next.js frontend origin (e.g., `http://localhost:9002` during development). The provided backend example includes this.</p>
          <p>3. **MongoDB Setup:** Your MongoDB instance must be running and the `MONGODB_URI` in your backend's `.env` file must be correct.</p>
          <p>4. **Environment Variables:**
            <ul>
              <li>Frontend (<code>.env</code>): <code>NEXT_PUBLIC_CUSTOM_BACKEND_URL=http://localhost:5000</code></li>
              <li>Backend (<code>.env</code> in backend project): <code>MONGO_URI</code>, <code>BACKEND_PORT</code> (or `PORT`), <code>FRONTEND_URL</code>.</li>
            </ul>
          </p>
          <p>5. **User IDs:** After creating a user, their MongoDB `_id` will be shown. Use this ID for fetching or updating that specific user.</p>
          <p>6. **Error Handling & Security:** This is an illustrative example. Real applications require robust error handling, input validation, and security measures (like authentication/authorization for API endpoints).</p>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">This setup demonstrates how a Next.js frontend can interact with a custom backend to manage user-specific data.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
