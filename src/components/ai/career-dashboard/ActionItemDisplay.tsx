'use client';

import React from 'react';
import { ActionItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit3, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionItemDisplayProps {
  actionItem: ActionItem;
  onEdit: (actionItem: ActionItem) => void;
  onDelete: (actionItemId: string) => void;
  onToggleComplete: (actionItemId: string, isCompleted: boolean) => void;
  isLoading?: boolean; // To disable buttons during operations
}

export const ActionItemDisplay: React.FC<ActionItemDisplayProps> = ({
  actionItem,
  onEdit,
  onDelete,
  onToggleComplete,
  isLoading,
}) => {
  const handleToggle = () => {
    if (actionItem._id) {
      onToggleComplete(actionItem._id, !actionItem.isCompleted);
    }
  };

  return (
    <div className={cn(
      "flex items-center justify-between p-2 rounded-md hover:bg-slate-50",
      actionItem.isCompleted ? "bg-green-50" : ""
    )}>
      <div className="flex items-center flex-grow mr-2">
        <Checkbox
          id={`action-${actionItem._id}`}
          checked={actionItem.isCompleted}
          onCheckedChange={handleToggle}
          disabled={isLoading}
          className="mr-3 shrink-0"
        />
        <label
          htmlFor={`action-${actionItem._id}`}
          className={cn(
            "text-sm flex-grow cursor-pointer",
            actionItem.isCompleted ? "line-through text-gray-500" : "text-gray-700"
          )}
        >
          {actionItem.text}
        </label>
      </div>
      <div className="flex items-center space-x-1 shrink-0">
        <Button
          variant="ghost"
          size="iconSm"
          onClick={() => onEdit(actionItem)}
          disabled={isLoading}
          aria-label="Edit action item"
        >
          <Edit3 className="h-3.5 w-3.5 text-blue-600" />
        </Button>
        <Button
          variant="ghost"
          size="iconSm"
          onClick={() => actionItem._id && onDelete(actionItem._id)}
          disabled={isLoading}
          aria-label="Delete action item"
        >
          <Trash2 className="h-3.5 w-3.5 text-red-600" />
        </Button>
      </div>
    </div>
  );
};
