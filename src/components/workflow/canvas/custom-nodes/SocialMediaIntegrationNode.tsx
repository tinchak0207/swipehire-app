import { Handle, Position } from '@reactflow/core';
import type React from 'react';
import { memo, useState } from 'react';
import {
  FiChevronDown,
  FiChevronUp,
  FiFacebook,
  FiLinkedin,
  FiShare2,
  FiTwitter,
} from 'react-icons/fi';
import type { NodeProps } from 'reactflow';

interface SocialMediaIntegrationNodeData {
  platform: 'linkedin' | 'twitter' | 'facebook';
  action: 'post' | 'message';
  content: string;
  recipientProfile?: string;
}

const SocialMediaIntegrationNode: React.FC<NodeProps<SocialMediaIntegrationNodeData>> = ({
  data,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [platform, setPlatform] = useState(data.platform || 'linkedin');
  const [action, setAction] = useState(data.action || 'post');
  const [content, setContent] = useState(data.content || '');

  const platformIcons = {
    linkedin: <FiLinkedin className="h-6 w-6" />,
    twitter: <FiTwitter className="h-6 w-6" />,
    facebook: <FiFacebook className="h-6 w-6" />,
  };

  return (
    <div className="card w-96 border-2 border-blue-600 bg-base-100 shadow-xl">
      <Handle type="target" position={Position.Left} id="input" className="!bg-blue-600 h-4 w-4" />
      <div className="card-body p-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white">
                {platformIcons[platform] || <FiShare2 className="h-6 w-6" />}
              </div>
            </div>
            <div>
              <h2 className="card-title font-bold text-lg">Social Media</h2>
              <p className="text-gray-500 text-sm">Post or message on social platforms</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-gray-600 text-sm">
              Interact with social media platforms like LinkedIn, Twitter, or Facebook.
            </p>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Platform</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={platform}
                onChange={(e) => setPlatform(e.target.value as any)}
              >
                <option value="linkedin">LinkedIn</option>
                <option value="twitter">Twitter</option>
                <option value="facebook">Facebook</option>
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Action</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={action}
                onChange={(e) => setAction(e.target.value as any)}
              >
                <option value="post">Create a Post</option>
                <option value="message">Send a Direct Message</option>
              </select>
            </div>

            {action === 'message' && (
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Recipient Profile URL</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., https://linkedin.com/in/username"
                  className="input input-bordered w-full"
                />
              </div>
            )}

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Content</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                placeholder="e.g., We are hiring a new {{job.title}}! Check out the details here: {{job.url}}"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div className="alert alert-info mt-2 text-xs">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="h-6 w-6 shrink-0 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                The output will contain the URL of the post or a confirmation of the message sent.
              </span>
            </div>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!bg-blue-600 h-4 w-4"
      />
    </div>
  );
};

export default memo(SocialMediaIntegrationNode);
