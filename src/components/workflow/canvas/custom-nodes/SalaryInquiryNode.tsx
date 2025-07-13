import type React from 'react';
import { memo } from 'react';
import { Handle, type NodeProps, Position } from 'reactflow';

const SalaryInquiryNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div className="card w-72 bg-neutral text-neutral-content shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Salary Inquiry</h2>
        <p>Inquires about salary data.</p>
        <div className="card-actions justify-end">
          <button className="btn btn-primary btn-sm" onClick={() => data.openModal(data)}>
            Open
          </button>
        </div>
      </div>
      <Handle type="target" position={Position.Left} className="h-4 w-4" />
      <Handle type="source" position={Position.Right} className="h-4 w-4" />
    </div>
  );
};

export default memo(SalaryInquiryNode);
