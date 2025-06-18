'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/AppHeader';
import { AICareerPlan, BackendUser } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, ExternalLink, AlertCircle, Edit3, ListChecks, Target, Brain, BookOpen, UserCheck, Compass as CompassIcon, PlusCircle, Trash2 } from 'lucide-react'; // Added UserCheck and CompassIcon (renamed from Compass to avoid conflict if any)
import { logAnalyticsEvent } from '@/lib/analytics';
import { CareerStage, UserGoal } from '@/lib/types'; // Import CareerStage for potential use, though direct display doesn't strictly need it
import { GoalItem } from '@/components/ai/career-dashboard/GoalItem';
import { GoalFormModal, GoalFormData } from '@/components/ai/career-dashboard/GoalFormModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Placeholder for auth, replace with actual auth context if available
const useAuth = () => {
  // Ensure this user ID exists in your backend DB and has completed onboarding + has a plan for testing full display.
  // Or use a different ID that has not completed onboarding to test that flow.
  return { userId: 'hardcoded-user-for-career-planner', isAuthenticated: true };
};

export default function CareerDashboardPage() {
  const { userId, isAuthenticated } = useAuth();
  const [userData, setUserData] = useState<BackendUser | null>(null);
  const [careerPlan, setCareerPlan] = useState<AICareerPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for goal management
  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);
  const [editingGoal, setEditingGoal] = useState<UserGoal | null>(null);
  const [currentGoalCategory, setCurrentGoalCategory] = useState<'short-term' | 'mid-term' | 'long-term' | null>(null);
  const [isLoadingGoals, setIsLoadingGoals] = useState<boolean>(false); // For goal-specific operations
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null); // Stores goalId to delete


  const fetchDashboardData = useCallback(async (currentUserId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/users/${currentUserId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User profile not found. Please ensure you are logged in.');
        }
        throw new Error(`Failed to fetch user data. Status: ${response.status}`);
      }
      const fetchedUserData = await response.json() as BackendUser;
      setUserData(fetchedUserData);

      if (!fetchedUserData.hasCompletedCareerPlannerOnboarding) {
        setError("Please complete your career profile and onboarding first to view your dashboard.");
        logAnalyticsEvent('career_dashboard_onboarding_incomplete', { userId: currentUserId });
        // Optional: Redirect or simply show link
        // router.push('/ai/career-planner');
      } else if (fetchedUserData.aiCareerPlan && Object.keys(fetchedUserData.aiCareerPlan).length > 0) {
        setCareerPlan(fetchedUserData.aiCareerPlan as AICareerPlan);
        logAnalyticsEvent('view_career_dashboard_page', { userId: currentUserId, planExists: true });
      } else {
        // Onboarding complete, but no plan yet
        logAnalyticsEvent('view_career_dashboard_page', { userId: currentUserId, planExists: false });
        // Message will be handled in render logic
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId && isAuthenticated) {
      fetchDashboardData(userId);
    } else if (!isAuthenticated) {
      setError("Please log in to view your career dashboard.");
      setIsLoading(false);
    }
  }, [userId, isAuthenticated, fetchDashboardData]);

  // Goal handlers
  const handleAddGoalClick = (category: 'short-term' | 'mid-term' | 'long-term') => {
    setEditingGoal(null);
    setCurrentGoalCategory(category);
    setShowGoalModal(true);
    logAnalyticsEvent('add_goal_modal_opened', { userId, category });
  };

  const handleEditGoalClick = (goal: UserGoal) => {
    setEditingGoal(goal);
    setCurrentGoalCategory(goal.category); // Ensure category is set for the modal
    setShowGoalModal(true);
    logAnalyticsEvent('edit_goal_modal_opened', { userId, goalId: goal._id });
  };

  const handleDeleteGoal = async (goalId: string | undefined) => {
    if (!userId || !goalId) return;
    setShowDeleteConfirm(goalId); // Show confirmation dialog
  };

  const confirmDeleteGoal = async () => {
    if (!userId || !showDeleteConfirm) return;
    const goalId = showDeleteConfirm;
    setIsLoadingGoals(true);
    try {
      const response = await fetch(`/api/users/${userId}/goals/${goalId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete goal.');

      setUserData(prev => prev ? ({
        ...prev,
        userGoals: prev.userGoals?.filter(g => g._id !== goalId) || []
      }) : null);
      logAnalyticsEvent('goal_deleted', { userId, goalId });
      // Add toast: Goal deleted
    } catch (err: any) {
      console.error("Error deleting goal:", err);
      setError("Failed to delete goal: " + err.message);
      // Add toast: Error deleting goal
    } finally {
      setIsLoadingGoals(false);
      setShowDeleteConfirm(null);
    }
  };


  const handleGoalFormSubmit = async (formData: GoalFormData) => {
    if (!userId) return;
    setIsLoadingGoals(true);
    const apiUrl = editingGoal?._id
      ? `/api/users/${userId}/goals/${editingGoal._id}`
      : `/api/users/${userId}/goals`;
    const method = editingGoal?._id ? 'PUT' : 'POST';

    try {
      const response = await fetch(apiUrl, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ${editingGoal ? 'update' : 'add'} goal.`);
      }
      const result = await response.json();
      const savedGoal = result.goal;

      setUserData(prev => {
        if (!prev) return null;
        const updatedGoals = editingGoal
          ? prev.userGoals?.map(g => (g._id === savedGoal._id ? savedGoal : g)) || [savedGoal]
          : [...(prev.userGoals || []), savedGoal];
        return { ...prev, userGoals: updatedGoals };
      });

      logAnalyticsEvent(editingGoal ? 'goal_updated' : 'goal_added', { userId, goalId: savedGoal._id, category: savedGoal.category });
      // Add toast: Goal saved
    } catch (err: any) {
      console.error(`Error ${editingGoal ? 'updating' : 'adding'} goal:`, err);
      setError(`Failed to ${editingGoal ? 'update' : 'add'} goal: ` + err.message);
      // Add toast: Error saving goal
    } finally {
      setIsLoadingGoals(false);
      setShowGoalModal(false);
      setEditingGoal(null);
      setCurrentGoalCategory(null);
    }
  };

  const handleAddActionItemPlaceholder = (goalId: string) => {
    console.log("Placeholder: Add action item for goalId:", goalId);
    logAnalyticsEvent('add_action_item_clicked_placeholder', { userId, goalId });
    // This would typically open another modal or inline form
  };

  const handleUpdateUserGoal = (updatedGoal: UserGoal) => {
    setUserData(prevUserData => {
      if (!prevUserData || !prevUserData.userGoals) {
        return prevUserData;
      }
      const updatedUserGoals = prevUserData.userGoals.map(g =>
        g._id === updatedGoal._id ? updatedGoal : g
      );
      return { ...prevUserData, userGoals: updatedUserGoals };
    });
     // Optionally, toast success for goal update (though individual action item toasts might be enough)
  };

  if (isLoading || isLoadingGoals) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <div className="flex flex-grow items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="container mx-auto p-4 md:p-6 flex-grow">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              {userData && !userData.hasCompletedCareerPlannerOnboarding && (
                <Link href="/ai/career-planner" passHref className="mt-2 block">
                  <Button variant="link">Complete Your Career Onboarding</Button>
                </Link>
              )}
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  if (!userData) { // Should ideally be covered by loading or error state
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="container mx-auto p-4 md:p-6 flex-grow text-center">
             <p>Could not load user data.</p>
        </main>
      </div>
    );
  }

  if (!userData.hasCompletedCareerPlannerOnboarding) { // Explicit check again after loading/error
     return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="container mx-auto p-4 md:p-6 flex-grow text-center">
            <Card className="max-w-lg mx-auto mt-10">
                <CardHeader>
                    <CardTitle>Career Profile Incomplete</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">Please complete your career profile onboarding to access your personalized dashboard and AI career plan.</p>
                    <Link href="/ai/career-planner" passHref>
                        <Button>Go to Career Planner Onboarding</Button>
                    </Link>
                </CardContent>
            </Card>
        </main>
      </div>
    );
  }

  if (!careerPlan) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="container mx-auto p-4 md:p-6 flex-grow text-center">
          <Card className="max-w-lg mx-auto mt-10">
            <CardHeader>
              <CardTitle>No Career Plan Yet?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">You haven't generated an AI career plan yet. Let's create one!</p>
              <Link href="/ai/career-planner" passHref>
                <Button>Create My AI Career Plan</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Main Dashboard Display
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <AppHeader />
      <main className="container mx-auto p-4 md:p-6 flex-grow">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">My Career Dashboard</h1>
            <Link href="/ai/career-planner" passHref>
                <Button variant="outline">
                    <Edit3 className="mr-2 h-4 w-4" /> Update My Plan Inputs
                </Button>
            </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Current Stage & Progress */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="mr-2 h-6 w-6 text-primary"/> Current Career Stage
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userData?.assessedCareerStage ? (
                  <>
                    <h3 className="text-xl font-semibold text-gray-800">{userData.assessedCareerStage.replace(/_/g, ' ')}</h3>
                    {userData.assessedCareerStageReasoning && (
                      <p className="text-sm text-muted-foreground mt-1">{userData.assessedCareerStageReasoning}</p>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    {careerPlan
                      ? "Your career stage will be updated the next time you generate or update your plan."
                      : "Generate your career plan to see your AI-assessed career stage."}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><ListChecks className="mr-2 h-6 w-6 text-primary"/> Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Interactive progress tracking for your goals coming soon!</p>
              </CardContent>
            </Card>
          </div>

          {/* Column 2: Paths & Goals */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><CompassIcon className="mr-2 h-6 w-6 text-primary"/> Recommended Career Paths</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {careerPlan.suggestedPaths.map((path, index) => (
                  <div key={index} className="p-3 border rounded-lg bg-slate-50/50">
                    <h3 className="font-semibold text-lg text-slate-700">{path.pathName}</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-2">{path.description}</p>
                    {path.pros && path.pros.length > 0 && <div className="mb-1"><strong className="text-xs font-medium text-green-600">PROS: </strong> <span className="text-xs">{path.pros.join(', ')}</span></div>}
                    {path.cons && path.cons.length > 0 && <div><strong className="text-xs font-medium text-red-600">CONS: </strong> <span className="text-xs">{path.cons.join(', ')}</span></div>}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center"><Target className="mr-2 h-6 w-6 text-primary"/> My Goals & Action Plans</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {(['short-term', 'mid-term', 'long-term'] as const).map(category => {
                  const goalsForCategory = userData.userGoals?.filter(g => g.category === category) || [];
                  return (
                    <div key={category}>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-md text-slate-700 capitalize">
                          {category.replace('-', ' ')} Goals
                        </h4>
                        <Button variant="outline" size="sm" onClick={() => handleAddGoalClick(category)}>
                          <PlusCircle className="h-4 w-4 mr-2" /> Add {category.replace('-', ' ')} Goal
                        </Button>
                      </div>
                      {goalsForCategory.length > 0 ? (
                        <ul className="space-y-3">
                          {goalsForCategory.map((goal) => (
                            <GoalItem
                              key={goal._id}
                              goal={goal}
                              userId={userId!} // Pass userId, ensure it's non-null here
                              onEdit={handleEditGoalClick}
                              onDelete={handleDeleteGoal}
                              onAddActionItem={handleAddActionItemPlaceholder} // This is the old prop for GoalItem, will be replaced by direct call
                              onUpdateGoal={handleUpdateUserGoal} // Pass the new handler
                            />
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No {category.replace('-', ' ')} goals set yet.</p>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {careerPlan.actionableAdvice && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><Brain className="mr-2 h-6 w-6 text-primary"/> General Advice</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{careerPlan.actionableAdvice}</p>
                </CardContent>
              </Card>
            )}

            {careerPlan.resourceSuggestions && careerPlan.resourceSuggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><BookOpen className="mr-2 h-6 w-6 text-primary"/> Helpful Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {careerPlan.resourceSuggestions.map((resource, index) => (
                    <div key={index} className="p-3 border rounded-md text-sm">
                      <h4 className="font-medium text-slate-800">{resource.name}</h4>
                      {resource.description && <p className="text-xs text-muted-foreground my-1">{resource.description}</p>}
                      {resource.url && (
                        <Link href={resource.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center">
                          View Resource <ExternalLink className="ml-1 h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      {showGoalModal && currentGoalCategory && (
        <GoalFormModal
          isOpen={showGoalModal}
          onClose={() => {
            setShowGoalModal(false);
            setEditingGoal(null);
            setCurrentGoalCategory(null);
          }}
          onSubmit={handleGoalFormSubmit}
          initialData={editingGoal || undefined}
          goalCategory={currentGoalCategory}
          isLoading={isLoadingGoals}
        />
      )}
       <AlertDialog open={!!showDeleteConfirm} onOpenChange={(open) => { if(!open) setShowDeleteConfirm(null);}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this goal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteConfirm(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteGoal} className="bg-red-600 hover:bg-red-700">
              {isLoadingGoals ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
