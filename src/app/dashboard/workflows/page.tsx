'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import React, {
  type ChangeEvent,
  type DragEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import React, {
  type ChangeEvent,
  type DragEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  addEdge,
  type Edge,
  type Node,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  type ReactFlowInstance,
  type Edge,
  type Node,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  type ReactFlowInstance,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import WorkflowCanvas from '@/components/WorkflowCanvas';
import AnalyzeResumeNode from '@/components/workflow/canvas/custom-nodes/AnalyzeResumeNode';
import BackgroundCheckNode from '@/components/workflow/canvas/custom-nodes/BackgroundCheckNode';
import CloudStorageIntegrationNode from '@/components/workflow/canvas/custom-nodes/CloudStorageIntegrationNode';
import BackgroundCheckNode from '@/components/workflow/canvas/custom-nodes/BackgroundCheckNode';
import CloudStorageIntegrationNode from '@/components/workflow/canvas/custom-nodes/CloudStorageIntegrationNode';
import ConditionNode from '@/components/workflow/canvas/custom-nodes/ConditionNode';
import CustomFunctionNode from '@/components/workflow/canvas/custom-nodes/CustomFunctionNode';
import DataCalculationNode from '@/components/workflow/canvas/custom-nodes/DataCalculationNode';
import DataExportNode from '@/components/workflow/canvas/custom-nodes/DataExportNode';
import DataFilterNode from '@/components/workflow/canvas/custom-nodes/DataFilterNode';
import DataMetricReferenceNode from '@/components/workflow/canvas/custom-nodes/DataMetricReferenceNode';
import DataMetricTriggerNode from '@/components/workflow/canvas/custom-nodes/DataMetricTriggerNode';
import CustomFunctionNode from '@/components/workflow/canvas/custom-nodes/CustomFunctionNode';
import DataCalculationNode from '@/components/workflow/canvas/custom-nodes/DataCalculationNode';
import DataExportNode from '@/components/workflow/canvas/custom-nodes/DataExportNode';
import DataFilterNode from '@/components/workflow/canvas/custom-nodes/DataFilterNode';
import DataMetricReferenceNode from '@/components/workflow/canvas/custom-nodes/DataMetricReferenceNode';
import DataMetricTriggerNode from '@/components/workflow/canvas/custom-nodes/DataMetricTriggerNode';
import DataThresholdAlertNode from '@/components/workflow/canvas/custom-nodes/DataThresholdAlertNode';
import DataVisualizationNode from '@/components/workflow/canvas/custom-nodes/DataVisualizationNode';
import EnterpriseOAIntegrationNode from '@/components/workflow/canvas/custom-nodes/EnterpriseOAIntegrationNode';
import ExternalAPINode from '@/components/workflow/canvas/custom-nodes/ExternalAPINode';
import FeedbackCollectionNode from '@/components/workflow/canvas/custom-nodes/FeedbackCollectionNode';
import InterviewInvitationNode from '@/components/workflow/canvas/custom-nodes/InterviewInvitationNode';
import DataVisualizationNode from '@/components/workflow/canvas/custom-nodes/DataVisualizationNode';
import EnterpriseOAIntegrationNode from '@/components/workflow/canvas/custom-nodes/EnterpriseOAIntegrationNode';
import ExternalAPINode from '@/components/workflow/canvas/custom-nodes/ExternalAPINode';
import FeedbackCollectionNode from '@/components/workflow/canvas/custom-nodes/FeedbackCollectionNode';
import InterviewInvitationNode from '@/components/workflow/canvas/custom-nodes/InterviewInvitationNode';
import InvokeAINode from '@/components/workflow/canvas/custom-nodes/InvokeAINode';
import JobPostingNode from '@/components/workflow/canvas/custom-nodes/JobPostingNode';
import JobStatusChangeTriggerNode from '@/components/workflow/canvas/custom-nodes/JobStatusChangeTriggerNode';
import LoopExecutionNode from '@/components/workflow/canvas/custom-nodes/LoopExecutionNode';
import ManualTriggerNode from '@/components/workflow/canvas/custom-nodes/ManualTriggerNode';
import JobPostingNode from '@/components/workflow/canvas/custom-nodes/JobPostingNode';
import JobStatusChangeTriggerNode from '@/components/workflow/canvas/custom-nodes/JobStatusChangeTriggerNode';
import LoopExecutionNode from '@/components/workflow/canvas/custom-nodes/LoopExecutionNode';
import ManualTriggerNode from '@/components/workflow/canvas/custom-nodes/ManualTriggerNode';
import NewCandidateNode from '@/components/workflow/canvas/custom-nodes/NewCandidateNode';
import NewResumeSubmissionTriggerNode from '@/components/workflow/canvas/custom-nodes/NewResumeSubmissionTriggerNode';
import PriorityJudgmentNode from '@/components/workflow/canvas/custom-nodes/PriorityJudgmentNode';
import ResumeStatusUpdateNode from '@/components/workflow/canvas/custom-nodes/ResumeStatusUpdateNode';
import SalaryInquiryNode from '@/components/workflow/canvas/custom-nodes/SalaryInquiryNode';
import ScheduledTriggerNode from '@/components/workflow/canvas/custom-nodes/ScheduledTriggerNode';
import NewResumeSubmissionTriggerNode from '@/components/workflow/canvas/custom-nodes/NewResumeSubmissionTriggerNode';
import PriorityJudgmentNode from '@/components/workflow/canvas/custom-nodes/PriorityJudgmentNode';
import ResumeStatusUpdateNode from '@/components/workflow/canvas/custom-nodes/ResumeStatusUpdateNode';
import SalaryInquiryNode from '@/components/workflow/canvas/custom-nodes/SalaryInquiryNode';
import ScheduledTriggerNode from '@/components/workflow/canvas/custom-nodes/ScheduledTriggerNode';
import SendCommunicationNode from '@/components/workflow/canvas/custom-nodes/SendCommunicationNode';
import SocialMediaIntegrationNode from '@/components/workflow/canvas/custom-nodes/SocialMediaIntegrationNode';
import SubworkflowCallNode from '@/components/workflow/canvas/custom-nodes/SubworkflowCallNode';
import TalentPoolManagementNode from '@/components/workflow/canvas/custom-nodes/TalentPoolManagementNode';
import TaskAllocationNode from '@/components/workflow/canvas/custom-nodes/TaskAllocationNode';
import TemplateApplicationNode from '@/components/workflow/canvas/custom-nodes/TemplateApplicationNode';
import VideoInterviewIntegrationNode from '@/components/workflow/canvas/custom-nodes/VideoInterviewIntegrationNode';
import WorkflowLogNode from '@/components/workflow/canvas/custom-nodes/WorkflowLogNode';
import SocialMediaIntegrationNode from '@/components/workflow/canvas/custom-nodes/SocialMediaIntegrationNode';
import SubworkflowCallNode from '@/components/workflow/canvas/custom-nodes/SubworkflowCallNode';
import TalentPoolManagementNode from '@/components/workflow/canvas/custom-nodes/TalentPoolManagementNode';
import TaskAllocationNode from '@/components/workflow/canvas/custom-nodes/TaskAllocationNode';
import TemplateApplicationNode from '@/components/workflow/canvas/custom-nodes/TemplateApplicationNode';
import VideoInterviewIntegrationNode from '@/components/workflow/canvas/custom-nodes/VideoInterviewIntegrationNode';
import WorkflowLogNode from '@/components/workflow/canvas/custom-nodes/WorkflowLogNode';
import AnalyzeResumeModal from '@/components/workflow/modals/AnalyzeResumeModal';
import InvokeAIModal from '@/components/workflow/modals/InvokeAIModal';
import RunWorkflowModal from '@/components/workflow/modals/RunWorkflowModal';
import SendCommunicationModal from '@/components/workflow/modals/SendCommunicationModal';
import { type SaveWorkflowPayload, useSaveWorkflow } from '@/hooks/useSaveWorkflow';
import { type SaveWorkflowPayload, useSaveWorkflow } from '@/hooks/useSaveWorkflow';

const queryClient = new QueryClient();

const nodeTypes = {
  newCandidate: NewCandidateNode,
  analyzeResume: AnalyzeResumeNode,
  condition: ConditionNode,
  sendCommunication: SendCommunicationNode,
  dataThresholdAlert: DataThresholdAlertNode,
  invokeAI: InvokeAINode,
  // Triggers
  newResumeSubmissionTrigger: NewResumeSubmissionTriggerNode,
  jobStatusChangeTrigger: JobStatusChangeTriggerNode,
  dataMetricTrigger: DataMetricTriggerNode,
  scheduledTrigger: ScheduledTriggerNode,
  manualTrigger: ManualTriggerNode,
  newResumeSubmissionTrigger: NewResumeSubmissionTriggerNode,
  jobStatusChangeTrigger: JobStatusChangeTriggerNode,
  dataMetricTrigger: DataMetricTriggerNode,
  scheduledTrigger: ScheduledTriggerNode,
  manualTrigger: ManualTriggerNode,
  // Actions
  interviewInvitation: InterviewInvitationNode,
  resumeStatusUpdate: ResumeStatusUpdateNode,
  jobPosting: JobPostingNode,
  dataExport: DataExportNode,
  talentPoolManagement: TalentPoolManagementNode,
  salaryInquiry: SalaryInquiryNode,
  feedbackCollection: FeedbackCollectionNode,
  taskAllocation: TaskAllocationNode,
  templateApplication: TemplateApplicationNode,
  workflowLog: WorkflowLogNode,
  interviewInvitation: InterviewInvitationNode,
  resumeStatusUpdate: ResumeStatusUpdateNode,
  jobPosting: JobPostingNode,
  dataExport: DataExportNode,
  talentPoolManagement: TalentPoolManagementNode,
  salaryInquiry: SalaryInquiryNode,
  feedbackCollection: FeedbackCollectionNode,
  taskAllocation: TaskAllocationNode,
  templateApplication: TemplateApplicationNode,
  workflowLog: WorkflowLogNode,
  // Decisions
  loopExecution: LoopExecutionNode,
  priorityJudgment: PriorityJudgmentNode,
  loopExecution: LoopExecutionNode,
  priorityJudgment: PriorityJudgmentNode,
  // Data
  dataMetricReference: DataMetricReferenceNode,
  dataVisualization: DataVisualizationNode,
  dataCalculation: DataCalculationNode,
  dataFilter: DataFilterNode,
  dataMetricReference: DataMetricReferenceNode,
  dataVisualization: DataVisualizationNode,
  dataCalculation: DataCalculationNode,
  dataFilter: DataFilterNode,
  // Integrations
  videoInterviewIntegration: VideoInterviewIntegrationNode,
  backgroundCheck: BackgroundCheckNode,
  enterpriseOaIntegration: EnterpriseOAIntegrationNode,
  socialMediaIntegration: SocialMediaIntegrationNode,
  cloudStorageIntegration: CloudStorageIntegrationNode,
  videoInterviewIntegration: VideoInterviewIntegrationNode,
  backgroundCheck: BackgroundCheckNode,
  enterpriseOaIntegration: EnterpriseOAIntegrationNode,
  socialMediaIntegration: SocialMediaIntegrationNode,
  cloudStorageIntegration: CloudStorageIntegrationNode,
  // Extensions
  customFunction: CustomFunctionNode,
  subworkflowCall: SubworkflowCallNode,
  externalApi: ExternalAPINode,
  customFunction: CustomFunctionNode,
  subworkflowCall: SubworkflowCallNode,
  externalApi: ExternalAPINode,
};

let id = 2;
const getId = () => `${id++}`;

const WorkflowDashboardPage = () => {
  const searchParams = useSearchParams();
  const workflowId = searchParams ? searchParams.get('id') : null;
  const templateId = searchParams ? searchParams.get('template') : null;
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowName, setWorkflowName] = useState('My Workflow');
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);

  const saveWorkflowMutation = useSaveWorkflow();

  useEffect(() => {
    const workflowToLoad = workflowId || templateId;
    if (workflowToLoad) {
      fetch(`/api/workflows/${workflowToLoad}`)
        .then((res) => res.json())
        .then((data) => {
          setWorkflowName(templateId ? `${data.name} (Copy)` : data.name);
          setNodes(data.definition.nodes || []);
          setEdges(data.definition.edges || []);
        });
    }
  }, [workflowId, templateId, setNodes, setEdges]);

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type || !reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node`, openModal: (node: Node) => setSelectedNode(node) },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onSaveModal = (nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          node.data = { ...node.data, ...data };
        }
        return node;
      })
    );
    setSelectedNode(null);
  };

  const onSaveWorkflow = (isTemplate = false, isPublic = false) => {
    const payload: SaveWorkflowPayload = { name: workflowName, nodes, edges, isTemplate, isPublic };
    saveWorkflowMutation.mutate(payload);
  };

  const onRunWorkflow = async (payload: any) => {
    await fetch(`/api/workflows/${workflowId}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    setIsRunModalOpen(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="drawer lg:drawer-open">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div
          className="drawer-content flex flex-col items-center justify-center"
          ref={reactFlowWrapper}
        >
          <div className="flex w-full items-center gap-4 bg-base-200 p-4">
            <input
              type="text"
              placeholder="Workflow Name"
              className="input input-bordered w-full max-w-xs"
              value={workflowName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setWorkflowName(e.target.value)}
            />
            <button
              className="btn btn-primary"
              onClick={() => onSaveWorkflow()}
              disabled={saveWorkflowMutation.isPending}
            >
              {saveWorkflowMutation.isPending ? 'Saving...' : 'Save'}
            </button>
            <div className="dropdown dropdown-end">
              <label className="btn btn-secondary">Save as Template</label>
              <ul className="dropdown-content menu w-52 rounded-box bg-base-100 p-2 shadow">
                <li>
                  <a onClick={() => onSaveWorkflow(true, false)}>Save as Private Template</a>
                </li>
                <li>
                  <a onClick={() => onSaveWorkflow(true, true)}>Save as Public Template</a>
                </li>
              </ul>
            </div>
            <button
              className="btn btn-accent"
              onClick={() => setIsRunModalOpen(true)}
              disabled={!workflowId}
            >
              Run
            </button>
          </div>
          <div className="w-full flex-grow bg-base-300" onDrop={onDrop} onDragOver={onDragOver}>
            <WorkflowCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange as OnNodesChange}
              onEdgesChange={onEdgesChange as OnEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              onInit={setReactFlowInstance}
            />
          </div>
        </div>
        <div className="drawer-side">
          <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay" />
          <ul className="menu min-h-full w-80 bg-base-200 p-4 text-base-content">
            {/* Trigger Cards */}
            <li className="menu-title">
              <span>Trigger Cards</span>
            </li>
            <li
              onDragStart={(event: DragEvent) => onDragStart(event, 'newResumeSubmissionTrigger')}
              draggable
            >
              <a>New Resume Submission</a>
            </li>
            <li
              onDragStart={(event: DragEvent) => onDragStart(event, 'jobStatusChangeTrigger')}
              draggable
            >
              <a>Job Status Change</a>
            </li>
            <li
              onDragStart={(event: DragEvent) => onDragStart(event, 'dataMetricTrigger')}
              draggable
            >
              <a>Data Metric Trigger</a>
            </li>
            <li
              onDragStart={(event: DragEvent) => onDragStart(event, 'scheduledTrigger')}
              draggable
            >
              <a>Scheduled Trigger</a>
            </li>
            <li onDragStart={(event: DragEvent) => onDragStart(event, 'manualTrigger')} draggable>
              <a>Manual Trigger</a>
            </li>

            {/* Action Cards */}
            <li className="menu-title">
              <span>Action Cards</span>
            </li>
            <li onDragStart={(event: DragEvent) => onDragStart(event, 'analyzeResume')} draggable>
              <a>Resume Analysis</a>
            </li>
            <li
              onDragStart={(event: DragEvent) => onDragStart(event, 'interviewInvitation')}
              draggable
            >
              <a>Interview Invitation</a>
            </li>
            <li
              onDragStart={(event: DragEvent) => onDragStart(event, 'resumeStatusUpdate')}
              draggable
            >
              <a>Resume Status Update</a>
            </li>
            <li onDragStart={(event: DragEvent) => onDragStart(event, 'jobPosting')} draggable>
              <a>Job Posting</a>
            </li>
            <li onDragStart={(event: DragEvent) => onDragStart(event, 'dataExport')} draggable>
              <a>Data Export</a>
            </li>
            <li
              onDragStart={(event: DragEvent) => onDragStart(event, 'talentPoolManagement')}
              draggable
            >
              <a>Talent Pool Management</a>
            </li>
            <li onDragStart={(event: DragEvent) => onDragStart(event, 'salaryInquiry')} draggable>
              <a>Salary Inquiry</a>
            </li>
            <li
              onDragStart={(event: DragEvent) => onDragStart(event, 'feedbackCollection')}
              draggable
            >
              <a>Feedback Collection</a>
            </li>
            <li onDragStart={(event: DragEvent) => onDragStart(event, 'taskAllocation')} draggable>
              <a>Task Allocation</a>
            </li>
            <li
              onDragStart={(event: DragEvent) => onDragStart(event, 'templateApplication')}
              draggable
            >
              <a>Template Application</a>
            </li>
            <li
              onDragStart={(event: DragEvent) => onDragStart(event, 'sendCommunication')}
              draggable
            >
              <a>Notification Dispatch</a>
            </li>
            <li onDragStart={(event: DragEvent) => onDragStart(event, 'workflowLog')} draggable>
              <a>Workflow Log</a>
            </li>

            {/* Decision Cards */}
            <li className="menu-title">
              <span>Decision Cards</span>
            </li>
            <li onDragStart={(event: DragEvent) => onDragStart(event, 'condition')} draggable>
              <a>Conditional Branch</a>
            </li>
            <li onDragStart={(event: DragEvent) => onDragStart(event, 'loopExecution')} draggable>
              <a>Loop Execution</a>
            </li>
            <li
              onDragStart={(event: DragEvent) => onDragStart(event, 'priorityJudgment')}
              draggable
            >
              <a>Priority Judgment</a>
            </li>

            {/* Data Cards */}
            <li className="menu-title">
              <span>Data Cards</span>
            </li>
            <li
              onDragStart={(event: DragEvent) => onDragStart(event, 'dataMetricReference')}
              draggable
            >
              <a>Data Metric Reference</a>
            </li>
            <li
              onDragStart={(event: DragEvent) => onDragStart(event, 'dataVisualization')}
              draggable
            >
              <a>Data Visualization</a>
            </li>
            <li onDragStart={(event: DragEvent) => onDragStart(event, 'dataCalculation')} draggable>
              <a>Data Calculation</a>
            </li>
            <li onDragStart={(event: DragEvent) => onDragStart(event, 'dataFilter')} draggable>
              <a>Data Filter</a>
            </li>

            {/* Integration Cards */}
            <li className="menu-title">
              <span>Integration Cards</span>
            </li>
            <li onDragStart={(event: DragEvent) => onDragStart(event, 'invokeAI')} draggable>
              <a>AI Capability Call</a>
            </li>
            <li
              onDragStart={(event: DragEvent) => onDragStart(event, 'videoInterviewIntegration')}
              draggable
            >
              <a>Video Interview Integration</a>
            </li>
            <li onDragStart={(event: DragEvent) => onDragStart(event, 'backgroundCheck')} draggable>
              <a>Background Check</a>
            </li>
            <li
              onDragStart={(event: DragEvent) => onDragStart(event, 'enterpriseOaIntegration')}
              draggable
            >
              <a>Enterprise OA Integration</a>
            </li>
            <li
              onDragStart={(event: DragEvent) => onDragStart(event, 'socialMediaIntegration')}
              draggable
            >
              <a>Social Media Integration</a>
            </li>
            <li
              onDragStart={(event: DragEvent) => onDragStart(event, 'cloudStorageIntegration')}
              draggable
            >
              <a>Cloud Storage Integration</a>
            </li>

            {/* Extension Cards */}
            <li className="menu-title">
              <span>Extension Cards</span>
            </li>
            <li onDragStart={(event: DragEvent) => onDragStart(event, 'customFunction')} draggable>
              <a>Custom Function</a>
            </li>
            <li onDragStart={(event: DragEvent) => onDragStart(event, 'subworkflowCall')} draggable>
              <a>Subworkflow Call</a>
            </li>
            <li onDragStart={(event: DragEvent) => onDragStart(event, 'externalApi')} draggable>
              <a>External API</a>
            </li>
          </ul>
        </div>
        {selectedNode && selectedNode.type === 'analyzeResume' && (
          <AnalyzeResumeModal
            node={selectedNode}
            onSave={onSaveModal}
            onCancel={() => setSelectedNode(null)}
          />
        )}
        {selectedNode && selectedNode.type === 'sendCommunication' && (
          <SendCommunicationModal
            node={selectedNode}
            onSave={onSaveModal}
            onCancel={() => setSelectedNode(null)}
          />
        )}
        {selectedNode && selectedNode.type === 'invokeAI' && (
          <InvokeAIModal
            node={selectedNode}
            onSave={onSaveModal}
            onCancel={() => setSelectedNode(null)}
          />
        )}
        {isRunModalOpen && (
          <RunWorkflowModal onRun={onRunWorkflow} onCancel={() => setIsRunModalOpen(false)} />
        )}
      </div>
    </QueryClientProvider>
  );
};

const WorkflowDashboardPageWrapper = () => (
  <React.Suspense fallback={<div>Loading...</div>}>
    <WorkflowDashboardPage />
  </React.Suspense>
);

export default WorkflowDashboardPageWrapper;
