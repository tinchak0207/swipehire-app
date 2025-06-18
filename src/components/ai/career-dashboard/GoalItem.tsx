'use client';

import React from 'react';
import React, { useState } from 'react'; // Import useState
import { UserGoal, ActionItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit3, Trash2, PlusCircle, CalendarDays, CheckCircle, Circle } from 'lucide-react';

import { ActionItemDisplay } from './ActionItemDisplay';
import { ActionItemFormModal, ActionItemFormData } from './ActionItemFormModal';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress'; // Import Progress component
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // For delete confirmation

interface GoalItemProps {
  goal: UserGoal;
  userId: string; // Needed for API calls
  onEdit: (goal: UserGoal) => void; // To open the goal edit modal (handled by parent)
  onDelete: (goalId: string) => void; // To initiate delete in parent (parent shows confirmation)
  onUpdateGoal: (updatedGoal: UserGoal) => void; // To update the goal in parent's state
  // onToggleCompleteGoal: (goalId: string, isCompleted: boolean) => void; // For parent to handle goal completion
}

export const GoalItem: React.FC<GoalItemProps> = ({ goal, userId, onEdit, onDelete, onUpdateGoal }) => {
  const { _id: goalId, text, category, targetDate, isCompleted, actionItems = [], createdAt, updatedAt } = goal;
  const { toast } = useToast();

  const totalActionItems = actionItems.length;
  const completedActionItems = actionItems.filter(item => item.isCompleted).length;
  const progressPercentage = totalActionItems > 0 ? (completedActionItems / totalActionItems) * 100 : 0;

  const [showActionItemModal, setShowActionItemModal] = useState(false);
  const [editingActionItem, setEditingActionItem] = useState<ActionItem | null>(null);
  const [isLoadingActionItem, setIsLoadingActionItem] = useState(false);
  const [showDeleteActionItemConfirm, setShowDeleteActionItemConfirm] = useState<string | null>(null);

  const handleOpenAddActionItemModal = () => {
    setEditingActionItem(null);
    setShowActionItemModal(true);
  };

  const handleEditActionItemClick = (actionItem: ActionItem) => {
    setEditingActionItem(actionItem);
    setShowActionItemModal(true);
  };

  const handleDeleteActionItemClick = (actionItemId: string) => {
    setShowDeleteActionItemConfirm(actionItemId);
  };

  const confirmDeleteActionItem = async () => {
    if (!showDeleteActionItemConfirm || !goalId) return;
    const actionItemId = showDeleteActionItemConfirm;
    setIsLoadingActionItem(true);
    try {
      const response = await fetch(`/api/users/${userId}/goals/${goalId}/actions/${actionItemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete action item.');
      const updatedGoalFromServer = await response.json(); // Assuming backend returns updated goal
      onUpdateGoal(updatedGoalFromServer.goal);
      toast({ title: "Success", description: "Action item deleted." });
    } catch (error: any) {
      console.error("Error deleting action item:", error);
      toast({ title: "Error", description: error.message || "Could not delete action item.", variant: "destructive" });
    } finally {
      setIsLoadingActionItem(false);
      setShowDeleteActionItemConfirm(null);
    }
  };

  const handleToggleActionItemComplete = async (actionItemId: string, currentIsCompleted: boolean) => {
    if (!goalId) return;
    setIsLoadingActionItem(true);
    try {
      const response = await fetch(`/api/users/${userId}/goals/${goalId}/actions/${actionItemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !currentIsCompleted }),
      });
      if (!response.ok) throw new Error('Failed to update action item status.');
      const updatedGoalFromServer = await response.json();
      onUpdateGoal(updatedGoalFromServer.goal);
       toast({ title: "Success", description: `Action item marked as ${!currentIsCompleted ? "complete" : "incomplete"}.` });
    } catch (error: any) {
      console.error("Error toggling action item:", error);
      toast({ title: "Error", description: error.message || "Could not update action item.", variant: "destructive" });
    } finally {
      setIsLoadingActionItem(false);
    }
  };

  const handleActionItemFormSubmit = async (formData: ActionItemFormData) => {
    if (!goalId) return;
    setIsLoadingActionItem(true);
    const apiUrl = editingActionItem?._id
      ? `/api/users/${userId}/goals/${goalId}/actions/${editingActionItem._id}`
      : `/api/users/${userId}/goals/${goalId}/actions`;
    const method = editingActionItem?._id ? 'PUT' : 'POST';

    try {
      const response = await fetch(apiUrl, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ${editingActionItem ? 'update' : 'add'} action item.`);
      }
      const result = await response.json();
      onUpdateGoal(result.goal); // Assuming backend returns the updated parent goal
      toast({ title: "Success", description: `Action item ${editingActionItem ? 'updated' : 'added'}.` });
    } catch (error: any) {
      console.error(`Error ${editingActionItem ? 'updating' : 'adding'} action item:`, error);
      toast({ title: "Error", description: error.message || "Could not save action item.", variant: "destructive" });
    } finally {
      setIsLoadingActionItem(false);
      setShowActionItemModal(false);
      setEditingActionItem(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className={`w-full shadow-sm hover:shadow-md transition-shadow duration-200 ${isCompleted ? 'bg-green-50 opacity-80' : 'bg-white'}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className={`text-lg font-semibold ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>{text}</CardTitle>
          <Badge
            variant={
              category === 'short-term' ? 'default'
              : category === 'mid-term' ? 'secondary'
              : 'outline'
            }
            className="capitalize shrink-0 ml-2"
          >
            {category.replace('-', ' ')}
          </Badge>
        </div>
        {targetDate && (
          <CardDescription className="text-xs text-gray-500 flex items-center pt-1">
            <CalendarDays className="h-3 w-3 mr-1.5" />
            Target: {formatDate(targetDate)}
            {isCompleted && targetDate && new Date(targetDate) < new Date() && (
                <Badge variant="destructive" className="ml-2 text-xs">Overdue</Badge>
            )}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-4 text-sm">
        <div className="text-gray-600 mb-2 space-y-1">
            {totalActionItems > 0 ? (
                <>
                    <p className="text-xs font-medium">
                        Progress: {completedActionItems} / {totalActionItems} actions completed
                    </p>
                    <Progress value={progressPercentage} className="w-full h-1.5" />
                </>
            ) : (
                 <p className="text-xs font-medium">Progress: No actions defined</p>
            )}
        </div>
        <div className="space-y-1 mt-2 mb-3 max-h-40 overflow-y-auto scrollbar-thin pr-1">
            {actionItems.length > 0 ? (
                actionItems.map(item => (
                    <ActionItemDisplay
                        key={item._id}
                        actionItem={item}
                        onEdit={handleEditActionItemClick}
                        onDelete={() => handleDeleteActionItemClick(item._id!)}
                        onToggleComplete={() => handleToggleActionItemComplete(item._id!, item.isCompleted || false)}
                        isLoading={isLoadingActionItem}
                    />
                ))
            ) : (
                <p className="text-xs italic text-gray-500">No action items yet. Click "Add Action Item" to get started.</p>
            )}
        </div>
         <p className="text-xs text-gray-400 mt-2">
            Last updated: {formatDate(updatedAt || createdAt)}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 sm:space-x-2 border-t pt-4">
        <Button
            variant="outline"
            size="sm"
            onClick={handleOpenAddActionItemModal}
            disabled={isLoadingActionItem}
            className="text-xs w-full sm:w-auto"
        >
            <PlusCircle className="h-3.5 w-3.5 mr-1" /> Add Action Item
        </Button>
        <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(goal)} className="text-xs">
            <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit Goal
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(goalId!)} className="text-xs">
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Goal
            </Button>
        </div>
      </CardFooter>

      {showActionItemModal && (
        <ActionItemFormModal
          isOpen={showActionItemModal}
          onClose={() => {
            setShowActionItemModal(false);
            setEditingActionItem(null);
          }}
          onSubmit={handleActionItemFormSubmit}
          initialData={editingActionItem || undefined}
          isLoading={isLoadingActionItem}
        />
      )}

      <AlertDialog open={!!showDeleteActionItemConfirm} onOpenChange={(open) => { if(!open) setShowDeleteActionItemConfirm(null);}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this action item. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteActionItemConfirm(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteActionItem} className="bg-red-600 hover:bg-red-700">
              {isLoadingActionItem ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Action Item"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
