
import React, { useState } from 'react';
import { Node } from 'reactflow';

interface AnalyzeResumeModalProps {
    node: Node;
    onSave: (nodeId: string, data: any) => void;
    onCancel: () => void;
}

const AnalyzeResumeModal: React.FC<AnalyzeResumeModalProps> = ({ node, onSave, onCancel }) => {
    const [skills, setSkills] = useState(node.data.skills || '');
    const [experience, setExperience] = React.useState(node.data.experience || 0);
    const [threshold, setThreshold] = React.useState(node.data.threshold || 80);

    const handleSave = () => {
        onSave(node.id, { skills, experience, threshold });
    };

  return (
    <dialog id="analyze_resume_modal" className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Analyze Resume Configuration</h3>
        <div className="form-control">
            <label className="label">
                <span className="label-text">Required Skills</span>
            </label>
            <input type="text" placeholder="e.g. React, TypeScript" className="input input-bordered" value={skills} onChange={(e) => setSkills(e.target.value)} />
        </div>
        <div className="form-control">
            <label className="label">
                <span className="label-text">Years of Experience</span>
            </label>
            <select className="select select-bordered" value={experience} onChange={(e) => setExperience(parseInt(e.target.value, 10))}>
                <option value="0">0-1 years</option>
                <option value="1">1-3 years</option>
                <option value="3">3-5 years</option>
                <option value="5">5+ years</option>
            </select>
        </div>
        <div className="form-control">
            <label className="label">
                <span className="label-text">Match Threshold</span>
            </label>
            <input type="range" min="0" max="100" value={threshold} className="range" step="1" onChange={(e) => setThreshold(parseInt(e.target.value, 10))} />
            <div className="w-full flex justify-between text-xs px-2">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
            </div>
        </div>
        <div className="modal-action">
          <button className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </dialog>
  );
};

export default AnalyzeResumeModal;
