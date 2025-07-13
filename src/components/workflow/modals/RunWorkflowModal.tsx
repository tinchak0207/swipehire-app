import type React from 'react';
import { useState } from 'react';

interface RunWorkflowModalProps {
  onRun: (payload: any) => void;
  onCancel: () => void;
}

const RunWorkflowModal: React.FC<RunWorkflowModalProps> = ({ onRun, onCancel }) => {
  const [payload, setPayload] = useState(
    '{ "candidate_name": "John Doe", "resume_text": "Experienced React developer..." }'
  );

  const handleRun = () => {
    try {
      const parsedPayload = JSON.parse(payload);
      onRun(parsedPayload);
    } catch (_error) {
      alert('Invalid JSON payload');
    }
  };

  return (
    <dialog id="run_workflow_modal" className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Run Workflow</h3>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Initial Payload (JSON)</span>
          </label>
          <textarea
            className="textarea textarea-bordered h-48"
            placeholder='{ "key": "value" }'
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
          />
        </div>
        <div className="modal-action">
          <button className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleRun}>
            Run
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default RunWorkflowModal;
