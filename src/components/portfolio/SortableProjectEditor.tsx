'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type React from 'react';
import type { Project } from '@/lib/types/portfolio';
import ProjectEditor from './ProjectEditor';

interface SortableProjectEditorProps {
  project: Project;
  index: number;
  onUpdate: (updates: Partial<Project>) => void;
  onRemove: () => void;
  onReorder: (reorderedProjects: Project[]) => void;
  allProjects: Project[];
  isDragging?: boolean;
}

/**
 * SortableProjectEditor Component
 *
 * A wrapper around ProjectEditor that adds drag-and-drop functionality
 * using @dnd-kit/sortable. This component handles the sortable behavior
 * while delegating the actual project editing to the ProjectEditor component.
 */
const SortableProjectEditor: React.FC<SortableProjectEditorProps> = ({
  project,
  index,
  onUpdate,
  onRemove,
  onReorder,
  allProjects,
  isDragging = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: project.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        ${isSortableDragging ? 'z-50' : ''}
        ${isDragging ? 'shadow-2xl ring-2 ring-primary ring-opacity-50' : ''}
      `}
      {...attributes}
    >
      <ProjectEditor
        project={project}
        index={index}
        onUpdate={onUpdate}
        onRemove={onRemove}
        onReorder={onReorder}
        allProjects={allProjects}
        dragHandleProps={listeners}
        isDragging={isSortableDragging}
      />
    </div>
  );
};

export default SortableProjectEditor;
