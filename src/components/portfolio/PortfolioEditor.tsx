'use client';

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { EyeIcon, PlusIcon, SaveIcon, ShareIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCreatePortfolio, useUpdatePortfolio } from '@/hooks/usePortfolio';
import type { PortfolioDraft, PortfolioLayout, Project } from '@/lib/types/portfolio';
import LayoutSelector from './LayoutSelector';
import PortfolioPreview from './PortfolioPreview';
import SortableProjectEditor from './SortableProjectEditor';
import TagSelector from './TagSelector';

interface PortfolioEditorProps {
  initialData: PortfolioDraft;
  mode: 'create' | 'edit';
  portfolioId?: string;
}

/**
 * Main Portfolio Editor Component
 *
 * This component provides a comprehensive interface for creating and editing portfolios.
 * It includes form fields for basic portfolio information, project management,
 * layout selection, and real-time preview functionality.
 *
 * Features:
 * - Basic portfolio fields (title, description, tags)
 * - Project management with drag-and-drop reordering
 * - Layout selection with preview
 * - Real-time preview in modal/drawer
 * - Auto-save functionality
 * - State management for draft data
 */
const PortfolioEditor: React.FC<PortfolioEditorProps> = ({ initialData, mode, portfolioId }) => {
  const router = useRouter();
  const { toast } = useToast();

  // State management for portfolio draft
  const [draft, setDraft] = useState<PortfolioDraft>(initialData);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  // React Query mutations
  const createPortfolioMutation = useCreatePortfolio();
  const updatePortfolioMutation = useUpdatePortfolio();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * Update draft state and mark as dirty
   */
  const updateDraft = useCallback((updates: Partial<PortfolioDraft>) => {
    setDraft((prev) => ({
      ...prev,
      ...updates,
      isDirty: true,
    }));
  }, []);

  /**
   * Handle basic field changes
   */
  const handleFieldChange = useCallback(
    (field: keyof PortfolioDraft, value: any) => {
      updateDraft({ [field]: value });
    },
    [updateDraft]
  );

  /**
   * Handle tag changes
   */
  const handleTagsChange = useCallback(
    (tags: string[]) => {
      updateDraft({ tags });
    },
    [updateDraft]
  );

  /**
   * Handle layout change
   */
  const handleLayoutChange = useCallback(
    (layout: PortfolioLayout) => {
      updateDraft({ layout });
    },
    [updateDraft]
  );

  /**
   * Add new project
   */
  const handleAddProject = useCallback(() => {
    const newProject: Project = {
      id: `temp-${Date.now()}`,
      title: '',
      description: '',
      media: [],
      links: [],
      tags: [],
      order: draft.projects.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      likes: 0,
      isPublished: false,
      technologies: [],
      duration: '1 month',
      role: 'Developer',
    };

    updateDraft({
      projects: [...draft.projects, newProject],
    });
  }, [draft.projects, updateDraft]);

  /**
   * Update project
   */
  const handleUpdateProject = useCallback(
    (projectId: string, updates: Partial<Project>) => {
      const updatedProjects = draft.projects.map((project) =>
        project.id === projectId
          ? { ...project, ...updates, updatedAt: new Date().toISOString() }
          : project
      );
      updateDraft({ projects: updatedProjects });
    },
    [draft.projects, updateDraft]
  );

  /**
   * Remove project
   */
  const handleRemoveProject = useCallback(
    (projectId: string) => {
      const filteredProjects = draft.projects
        .filter((project) => project.id !== projectId)
        .map((project, index) => ({ ...project, order: index }));

      updateDraft({ projects: filteredProjects });
    },
    [draft.projects, updateDraft]
  );

  /**
   * Handle drag start
   */
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  /**
   * Handle drag end
   */
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = draft.projects.findIndex((project) => project.id === active.id);
      const newIndex = draft.projects.findIndex((project) => project.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedProjects = arrayMove(draft.projects, oldIndex, newIndex);
        const projectsWithUpdatedOrder = reorderedProjects.map((project, index) => ({
          ...project,
          order: index,
        }));
        updateDraft({ projects: projectsWithUpdatedOrder });

        toast({
          title: 'Project Reordered',
          description: 'Project order has been updated.',
        });
      }
    },
    [draft.projects, updateDraft, toast]
  );

  /**
   * Reorder projects (for drag-and-drop)
   */
  const handleReorderProjects = useCallback(
    (reorderedProjects: Project[]) => {
      const projectsWithUpdatedOrder = reorderedProjects.map((project, index) => ({
        ...project,
        order: index,
      }));
      updateDraft({ projects: projectsWithUpdatedOrder });
    },
    [updateDraft]
  );

  /**
   * Save portfolio
   */
  const handleSave = useCallback(
    async (publish = false) => {
      if (!draft.title.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Portfolio title is required.',
          variant: 'destructive',
        });
        return;
      }

      setIsSaving(true);

      try {
        const portfolioData = {
          title: draft.title,
          description: draft.description,
          projects: draft.projects.map((project) => ({
            title: project.title,
            description: project.description,
            media: project.media,
            links: project.links,
            tags: project.tags,
            order: project.order,
            isPublished: true,
            technologies: project.technologies || [],
            duration: project.duration,
            role: project.role,
          })),
          layout: draft.layout,
          tags: draft.tags,
          isPublished: publish,
          url: draft.url || draft.title.toLowerCase().replace(/\s+/g, '-'),
          theme: draft.theme || 'light',
        };

        if (mode === 'create') {
          const result = await createPortfolioMutation.mutateAsync(portfolioData);
          toast({
            title: 'Success',
            description: `Portfolio ${publish ? 'created and published' : 'saved as draft'} successfully.`,
          });
          router.push(`/portfolio/edit/${result.id}`);
        } else if (portfolioId) {
          await updatePortfolioMutation.mutateAsync({
            id: portfolioId,
            data: portfolioData,
          });
          toast({
            title: 'Success',
            description: `Portfolio ${publish ? 'published' : 'updated'} successfully.`,
          });
          setDraft((prev) => ({ ...prev, isDirty: false }));
        }
      } catch (_error) {
        toast({
          title: 'Error',
          description: 'Failed to save portfolio. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsSaving(false);
      }
    },
    [draft, mode, portfolioId, createPortfolioMutation, updatePortfolioMutation, toast, router]
  );

  /**
   * Auto-save functionality
   */
  useEffect(() => {
    if (!autoSaveEnabled || !draft.isDirty || mode === 'create') return;

    const autoSaveTimer = setTimeout(() => {
      handleSave(false);
    }, 5000); // Auto-save after 5 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [draft, autoSaveEnabled, mode, handleSave]);

  /**
   * Warn user about unsaved changes
   */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (draft.isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [draft.isDirty]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Editor Panel */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Information Card */}
          <div className="rounded-xl border border-gray-200/50 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
            <h2 className="mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text font-bold text-2xl text-transparent">
              Portfolio Information
            </h2>

            {/* Title Field */}
            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text font-medium text-gray-700">Title *</span>
              </label>
              <input
                type="text"
                placeholder="Enter portfolio title..."
                className="input w-full rounded-lg border-gray-200/50 bg-white/60 text-black transition-all duration-200 placeholder:text-gray-500 focus:border-blue-500 focus:bg-white/80 focus:ring-2 focus:ring-blue-200"
                value={draft.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                required
              />
            </div>

            {/* Description Field */}
            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text font-medium text-gray-700">Description</span>
              </label>
              <textarea
                className="textarea h-24 w-full rounded-lg border-gray-200/50 bg-white/60 text-black transition-all duration-200 placeholder:text-gray-500 focus:border-blue-500 focus:bg-white/80 focus:ring-2 focus:ring-blue-200"
                placeholder="Describe your portfolio..."
                value={draft.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
              />
            </div>

            {/* Tags */}
            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text font-medium text-gray-700">Tags</span>
              </label>
              <TagSelector
                selectedTags={draft.tags}
                onTagsChange={handleTagsChange}
                placeholder="Add tags to categorize your portfolio..."
              />
            </div>

            {/* Layout Selection */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-gray-700">Layout</span>
              </label>
              <LayoutSelector selectedLayout={draft.layout} onLayoutChange={handleLayoutChange} />
            </div>
          </div>

          {/* Projects Section */}
          <div className="rounded-xl border border-gray-200/50 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text font-bold text-2xl text-transparent">
                Projects
              </h2>
              <button
                className="btn btn-sm rounded-lg border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg"
                onClick={handleAddProject}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Project
              </button>
            </div>

            {/* Projects List */}
            <div className="space-y-4">
              {draft.projects.length === 0 ? (
                <div className="rounded-lg border border-gray-200/30 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 py-12 text-center backdrop-blur-sm">
                  <div className="mb-2 text-gray-600">
                    <PlusIcon className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                    <p className="text-lg">No projects added yet.</p>
                  </div>
                  <p className="text-gray-500 text-sm">Click "Add Project" to get started.</p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                >
                  <SortableContext
                    items={draft.projects.map((p) => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {draft.projects
                        .sort((a, b) => a.order - b.order)
                        .map((project, index) => (
                          <SortableProjectEditor
                            key={project.id}
                            project={project}
                            index={index}
                            onUpdate={(updates) => handleUpdateProject(project.id, updates)}
                            onRemove={() => handleRemoveProject(project.id)}
                            onReorder={handleReorderProjects}
                            allProjects={draft.projects}
                            isDragging={activeId === project.id}
                          />
                        ))}
                    </div>
                  </SortableContext>

                  {/* Drag Overlay */}
                  <DragOverlay>
                    {activeId ? (
                      <div className="rotate-3 transform opacity-90 shadow-2xl">
                        {(() => {
                          const draggedProject = draft.projects.find((p) => p.id === activeId);
                          const draggedIndex = draft.projects.findIndex((p) => p.id === activeId);
                          return draggedProject ? (
                            <SortableProjectEditor
                              project={draggedProject}
                              index={draggedIndex}
                              onUpdate={() => {}}
                              onRemove={() => {}}
                              onReorder={() => {}}
                              allProjects={draft.projects}
                              isDragging={true}
                            />
                          ) : null;
                        })()}
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions Card */}
          <div className="rounded-xl border border-gray-200/50 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
            <h3 className="mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text font-bold text-lg text-transparent">
              Actions
            </h3>

            <div className="space-y-3">
              {/* Preview Button */}
              <button
                className="btn btn-block rounded-lg border-gray-200 bg-white/80 text-gray-700 transition-all duration-200 hover:border-blue-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-blue-700"
                onClick={() => setShowPreview(true)}
              >
                <EyeIcon className="mr-2 h-4 w-4" />
                Preview
              </button>

              {/* Save Draft Button */}
              <button
                className={`btn btn-block rounded-lg transition-all duration-200 ${
                  isSaving
                    ? 'bg-gray-400 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg'
                }`}
                onClick={() => handleSave(false)}
                disabled={isSaving || !draft.isDirty}
              >
                {!isSaving && <SaveIcon className="mr-2 h-4 w-4" />}
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>

              {/* Publish Button */}
              <button
                className={`btn btn-block rounded-lg transition-all duration-200 ${
                  isSaving
                    ? 'bg-gray-400 text-white'
                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md hover:from-green-600 hover:to-green-700 hover:shadow-lg'
                }`}
                onClick={() => handleSave(true)}
                disabled={isSaving || !draft.title.trim()}
              >
                {!isSaving && <ShareIcon className="mr-2 h-4 w-4" />}
                {isSaving ? 'Publishing...' : 'Publish'}
              </button>
            </div>

            {/* Auto-save Toggle */}
            <div className="form-control mt-6">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={autoSaveEnabled}
                  onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                />
                <span className="label-text font-medium text-gray-700">Auto-save</span>
              </label>
            </div>

            {/* Status Indicator */}
            {draft.isDirty && (
              <div className="mt-4 rounded-lg border border-yellow-200/50 bg-gradient-to-r from-yellow-50 to-amber-50 p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-500" />
                  <span className="font-medium text-yellow-700 text-sm">Unsaved changes</span>
                </div>
              </div>
            )}
          </div>

          {/* Portfolio Stats (if editing) */}
          {mode === 'edit' && (
            <div className="rounded-xl border border-gray-200/50 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
              <h3 className="mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text font-bold text-lg text-transparent">
                Portfolio Stats
              </h3>
              <div className="space-y-4">
                <div className="rounded-lg border border-blue-200/30 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 p-4 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="font-bold text-2xl text-blue-600">{draft.projects.length}</div>
                    <div className="text-gray-600 text-sm">Projects</div>
                  </div>
                </div>
                <div className="rounded-lg border border-green-200/30 bg-gradient-to-r from-green-50/50 to-emerald-50/50 p-4 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="font-bold text-lg">
                      {draft.isPublished ? (
                        <span className="text-green-600">Published</span>
                      ) : (
                        <span className="text-orange-600">Draft</span>
                      )}
                    </div>
                    <div className="text-gray-600 text-sm">Status</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="modal modal-open">
            <div className="modal-box h-5/6 w-11/12 max-w-7xl rounded-xl border border-gray-200/50 bg-white/95 shadow-2xl backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between border-b border-gray-200/50 pb-4">
                <h3 className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text font-bold text-lg text-transparent">
                  Portfolio Preview
                </h3>
                <button
                  className="btn btn-sm btn-circle border-gray-200 bg-white/80 text-gray-700 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
                  onClick={() => setShowPreview(false)}
                >
                  ✕
                </button>
              </div>

              <div className="h-full overflow-auto rounded-lg border border-gray-200/30 bg-white/50 p-4 backdrop-blur-sm">
                <PortfolioPreview portfolio={draft} />
              </div>
            </div>
            <div
              className="modal-backdrop bg-black/30 backdrop-blur-sm"
              onClick={() => setShowPreview(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioEditor;
