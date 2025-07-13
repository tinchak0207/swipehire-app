import type React from 'react';
import { memo, useState } from 'react';
import { FiBriefcase, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { Handle, type NodeProps, Position } from 'reactflow';

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
    <div className="card w-96 border-2 border-info-focus bg-base-100 shadow-xl">
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="!bg-info-focus h-4 w-4"
      />
      <div className="card-body p-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="h-12 w-12 rounded-full bg-info text-info-content">
                <FiBriefcase className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title font-bold text-lg">Post Job</h2>
              <p className="text-gray-500 text-sm">Distribute job opening</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-gray-600 text-sm">
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
              />
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

            <div className="alert alert-success mt-2 text-xs">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 stroke-current"
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
        className="!bg-info-focus h-4 w-4"
      />
    </div>
  );
};

export default memo(JobPostingNode);
