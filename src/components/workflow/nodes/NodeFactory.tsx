import { memo } from 'react';
import type { NodeProps } from 'reactflow';
import { WORKFLOW_NODE_DEFINITIONS } from '@/lib/workflow-node-definitions';
// Mapping of node types to their React components
import AICapabilityCallNode from '../canvas/custom-nodes/AICapabilityCallNode';

import AnalyzeResumeNode from '../canvas/custom-nodes/AnalyzeResumeNode';
import BackgroundCheckNode from '../canvas/custom-nodes/BackgroundCheckNode';
import CloudStorageIntegrationNode from '../canvas/custom-nodes/CloudStorageIntegrationNode';
import ConditionalBranchNode from '../canvas/custom-nodes/ConditionalBranchNode';
import ConditionNode from '../canvas/custom-nodes/ConditionNode';
import CustomFunctionNode from '../canvas/custom-nodes/CustomFunctionNode';
import DataCalculationNode from '../canvas/custom-nodes/DataCalculationNode';
import DataExportNode from '../canvas/custom-nodes/DataExportNode';
import DataFilterNode from '../canvas/custom-nodes/DataFilterNode';
import DataMetricReferenceNode from '../canvas/custom-nodes/DataMetricReferenceNode';
import DataMetricTriggerNode from '../canvas/custom-nodes/DataMetricTriggerNode';
import DataThresholdAlertNode from '../canvas/custom-nodes/DataThresholdAlertNode';
import DataVisualizationNode from '../canvas/custom-nodes/DataVisualizationNode';
import EnterpriseOAIntegrationNode from '../canvas/custom-nodes/EnterpriseOAIntegrationNode';
import ExternalAPINode from '../canvas/custom-nodes/ExternalAPINode';
import FeedbackCollectionNode from '../canvas/custom-nodes/FeedbackCollectionNode';
import InterviewInvitationNode from '../canvas/custom-nodes/InterviewInvitationNode';
import InvokeAINode from '../canvas/custom-nodes/InvokeAINode';
import JobPostingNode from '../canvas/custom-nodes/JobPostingNode';
import JobStatusChangeTriggerNode from '../canvas/custom-nodes/JobStatusChangeTriggerNode';
import LoopExecutionNode from '../canvas/custom-nodes/LoopExecutionNode';
import ManualTriggerNode from '../canvas/custom-nodes/ManualTriggerNode';
import NewCandidateNode from '../canvas/custom-nodes/NewCandidateNode';
import NewResumeSubmissionTriggerNode from '../canvas/custom-nodes/NewResumeSubmissionTriggerNode';
import NotificationDispatchNode from '../canvas/custom-nodes/NotificationDispatchNode';
import PriorityJudgmentNode from '../canvas/custom-nodes/PriorityJudgmentNode';
import ResumeAnalysisNode from '../canvas/custom-nodes/ResumeAnalysisNode';
import ResumeStatusUpdateNode from '../canvas/custom-nodes/ResumeStatusUpdateNode';
import SalaryInquiryNode from '../canvas/custom-nodes/SalaryInquiryNode';
import ScheduledTriggerNode from '../canvas/custom-nodes/ScheduledTriggerNode';
import SendCommunicationNode from '../canvas/custom-nodes/SendCommunicationNode';
import SocialMediaIntegrationNode from '../canvas/custom-nodes/SocialMediaIntegrationNode';
import SubworkflowCallNode from '../canvas/custom-nodes/SubworkflowCallNode';
import TalentPoolManagementNode from '../canvas/custom-nodes/TalentPoolManagementNode';
import TaskAllocationNode from '../canvas/custom-nodes/TaskAllocationNode';
import TemplateApplicationNode from '../canvas/custom-nodes/TemplateApplicationNode';
import VideoInterviewIntegrationNode from '../canvas/custom-nodes/VideoInterviewIntegrationNode';
import WorkflowLogNode from '../canvas/custom-nodes/WorkflowLogNode';

const nodeComponents: { [key: string]: React.FC<NodeProps> } = {
  newCandidate: NewCandidateNode,
  analyzeResume: AnalyzeResumeNode,
  jobPosting: JobPostingNode,
  sendCommunication: SendCommunicationNode,
  conditionalBranch: ConditionalBranchNode,
  externalAPI: ExternalAPINode,
  manualTrigger: ManualTriggerNode,
  dataCalculation: DataCalculationNode,
  aiCapabilityCall: AICapabilityCallNode,
  backgroundCheck: BackgroundCheckNode,
  cloudStorageIntegration: CloudStorageIntegrationNode,
  condition: ConditionNode,
  customFunction: CustomFunctionNode,
  dataExport: DataExportNode,
  dataFilter: DataFilterNode,
  dataMetricReference: DataMetricReferenceNode,
  dataVisualization: DataVisualizationNode,
  enterpriseOAIntegration: EnterpriseOAIntegrationNode,
  interviewInvitation: InterviewInvitationNode,
  invokeAI: InvokeAINode,
  jobStatusChangeTrigger: JobStatusChangeTriggerNode,
  loopExecution: LoopExecutionNode,
  newResumeSubmissionTrigger: NewResumeSubmissionTriggerNode,
  notificationDispatch: NotificationDispatchNode,
  priorityJudgment: PriorityJudgmentNode,
  resumeStatusUpdate: ResumeStatusUpdateNode,
  scheduledTrigger: ScheduledTriggerNode,
  socialMediaIntegration: SocialMediaIntegrationNode,
  subworkflowCall: SubworkflowCallNode,
  talentPoolManagement: TalentPoolManagementNode,
  taskAllocation: TaskAllocationNode,
  videoInterviewIntegration: VideoInterviewIntegrationNode,
  workflowLog: WorkflowLogNode,
  dataMetricTrigger: DataMetricTriggerNode,
  dataThresholdAlert: DataThresholdAlertNode,
  feedbackCollection: FeedbackCollectionNode,
  resumeAnalysis: ResumeAnalysisNode,
  salaryInquiry: SalaryInquiryNode,
  templateApplication: TemplateApplicationNode,
};

const NodeFactory = (props: NodeProps) => {
  const { type } = props;

  // Look for a specific component for this node type
  const NodeComponent = type ? nodeComponents[type] : null;

  if (NodeComponent) {
    return <NodeComponent {...props} />;
  }

  // Fallback for generic nodes or if a specific component is not found
  const definition = WORKFLOW_NODE_DEFINITIONS.find((d) => d.type === type);

  if (!definition) {
    return (
      <div className="card w-80 bg-error text-error-content shadow-xl">
        <div className="card-body p-4">
          <h2 className="card-title text-base">Unknown Node Type</h2>
          <p className="text-xs">
            No definition found for type: <strong>{type}</strong>
          </p>
        </div>
      </div>
    );
  }

  // If there's a definition but no specific component, you might want a generic renderer
  // This part is simplified, assuming specific components exist for all defined types.
  return (
    <div className="card w-80 bg-neutral text-neutral-content shadow-xl">
      <div className="card-body p-4">
        <h2 className="card-title text-base">{definition.label}</h2>
        <p className="text-xs">
          Generic renderer for: <strong>{type}</strong>
        </p>
      </div>
    </div>
  );
};

export default memo(NodeFactory);
