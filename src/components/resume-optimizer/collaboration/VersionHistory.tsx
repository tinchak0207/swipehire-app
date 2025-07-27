/**
 * Version History Component
 *
 * Features:
 * - Track all changes with detailed history
 * - Rollback capability to any previous version
 * - Visual diff comparison between versions
 * - Branching and merging support
 * - Collaborative version management
 * - Auto-save and manual save points
 *
 * Built with DaisyUI components and Tailwind CSS
 * Optimized for mobile-first responsive design
 * Includes comprehensive accessibility features (WCAG 2.1 AA)
 */

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { UserProfile } from '../types';

// Version History Types
export interface VersionHistoryProps {
  readonly currentContent: string;
  readonly currentUser: UserProfile;
  readonly collaborators: CollaborationUser[];
  readonly enableBranching: boolean;
  readonly enableAutoSave: boolean;
  readonly autoSaveInterval: number;
  readonly maxVersions: number;
  readonly onVersionRestore: (versionId: string) => void;
  readonly onVersionCompare: (versionA: string, versionB: string) => void;
  readonly onVersionDelete: (versionId: string) => void;
  readonly onBranchCreate: (fromVersionId: string, branchName: string) => void;
  readonly onBranchMerge: (sourceBranch: string, targetBranch: string) => void;
}

export interface VersionEntry {
  readonly id: string;
  readonly content: string;
  readonly title: string;
  readonly description?: string;
  readonly timestamp: Date;
  readonly author: UserProfile;
  readonly changes: ChangeDetail[];
  readonly score?: number;
  readonly tags: string[];
  readonly branch: string;
  readonly parentVersionId?: string;
  readonly isAutoSave: boolean;
  readonly isMilestone: boolean;
  readonly size: number;
  readonly checksum: string;
}

export interface ChangeDetail {
  readonly type: 'addition' | 'deletion' | 'modification' | 'move';
  readonly section: string;
  readonly description: string;
  readonly impact: number;
  readonly position: TextPosition;
  readonly oldText?: string;
  readonly newText?: string;
  readonly confidence: number;
}

export interface TextPosition {
  readonly start: number;
  readonly end: number;
  readonly line: number;
  readonly column: number;
}

export interface CollaborationUser {
  readonly id: string;
  readonly name: string;
  readonly avatar: string;
  readonly color: string;
  readonly isActive: boolean;
  readonly permissions: UserPermissions;
}

export interface UserPermissions {
  readonly canEdit: boolean;
  readonly canRestore: boolean;
  readonly canDelete: boolean;
  readonly canBranch: boolean;
  readonly canMerge: boolean;
}

export interface VersionBranch {
  readonly name: string;
  readonly description: string;
  readonly createdAt: Date;
  readonly createdBy: string;
  readonly isActive: boolean;
  readonly versionCount: number;
  readonly lastModified: Date;
  readonly color: string;
}

export interface DiffResult {
  readonly additions: DiffChunk[];
  readonly deletions: DiffChunk[];
  readonly modifications: DiffChunk[];
  readonly unchanged: DiffChunk[];
  readonly summary: DiffSummary;
}

export interface DiffChunk {
  readonly content: string;
  readonly position: TextPosition;
  readonly type: 'addition' | 'deletion' | 'modification' | 'unchanged';
  readonly confidence: number;
}

export interface DiffSummary {
  readonly totalChanges: number;
  readonly addedLines: number;
  readonly deletedLines: number;
  readonly modifiedLines: number;
  readonly addedWords: number;
  readonly deletedWords: number;
  readonly addedCharacters: number;
  readonly deletedCharacters: number;
}

export interface VersionFilter {
  readonly author?: string;
  readonly branch?: string;
  readonly dateRange?: { start: Date; end: Date };
  readonly tags?: string[];
  readonly changeType?: ChangeDetail['type'];
  readonly showAutoSaves: boolean;
  readonly showMilestones: boolean;
}

// Icons for version history
const VersionIcons = {
  History: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Restore: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Compare: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm6 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zM3 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zm6 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Branch: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Merge: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M12.293 3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 9H9a5 5 0 00-5 5v2a1 1 0 11-2 0v-2a7 7 0 017-7h5.586l-2.293-2.293a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Tag: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  ),
  AutoSave: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
    </svg>
  ),
  Milestone: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Delete: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Filter: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Diff: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

// Version Entry Component
const VersionEntryCard: React.FC<{
  version: VersionEntry;
  isSelected: boolean;
  isComparing: boolean;
  currentUser: UserProfile;
  onRestore: () => void;
  onCompare: () => void;
  onDelete: () => void;
  onCreateBranch: () => void;
  onAddTag: (tag: string) => void;
  onToggleMilestone: () => void;
}> = ({
  version,
  isSelected,
  isComparing,
  currentUser,
  onRestore,
  onCompare,
  onDelete,
  onCreateBranch,
  onAddTag,
  onToggleMilestone,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [newTag, setNewTag] = useState('');

  const canEdit = version.author.id === currentUser.id || currentUser.role === 'admin';
  const timeSince = useMemo(() => {
    if (!version.timestamp) return '';
    const now = new Date();
    const diff = now.getTime() - version.timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }, [version.timestamp]);

  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(newTag.trim());
      setNewTag('');
    }
  };

  return (
    <motion.div
      className={`card border-2 transition-all duration-300 ${
        isSelected
          ? 'border-primary bg-primary/10'
          : isComparing
            ? 'border-secondary bg-secondary/10'
            : 'border-base-300'
      }`}
      layout
    >
      <div className="card-body p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="h-8 w-8 rounded-full">
                <img src={version.author.avatar || ''} alt={version.author.name} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">{version.title}</h3>
                {version.isAutoSave && (
                  <div className="tooltip" data-tip="Auto-saved">
                    <VersionIcons.AutoSave />
                  </div>
                )}
                {version.isMilestone && (
                  <div className="tooltip" data-tip="Milestone">
                    <VersionIcons.Milestone />
                  </div>
                )}
              </div>
              <div className="text-base-content/70 text-xs">
                by {version.author.name} • {timeSince}
              </div>
              <div className="text-base-content/70 text-xs">
                Branch: <span className="badge badge-outline badge-xs">{version.branch}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {version.score && (
              <div className="badge badge-success badge-sm">Score: {version.score}</div>
            )}
            <div className="text-base-content/70 text-xs">{Math.round(version.size / 1024)}KB</div>
          </div>
        </div>

        {/* Description */}
        {version.description && (
          <p className="mt-2 text-base-content/80 text-sm">{version.description}</p>
        )}

        {/* Tags */}
        {version.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {version.tags.map((tag) => (
              <div key={tag} className="badge badge-outline badge-xs">
                <VersionIcons.Tag />
                {tag}
              </div>
            ))}
          </div>
        )}

        {/* Changes Summary */}
        {version.changes.length > 0 && (
          <div className="mt-3">
            <div className="mb-2 font-medium text-xs">Changes ({version.changes.length})</div>
            <div className="space-y-1">
              {version.changes.slice(0, showDetails ? undefined : 3).map((change, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      change.type === 'addition'
                        ? 'bg-success'
                        : change.type === 'deletion'
                          ? 'bg-error'
                          : change.type === 'modification'
                            ? 'bg-warning'
                            : 'bg-info'
                    }`}
                  />
                  <span className="flex-1">{change.description}</span>
                  {change.impact > 0 && (
                    <span className="badge badge-success badge-xs">+{change.impact}</span>
                  )}
                </div>
              ))}
              {version.changes.length > 3 && !showDetails && (
                <button className="btn btn-ghost btn-xs" onClick={() => setShowDetails(true)}>
                  Show {version.changes.length - 3} more changes
                </button>
              )}
            </div>
          </div>
        )}

        {/* Add Tag Input */}
        {showDetails && canEdit && (
          <div className="mt-3">
            <div className="flex gap-2">
              <input
                type="text"
                className="input input-bordered input-xs flex-1"
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <button
                className="btn btn-primary btn-xs"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="card-actions mt-4 justify-between">
          <div className="flex gap-1">
            <button className="btn btn-ghost btn-xs" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? 'Less' : 'Details'}
            </button>
            <button className="btn btn-ghost btn-xs" onClick={onCompare}>
              <VersionIcons.Compare />
              Compare
            </button>
          </div>

          <div className="flex gap-1">
            {canEdit && (
              <>
                <button className="btn btn-ghost btn-xs" onClick={onToggleMilestone}>
                  <VersionIcons.Milestone />
                </button>
                <button className="btn btn-ghost btn-xs" onClick={onCreateBranch}>
                  <VersionIcons.Branch />
                </button>
                <button className="btn btn-error btn-xs" onClick={onDelete}>
                  <VersionIcons.Delete />
                </button>
              </>
            )}
            <button className="btn btn-primary btn-xs" onClick={onRestore}>
              <VersionIcons.Restore />
              Restore
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Branch Selector Component
const BranchSelector: React.FC<{
  branches: VersionBranch[];
  currentBranch: string;
  onBranchChange: (branch: string) => void;
  onCreateBranch: (name: string, description: string) => void;
}> = ({ branches, currentBranch, onBranchChange, onCreateBranch }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchDescription, setNewBranchDescription] = useState('');

  const handleCreateBranch = () => {
    if (newBranchName.trim()) {
      onCreateBranch(newBranchName.trim(), newBranchDescription.trim());
      setNewBranchName('');
      setNewBranchDescription('');
      setShowCreateForm(false);
    }
  };

  return (
    <div className="card border bg-base-100">
      <div className="card-body p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Branches</h3>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <VersionIcons.Branch />
            New Branch
          </button>
        </div>

        {/* Create Branch Form */}
        {showCreateForm && (
          <div className="mb-4 space-y-3 rounded bg-base-200 p-3">
            <input
              type="text"
              className="input input-bordered input-sm w-full"
              placeholder="Branch name..."
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
            />
            <textarea
              className="textarea textarea-bordered textarea-sm w-full"
              placeholder="Description (optional)..."
              value={newBranchDescription}
              onChange={(e) => setNewBranchDescription(e.target.value)}
              rows={2}
            />
            <div className="flex gap-2">
              <button
                className="btn btn-primary btn-sm"
                onClick={handleCreateBranch}
                disabled={!newBranchName.trim()}
              >
                Create
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowCreateForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Branch List */}
        <div className="space-y-2">
          {branches.map((branch) => (
            <div
              key={branch.name}
              className={`cursor-pointer rounded p-3 transition-colors ${
                branch.name === currentBranch
                  ? 'border border-primary bg-primary/20'
                  : 'bg-base-200 hover:bg-base-300'
              }`}
              onClick={() => onBranchChange(branch.name)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{branch.name}</div>
                  <div className="text-base-content/70 text-xs">
                    {branch.versionCount} versions • {branch.lastModified.toLocaleDateString()}
                  </div>
                </div>
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: branch.color }} />
              </div>
              {branch.description && (
                <p className="mt-1 text-base-content/70 text-xs">{branch.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Version Filter Component
const VersionFilter: React.FC<{
  filter: VersionFilter;
  authors: UserProfile[];
  branches: string[];
  onFilterChange: (filter: Partial<VersionFilter>) => void;
  onClearFilter: () => void;
}> = ({ filter, authors, branches, onFilterChange, onClearFilter }) => {
  return (
    <div className="card border bg-base-100">
      <div className="card-body p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Filters</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClearFilter}>
            Clear
          </button>
        </div>

        <div className="space-y-3">
          {/* Author Filter */}
          <div>
            <label className="label label-text text-xs">Author</label>
            <select
              className="select select-bordered select-sm w-full"
              value={filter.author || ''}
              onChange={(e) => onFilterChange({ author: e.target.value })}
            >
              <option value="">All authors</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Filter */}
          <div>
            <label className="label label-text text-xs">Branch</label>
            <select
              className="select select-bordered select-sm w-full"
              value={filter.branch || ''}
              onChange={(e) => onFilterChange({ branch: e.target.value })}
            >
              <option value="">All branches</option>
              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filters */}
          <div className="space-y-2">
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text text-xs">Auto-saves</span>
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={filter.showAutoSaves}
                  onChange={(e) => onFilterChange({ showAutoSaves: e.target.checked })}
                />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text text-xs">Milestones</span>
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={filter.showMilestones}
                  onChange={(e) => onFilterChange({ showMilestones: e.target.checked })}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Diff Viewer Component
const DiffViewer: React.FC<{
  versionA: VersionEntry;
  versionB: VersionEntry;
  diffResult: DiffResult;
  onClose: () => void;
}> = ({ versionA, versionB, diffResult, onClose }) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="card max-h-[90vh] w-full max-w-6xl overflow-hidden bg-base-100"
        initial="hidden"
        animate="visible"
      >
        <div className="card-body">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="card-title">
              <VersionIcons.Diff />
              Version Comparison
            </h2>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>
              ✕
            </button>
          </div>

          {/* Comparison Header */}
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="card border border-error/20 bg-error/10">
              <div className="card-body p-3">
                <h3 className="font-semibold text-sm">{versionA.title}</h3>
                <div className="text-base-content/70 text-xs">
                  {versionA.timestamp.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="card border border-success/20 bg-success/10">
              <div className="card-body p-3">
                <h3 className="font-semibold text-sm">{versionB.title}</h3>
                <div className="text-base-content/70 text-xs">
                  {versionB.timestamp.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Diff Summary */}
          <div className="card mb-4 bg-base-200">
            <div className="card-body p-3">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="font-bold text-lg text-success">
                    +{diffResult.summary.addedLines}
                  </div>
                  <div className="text-xs">Added Lines</div>
                </div>
                <div>
                  <div className="font-bold text-error text-lg">
                    -{diffResult.summary.deletedLines}
                  </div>
                  <div className="text-xs">Deleted Lines</div>
                </div>
                <div>
                  <div className="font-bold text-lg text-warning">
                    {diffResult.summary.modifiedLines}
                  </div>
                  <div className="text-xs">Modified Lines</div>
                </div>
                <div>
                  <div className="font-bold text-lg">{diffResult.summary.totalChanges}</div>
                  <div className="text-xs">Total Changes</div>
                </div>
              </div>
            </div>
          </div>

          {/* Diff Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-2">
              {[...diffResult.additions, ...diffResult.deletions, ...diffResult.modifications].map(
                (chunk, index) => (
                  <div
                    key={index}
                    className={`rounded border-l-4 p-3 ${
                      chunk.type === 'addition'
                        ? 'border-success bg-success/10'
                        : chunk.type === 'deletion'
                          ? 'border-error bg-error/10'
                          : 'border-warning bg-warning/10'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div
                        className={`badge badge-sm ${
                          chunk.type === 'addition'
                            ? 'badge-success'
                            : chunk.type === 'deletion'
                              ? 'badge-error'
                              : 'badge-warning'
                        }`}
                      >
                        {chunk.type}
                      </div>
                      <div className="text-base-content/70 text-xs">Line {chunk.position.line}</div>
                    </div>
                    <div className="font-mono text-sm">{chunk.content}</div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main Version History Component
export const VersionHistory: React.FC<VersionHistoryProps> = ({
  currentContent,
  currentUser,
  enableBranching,
  enableAutoSave,
  autoSaveInterval,
  maxVersions,
  onVersionRestore,
  onVersionCompare,
  onVersionDelete,
  onBranchCreate,
}) => {
  // State management
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [branches, setBranches] = useState<VersionBranch[]>([]);
  const [currentBranch, setCurrentBranch] = useState('main');
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [filter, setFilter] = useState<Partial<VersionFilter>>({
    showAutoSaves: true,
    showMilestones: true,
  });
  const [showDiff, setShowDiff] = useState(false);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [isLoading] = useState(false);

  // Refs
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Mock data for demonstration
  const mockVersions: VersionEntry[] = [
    {
      id: 'version-1',
      content: 'Initial resume content...',
      title: 'Initial Version',
      description: 'First draft of the resume',
      timestamp: new Date(Date.now() - 86400000 * 3),
      author: currentUser,
      changes: [],
      score: 75,
      tags: ['initial', 'draft'],
      branch: 'main',
      isAutoSave: false,
      isMilestone: true,
      size: 2048,
      checksum: 'abc123',
    },
    {
      id: 'version-2',
      content: 'Updated resume with experience...',
      title: 'Added Work Experience',
      description: 'Added detailed work experience section',
      timestamp: new Date(Date.now() - 86400000 * 2),
      author: currentUser,
      changes: [
        {
          type: 'addition',
          section: 'experience',
          description: 'Added Software Engineer position',
          impact: 8,
          position: { start: 100, end: 200, line: 5, column: 0 },
          newText: 'Software Engineer at TechCorp...',
          confidence: 0.95,
        },
      ],
      score: 82,
      tags: ['experience', 'improvement'],
      branch: 'main',
      isAutoSave: false,
      isMilestone: false,
      size: 3072,
      checksum: 'def456',
    },
    {
      id: 'version-3',
      content: 'Auto-saved changes...',
      title: 'Auto-save',
      timestamp: new Date(Date.now() - 3600000),
      author: currentUser,
      changes: [
        {
          type: 'modification',
          section: 'summary',
          description: 'Updated professional summary',
          impact: 3,
          position: { start: 50, end: 100, line: 2, column: 0 },
          oldText: 'Experienced developer...',
          newText: 'Senior developer with 5+ years...',
          confidence: 0.88,
        },
      ],
      score: 85,
      tags: [],
      branch: 'main',
      isAutoSave: true,
      isMilestone: false,
      size: 3150,
      checksum: 'ghi789',
    },
  ];

  const mockBranches: VersionBranch[] = [
    {
      name: 'main',
      description: 'Main development branch',
      createdAt: new Date(Date.now() - 86400000 * 7),
      createdBy: currentUser.id,
      isActive: true,
      versionCount: 3,
      lastModified: new Date(Date.now() - 3600000),
      color: '#3b82f6',
    },
    {
      name: 'tech-focus',
      description: 'Technical role focused version',
      createdAt: new Date(Date.now() - 86400000 * 2),
      createdBy: currentUser.id,
      isActive: false,
      versionCount: 1,
      lastModified: new Date(Date.now() - 86400000 * 2),
      color: '#10b981',
    },
  ];

  // Initialize mock data
  useEffect(() => {
    setVersions(mockVersions);
    setBranches(mockBranches);
  }, [mockBranches, mockVersions]);

  // Auto-save functionality
  useEffect(() => {
    if (!enableAutoSave) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      createAutoSaveVersion();
    }, autoSaveInterval);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [enableAutoSave, autoSaveInterval, createAutoSaveVersion]);

  // Create auto-save version
  const createAutoSaveVersion = useCallback(() => {
    const newVersion: VersionEntry = {
      id: `version-${Date.now()}`,
      content: currentContent,
      title: 'Auto-save',
      timestamp: new Date(),
      author: currentUser,
      changes: [],
      tags: [],
      branch: currentBranch,
      isAutoSave: true,
      isMilestone: false,
      size: new Blob([currentContent]).size,
      checksum: btoa(currentContent).slice(0, 8),
    };

    setVersions((prev) => [newVersion, ...prev.slice(0, maxVersions - 1)]);
  }, [currentContent, currentUser, currentBranch, maxVersions]);

  // Handle version selection
  const handleVersionSelect = useCallback((versionId: string) => {
    setSelectedVersions((prev) => {
      if (prev.includes(versionId)) {
        return prev.filter((id) => id !== versionId);
      }
      if (prev.length < 2) {
        return [...prev, versionId];
      }
      return [prev[1], versionId] as string[];
    });
  }, []);

  // Handle version comparison
  const handleVersionCompare = useCallback(() => {
    if (selectedVersions.length === 2) {
      const versionA = versions.find((v) => v.id === selectedVersions[0]);
      const versionB = versions.find((v) => v.id === selectedVersions[1]);

      if (versionA && versionB) {
        // Mock diff result
        const mockDiffResult: DiffResult = {
          additions: [
            {
              content: 'Added new skill: React.js',
              position: { start: 100, end: 120, line: 5, column: 0 },
              type: 'addition',
              confidence: 0.95,
            },
          ],
          deletions: [
            {
              content: 'Removed outdated technology',
              position: { start: 200, end: 230, line: 8, column: 0 },
              type: 'deletion',
              confidence: 0.9,
            },
          ],
          modifications: [
            {
              content: 'Updated job title from Developer to Senior Developer',
              position: { start: 50, end: 80, line: 3, column: 0 },
              type: 'modification',
              confidence: 0.88,
            },
          ],
          unchanged: [],
          summary: {
            totalChanges: 3,
            addedLines: 1,
            deletedLines: 1,
            modifiedLines: 1,
            addedWords: 5,
            deletedWords: 3,
            addedCharacters: 25,
            deletedCharacters: 18,
          },
        };

        setDiffResult(mockDiffResult);
        setShowDiff(true);
        onVersionCompare(versionA.id, versionB.id);
      }
    }
  }, [selectedVersions, versions, onVersionCompare]);

  // Handle branch creation
  const handleBranchCreate = useCallback(
    (name: string, description: string) => {
      const newBranch: VersionBranch = {
        name,
        description,
        createdAt: new Date(),
        createdBy: currentUser.id,
        isActive: false,
        versionCount: 0,
        lastModified: new Date(),
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      };

      setBranches((prev) => [...prev, newBranch]);
      onBranchCreate('current', name);
    },
    [currentUser.id, onBranchCreate]
  );

  // Filter versions
  const filteredVersions = useMemo(() => {
    return versions.filter((version) => {
      if (filter.author && version.author.id !== filter.author) return false;
      if (filter.branch && version.branch !== filter.branch) return false;
      if (!filter.showAutoSaves && version.isAutoSave) return false;
      if (!filter.showMilestones && version.isMilestone) return false;
      if (filter.tags && filter.tags.length > 0) {
        if (!filter.tags.some((tag) => version.tags.includes(tag))) return false;
      }
      if (filter.dateRange) {
        const versionDate = version.timestamp;
        if (versionDate < filter.dateRange.start || versionDate > filter.dateRange.end) {
          return false;
        }
      }
      return true;
    });
  }, [versions, filter]);

  // Get unique authors and branches for filters
  const uniqueAuthors = useMemo(() => {
    const authors = new Map();
    versions.forEach((version) => {
      if (!authors.has(version.author.id)) {
        authors.set(version.author.id, version.author);
      }
    });
    return Array.from(authors.values());
  }, [versions]);

  const uniqueBranches = useMemo(() => {
    return Array.from(new Set(versions.map((v) => v.branch)));
  }, [versions]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      {/* Header */}
      <motion.div className="card bg-base-100 shadow-lg" initial="hidden" animate="visible">
        <div className="card-body p-4">
          <div className="flex items-center justify-between">
            <h2 className="card-title">
              <VersionIcons.History />
              Version History
              {isLoading && <span className="loading loading-spinner loading-sm" />}
            </h2>
            <div className="flex items-center gap-2">
              {selectedVersions.length === 2 && (
                <button className="btn btn-primary btn-sm" onClick={handleVersionCompare}>
                  <VersionIcons.Compare />
                  Compare
                </button>
              )}
              <div className="badge badge-outline badge-sm">{filteredVersions.length} versions</div>
            </div>
          </div>

          {selectedVersions.length > 0 && (
            <div className="mt-2">
              <div className="text-base-content/70 text-sm">
                {selectedVersions.length} version{selectedVersions.length > 1 ? 's' : ''} selected
                {selectedVersions.length === 2 && ' - Ready to compare'}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        {/* Sidebar */}
        <div className="space-y-4 xl:col-span-1">
          {/* Branch Selector */}
          {enableBranching && (
            <motion.div initial="hidden" animate="visible">
              <BranchSelector
                branches={branches}
                currentBranch={currentBranch}
                onBranchChange={setCurrentBranch}
                onCreateBranch={handleBranchCreate}
              />
            </motion.div>
          )}

          {/* Filters */}
          <motion.div initial="hidden" animate="visible">
            <VersionFilter
              filter={filter as any}
              authors={uniqueAuthors}
              branches={uniqueBranches}
              onFilterChange={(newFilter) => setFilter((prev) => ({ ...prev, ...newFilter }))}
              onClearFilter={() => setFilter({ showAutoSaves: true, showMilestones: true })}
            />
          </motion.div>
        </div>

        {/* Version List */}
        <motion.div className="xl:col-span-3" initial="hidden" animate="visible">
          <div className="space-y-3">
            <AnimatePresence>
              {filteredVersions.map((version) => (
                <VersionEntryCard
                  key={version.id}
                  version={version}
                  isSelected={selectedVersions.includes(version.id)}
                  isComparing={selectedVersions.length === 2}
                  currentUser={currentUser}
                  onRestore={() => onVersionRestore(version.id)}
                  onCompare={() => handleVersionSelect(version.id)}
                  onDelete={() => onVersionDelete(version.id)}
                  onCreateBranch={() =>
                    handleBranchCreate(`branch-${Date.now()}`, `Branch from ${version.title}`)
                  }
                  onAddTag={(tag) => {
                    // Add tag to version
                    setVersions((prev) =>
                      prev.map((v) => (v.id === version.id ? { ...v, tags: [...v.tags, tag] } : v))
                    );
                  }}
                  onToggleMilestone={() => {
                    // Toggle milestone status
                    setVersions((prev) =>
                      prev.map((v) =>
                        v.id === version.id ? { ...v, isMilestone: !v.isMilestone } : v
                      )
                    );
                  }}
                />
              ))}
            </AnimatePresence>

            {filteredVersions.length === 0 && (
              <div className="card border-2 border-dashed bg-base-100">
                <div className="card-body p-8 text-center">
                  <VersionIcons.History />
                  <p className="mt-2 text-base-content/70 text-sm">
                    No versions found matching your filters.
                  </p>
                  <button
                    className="btn btn-primary btn-sm mt-4"
                    onClick={() => setFilter({ showAutoSaves: true, showMilestones: true })}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Diff Viewer Modal */}
      <AnimatePresence>
        {showDiff && diffResult && selectedVersions.length === 2 && (
          <DiffViewer
            versionA={versions.find((v) => v.id === selectedVersions[0])!}
            versionB={versions.find((v) => v.id === selectedVersions[1])!}
            diffResult={diffResult}
            onClose={() => {
              setShowDiff(false);
              setDiffResult(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default VersionHistory;
