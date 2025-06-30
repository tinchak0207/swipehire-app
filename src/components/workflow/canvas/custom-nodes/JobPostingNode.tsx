import React, { memo, useState } from 'react';
import { FiBriefcase, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { Handle, NodeProps, Position } from 'reactflow';

interface JobPostingNodeData {
  jobTitle: string;
  jobDescription: string;
  platforms: string[];
}

const availablePlatforms = ['LinkedIn', 'Indeed', 'Glassdoor', 'ZipRecruiter', 'Company Website'];

const JobPostingNode: React.FC<NodeProps<JobPostingNodeData>> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const [jobTitle, setJobTitle] = useState(data?.jobTitle || '');
  const [jobDescription, setJobDescription] = useState(data?.jobDescription || '');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    data?.platforms || ['LinkedIn']
  );

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
    // Update node data in workflow state
  };

  return (
    <div className="card w-96 bg-base-100 shadow-xl border-2 border-info-focus">
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="w-4 h-4 !bg-info-focus"
      />
      <div className="card-body p-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="bg-info text-info-content rounded-full w-12 h-12">
                <FiBriefcase className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title text-lg font-bold">Post Job</h2>
              <p className="text-sm text-gray-500">Distribute job opening</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">
              This node posts a job description to selected platforms. Job data can be passed from a
              previous node or entered manually.
            </p>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Job Title</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Senior Software Engineer"
                className="input input-bordered w-full"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Job Description</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                placeholder="Enter the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Publish to Platforms</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {availablePlatforms.map((platform) => (
                  <button
                    key={platform}
                    onClick={() => togglePlatform(platform)}
                    className={`btn btn-sm ${selectedPlatforms.includes(platform) ? 'btn-info' : 'btn-outline'}`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            <div className="alert alert-success text-xs mt-2">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                The output will contain the status of each job posting (e.g., success, failure,
                URL).
              </span>
            </div>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="w-4 h-4 !bg-info-focus"
      />
    </div>
  );
};

export default memo(JobPostingNode);
