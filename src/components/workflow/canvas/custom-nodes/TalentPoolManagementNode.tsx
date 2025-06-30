import { Handle, Position } from '@reactflow/core';
import React, { memo, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiDatabase, FiPlus, FiTrash2 } from 'react-icons/fi';
import { NodeProps } from 'reactflow';

interface TalentPoolManagementNodeData {
  action: 'add' | 'update' | 'search';
  tags: string[];
  searchQuery?: string;
}

const TalentPoolManagementNode: React.FC<NodeProps<TalentPoolManagementNodeData>> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const [action, setAction] = useState(data.action || 'add');
  const [tags, setTags] = useState(data.tags || []);
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="card w-96 bg-base-100 shadow-xl border-2 border-lime-500">
      <Handle type="target" position={Position.Left} id="input" className="w-4 h-4 !bg-lime-500" />
      <div className="card-body p-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="bg-lime-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
                <FiDatabase className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title text-lg font-bold">Talent Pool</h2>
              <p className="text-sm text-gray-500">Manage candidate database</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">
              Adds, updates, or searches for candidates in your central talent pool.
            </p>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Action</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={action}
                onChange={(e) => setAction(e.target.value as any)}
              >
                <option value="add">Add or Update Candidate</option>
                <option value="search">Search for Candidates</option>
              </select>
            </div>

            {action === 'add' && (
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Tags to Apply</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <div key={tag} className="badge badge-lg badge-primary gap-2">
                      <button onClick={() => removeTag(tag)}>
                        <FiTrash2 size={12} />
                      </button>
                      {tag}
                    </div>
                  ))}
                </div>
                <div className="join">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="e.g., 'frontend-dev'"
                    className="input input-bordered join-item w-full"
                  />
                  <button onClick={addTag} className="btn join-item btn-primary">
                    <FiPlus />
                  </button>
                </div>
              </div>
            )}

            {action === 'search' && (
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Search Query</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-20"
                  placeholder="e.g., (javascript OR python) AND (react OR vue) AND NOT angular"
                ></textarea>
              </div>
            )}

            <div className="alert alert-lime text-xs mt-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span>
                For 'Add', output is the candidate record. For 'Search', output is an array of
                matching candidates.
              </span>
            </div>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="w-4 h-4 !bg-lime-500"
      />
    </div>
  );
};

export default memo(TalentPoolManagementNode);
