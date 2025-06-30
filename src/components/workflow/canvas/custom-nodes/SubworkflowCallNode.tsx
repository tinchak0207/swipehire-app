

interface SubworkflowCallNodeData {
  workflowId: string;
}

const SubworkflowCallNode: React.FC<NodeProps<SubworkflowCallNodeData>> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const [workflowId, setWorkflowId] = useState(data.workflowId || '');

  return (
    <div className="card w-96 bg-base-100 shadow-xl border-2 border-teal-500">
      <Handle type="target" position={Position.Left} id="input" className="w-4 h-4 !bg-teal-500" />
      <div className="card-body p-4">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="bg-teal-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
                <FiShare2 className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title text-lg font-bold">Sub-Workflow</h2>
              <p className="text-sm text-gray-500">Execute another workflow</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">Executes another workflow as a subroutine. The current data payload is passed to the sub-workflow.</p>
            
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Workflow to Call</span>
              </label>
              <select 
                className="select select-bordered w-full"
                value={workflowId}
                onChange={(e) => setWorkflowId(e.target.value)}
              >
                <option disabled value="">Select a workflow</option>
                <option value="wf-001">Onboarding Workflow</option>
                <option value="wf-002">Background Check Process</option>
                <option value="wf-003">Candidate Nurturing Sequence</option>
              </select>
            </div>

            <div className="alert alert-teal text-xs mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>The output of this node will be the final data payload from the executed sub-workflow.</span>
            </div>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} id="output" className="w-4 h-4 !bg-teal-500" />
    </div>
  );
};

export default memo(SubworkflowCallNode);
