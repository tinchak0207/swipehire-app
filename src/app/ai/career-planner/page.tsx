'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CareerInputForm, CareerFormData } from '@/components/ai/career-planner/CareerInputForm';
import { AppHeader } from '@/components/AppHeader'; // Assuming AppHeader exists
import { AICareerPlan, BackendUser } from '@/lib/types'; // Assuming AICareerPlan is in types.ts
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { logAnalyticsEvent } from '@/lib/analytics';

// Placeholder for auth, replace with actual auth context if available
const useAuth = () => {
  // In a real app, this would come from your auth provider (e.g., Firebase, Clerk, NextAuth)
  // For this subtask, we'll use a hardcoded ID.
  // Ensure this user ID exists in your backend DB if you are testing against a live backend.
  return { userId: 'hardcoded-user-for-career-planner', isAuthenticated: true };
};

export default function CareerPlannerPage() {
  const { userId, isAuthenticated } = useAuth();
  const [careerInputs, setCareerInputs] = useState<Partial<CareerFormData>>({});
  const [careerPlan, setCareerPlan] = useState<AICareerPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestionFeedback, setSuggestionFeedback] = useState<Record<string, 'adopted' | 'helpful' | 'dismissed' | null>>({});

  const handleSuggestionFeedback = async (suggestionId: string, feedbackType: 'adopted' | 'helpful' | 'dismissed') => {
    if (!userId) {
      console.error("User ID not available for saving feedback.");
      // Optionally show an error toast to the user
      return;
    }

    // Optimistically update UI
    const currentLocalFeedback = suggestionFeedback[suggestionId];
    const newLocalFeedbackState = currentLocalFeedback === feedbackType ? null : feedbackType;

    setSuggestionFeedback(prev => ({
      ...prev,
      [suggestionId]: newLocalFeedbackState,
    }));

    console.log(`Local feedback for ${suggestionId} set to: ${newLocalFeedbackState}. Sending ${feedbackType} to backend.`);

    try {
      const response = await fetch(`/api/users/${userId}/career-plan/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suggestionId,
          feedbackType: feedbackType // Always send the clicked feedbackType, backend handles toggle logic
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to save feedback to server.' }));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Feedback saved successfully to backend:', result);
      // Optionally, show a success toast
      // Potentially update local state with server's state if needed, though optimistic update is usually fine.
      // For instance, if the backend modifies the timestamp or returns the full list:
      // if (result.feedback) {
      //   const serverFeedbackMap = result.feedback.reduce((acc, fb) => {
      //     acc[fb.suggestionId] = fb.feedbackType;
      //     return acc;
      //   }, {});
      //   setSuggestionFeedback(serverFeedbackMap);
      // }

    } catch (error) {
      console.error('Failed to save feedback to backend:', error);
      // Optionally, show an error toast to the user
      // Note: UI state is not reverted here to maintain optimistic update.
      // Could add logic here to revert if critical, e.g., by storing prevFeedback and resetting.
      // setError('Failed to save your feedback. Please try again.'); // This would show a page-level error
    }
  };

  const fetchUserCareerData = useCallback(async (currentUserId: string) => {
    setIsLoadingInitialData(true);
    setError(null);
    try {
      // This endpoint might not exist or might not return the specific fields directly.
      // This is a placeholder based on the subtask description.
      // A dedicated endpoint GET /api/users/:userId/career-data would be better.
      const response = await fetch(`/api/users/${currentUserId}`);
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`User ${currentUserId} not found. Initializing with empty career data.`);
          setCareerInputs({});
          setCareerPlan(null);
        } else {
          throw new Error(`Failed to fetch user data. Status: ${response.status}`);
        }
      } else {
        const userData = await response.json() as BackendUser; // Assuming full BackendUser structure

        setCareerInputs({
          careerGoals: userData.careerGoals || '',
          careerInterests: userData.careerInterests || [],
          careerValues: userData.careerValues || [],
        });
        if (userData.aiCareerPlan) {
          // Ensure aiCareerPlan is not an empty object if it can be
          if (Object.keys(userData.aiCareerPlan).length > 0) {
            setCareerPlan(userData.aiCareerPlan as AICareerPlan); // Cast if backend returns Mixed type
          } else {
            setCareerPlan(null);
          }
        } else {
          setCareerPlan(null);
        }
        console.log("Fetched user data for career planner:", {
            goals: userData.careerGoals,
            interests: userData.careerInterests,
            values: userData.careerValues,
            planExists: !!userData.aiCareerPlan
        });
      }
    } catch (err) {
      console.error('Error fetching initial career data:', err);
      setError('Failed to load initial career information. Please try again later.');
      // Initialize with empty data on error to allow form usage
      setCareerInputs({});
      setCareerPlan(null);
    } finally {
      setIsLoadingInitialData(false);
    }
  }, []);

  useEffect(() => {
    if (userId && isAuthenticated) {
      fetchUserCareerData(userId);
    } else if (!isAuthenticated) {
      setIsLoadingInitialData(false);
      setError("Please log in to use the Career Planner.");
    }
  }, [userId, isAuthenticated, fetchUserCareerData]);

  // Analytics useEffect
  useEffect(() => {
    if (userId && isAuthenticated) {
      logAnalyticsEvent('view_career_planner_page', { userId });
      logAnalyticsEvent('career_planner_session_start', { userId, timestamp: new Date().toISOString() });

      return () => {
        logAnalyticsEvent('career_planner_session_end', { userId, timestamp: new Date().toISOString() });
      };
    }
  }, [userId, isAuthenticated]);

  const handleGeneratePlan = async (data: CareerFormData) => {
    if (!userId) {
      setError('User ID not found. Cannot generate plan.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/users/${userId}/career-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to generate career plan. Please try again.' }));
        throw new Error(errorData.message || `Failed to generate career plan. Status: ${response.status}`);
      }

      const plan: AICareerPlan = await response.json();
      setCareerPlan(plan);
      // Update inputs as backend might have saved them
      setCareerInputs({
        careerGoals: data.careerGoals,
        careerInterests: data.careerInterests,
        careerValues: data.careerValues
      });
    } catch (err: any) {
      console.error('Error generating career plan:', err);
      setError(err.message || 'An unexpected error occurred.');
      setCareerPlan(null); // Clear previous plan on error
    } finally {
      setIsLoading(false);
    }
  };

  const renderPlan = (plan: AICareerPlan) => {
    const renderFeedbackButtons = (suggestionType: string, suggestionKey: string | number) => {
      const uniqueId = `${suggestionType}-${suggestionKey}`;
      return (
        <div className="mt-2 space-x-2 flex items-center">
          <span className="text-xs font-medium mr-2">Feedback:</span>
          <Button
            variant={suggestionFeedback[uniqueId] === 'adopted' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSuggestionFeedback(uniqueId, 'adopted')}
            className={`px-2 py-1 h-auto text-xs ${suggestionFeedback[uniqueId] === 'adopted' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
          >
            Adopt
          </Button>
          <Button
            variant={suggestionFeedback[uniqueId] === 'helpful' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSuggestionFeedback(uniqueId, 'helpful')}
            className={`px-2 py-1 h-auto text-xs ${suggestionFeedback[uniqueId] === 'helpful' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
          >
            Helpful
          </Button>
          <Button
            variant={suggestionFeedback[uniqueId] === 'dismissed' ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => handleSuggestionFeedback(uniqueId, 'dismissed')}
            className={`px-2 py-1 h-auto text-xs ${suggestionFeedback[uniqueId] === 'dismissed' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
          >
            Dismiss
          </Button>
        </div>
      );
    };

    return (
      <Card className="mt-8 w-full">
        <CardHeader>
          <CardTitle>Your AI Generated Career Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          {plan.suggestedPaths && plan.suggestedPaths.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Suggested Career Paths:</h3>
              {plan.suggestedPaths.map((path, index) => (
                <Card key={`path-${index}`} className="mb-4 p-4">
                  <CardTitle className="text-md font-semibold">{path.pathName}</CardTitle>
                  <p className="mb-1 mt-1"><strong className="font-medium">Description:</strong> {path.description}</p>
                  {path.pros && path.pros.length > 0 && <p className="mb-1"><strong className="font-medium">Pros:</strong> {path.pros.join(', ')}</p>}
                  {path.cons && path.cons.length > 0 && <p className="mb-1"><strong className="font-medium">Cons:</strong> {path.cons.join(', ')}</p>}
                  {renderFeedbackButtons('path', path.pathName || index)}
                </Card>
              ))}
            </div>
          )}
          {plan.shortTermGoals && plan.shortTermGoals.length > 0 && (
             <div>
              <h3 className="font-semibold text-lg mb-2">Short-Term Goals (3-12 months):</h3>
              <ul className="space-y-3">
                {plan.shortTermGoals.map((goal, index) => (
                  <li key={`stg-${index}`} className="p-3 border rounded-md">
                    <strong className="font-medium">{goal.goal}</strong>
                    {goal.suggestedActions && goal.suggestedActions.length > 0 && (
                      <ul className="list-disc pl-5 text-xs mt-1 space-y-0.5">
                        {goal.suggestedActions.map((action, actIndex) => <li key={actIndex}>{action}</li>)}
                      </ul>
                    )}
                    {renderFeedbackButtons('stg', goal.goal || index)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {plan.midTermGoals && plan.midTermGoals.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-lg mb-2">Mid-Term Goals (1-3 years):</h3>
              <ul className="space-y-3">
                {plan.midTermGoals.map((goal, index) => (
                  <li key={`mtg-${index}`} className="p-3 border rounded-md">
                    <strong className="font-medium">{goal.goal}</strong>
                    {goal.suggestedActions && goal.suggestedActions.length > 0 && (
                       <ul className="list-disc pl-5 text-xs mt-1 space-y-0.5">
                        {goal.suggestedActions.map((action, actIndex) => <li key={actIndex}>{action}</li>)}
                      </ul>
                    )}
                    {renderFeedbackButtons('mtg', goal.goal || index)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {plan.actionableAdvice && (
          <div className="mt-4">
            <h3 className="font-semibold text-lg mb-2">Actionable Advice:</h3>
            <p>{plan.actionableAdvice}</p>
          </div>
        )}
        {plan.resourceSuggestions && plan.resourceSuggestions.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-lg mb-2">Resource Suggestions:</h3>
            <ul className="list-disc pl-5 space-y-1">
              {plan.resourceSuggestions.map((resource, index) => (
                <li key={index}>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                    {resource.name}
                  </a>
                  {resource.description && <p className="text-xs text-gray-600">{resource.description}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );


  if (!isAuthenticated) {
     return (
      <div className="container mx-auto p-4 flex flex-col items-center">
        <AppHeader />
        <Alert variant="destructive" className="mt-8 max-w-md">
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>Please log in to use the AI Career Planner.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoadingInitialData) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center">
        <AppHeader />
        <div className="flex items-center justify-center mt-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg">Loading your career data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 flex flex-col items-center">
      <AppHeader />
      <main className="w-full max-w-4xl mt-8">
        <h1 className="text-3xl font-bold text-center mb-2">AI Career Planner</h1>
        <p className="text-center text-gray-600 mb-8">
          Define your aspirations and let our AI craft a personalized career roadmap for you.
        </p>

        <CareerInputForm
          initialData={careerInputs}
          onSubmit={handleGeneratePlan}
          isLoading={isLoading}
        />

        {error && (
          <Alert variant="destructive" className="mt-8">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading && !careerPlan && (
           <div className="flex items-center justify-center mt-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-lg">Generating your career plan...</p>
          </div>
        )}

        {careerPlan && !isLoading && renderPlan(careerPlan)}

        {!careerPlan && !isLoading && !isLoadingInitialData && !error && (
             <Card className="mt-8 w-full text-center">
                <CardHeader>
                    <CardTitle>Ready to Plan Your Future?</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">Fill out the form above to generate your personalized career plan.</p>
                    <p className="text-sm text-gray-500 mt-2">If you have an existing plan, it will be displayed here once loaded.</p>
                </CardContent>
             </Card>
        )}
      </main>
    </div>
  );

