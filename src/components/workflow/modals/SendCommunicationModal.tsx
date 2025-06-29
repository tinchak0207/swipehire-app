import React, { useState } from 'react';
import { Node } from 'reactflow';

interface SendCommunicationModalProps {
  node: Node;
  onSave: (nodeId: string, data: any) => void;
  onCancel: () => void;
}

const SendCommunicationModal: React.FC<SendCommunicationModalProps> = ({
  node,
  onSave,
  onCancel,
}) => {
  const [message, setMessage] = useState(node.data.message || '');

  const handleSave = () => {
    onSave(node.id, { message });
  };

  return (
    <dialog id="send_communication_modal" className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Send Communication Configuration</h3>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Message</span>
          </label>
          <textarea
            className="textarea textarea-bordered h-24"
            placeholder="Hi {candidate_name}, ..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
        </div>
        <div className="modal-action">
          <button className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default SendCommunicationModal;
