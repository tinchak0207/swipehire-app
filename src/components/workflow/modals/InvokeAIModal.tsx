
import React, { useState } from 'react';
import { Node } from 'reactflow';

interface InvokeAIModalProps {
    node: Node;
    onSave: (nodeId: string, data: any) => void;
    onCancel: () => void;
}

const InvokeAIModal: React.FC<InvokeAIModalProps> = ({ node, onSave, onCancel }) => {
    const [prompt, setPrompt] = useState(node.data.prompt || '');

    const handleSave = () => {
        onSave(node.id, { prompt });
    };

  return (
    <dialog id="invoke_ai_modal" className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Invoke AI Configuration</h3>
        <div className="form-control">
            <label className="label">
                <span className="label-text">Prompt</span>
            </label>
            <textarea className="textarea textarea-bordered h-24" placeholder="Generate three interview questions for a {position_name} role..." value={prompt} onChange={(e) => setPrompt(e.target.value)}></textarea>
        </div>
        <div className="modal-action">
          <button className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </dialog>
  );
};

export default InvokeAIModal;
