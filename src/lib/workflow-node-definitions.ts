export interface NodeParameter {
  name: string;
  type: string;
  label: string;
  description?: string;
  options?: string[];
  defaultValue?: any;
}

export interface NodeVariable {
  name: string;
  label: string;
  description: string;
}

import { FC } from 'react';
import { NodeProps } from 'reactflow';

export interface NodeDefinition {
  type: string;
  label: string;
  description: string;
  category: 'trigger' | 'action' | 'decision' | 'data' | 'integration' | 'extension';
  inputs?: NodeParameter[];
  outputs?: NodeVariable[];
  icon?: string;
  component?: FC<NodeProps>;
}

import AICapabilityCallNode from '../components/workflow/canvas/custom-nodes/AICapabilityCallNode';
import BackgroundCheckNode from '../components/workflow/canvas/custom-nodes/BackgroundCheckNode';
import CloudStorageIntegrationNode from '../components/workflow/canvas/custom-nodes/CloudStorageIntegrationNode';
import ConditionalBranchNode from '../components/workflow/canvas/custom-nodes/ConditionalBranchNode';
import CustomFunctionNode from '../components/workflow/canvas/custom-nodes/CustomFunctionNode';
import DataCalculationNode from '../components/workflow/canvas/custom-nodes/DataCalculationNode';
import DataExportNode from '../components/workflow/canvas/custom-nodes/DataExportNode';
import DataFilterNode from '../components/workflow/canvas/custom-nodes/DataFilterNode';
import DataMetricReferenceNode from '../components/workflow/canvas/custom-nodes/DataMetricReferenceNode';
import DataMetricTriggerNode from '../components/workflow/canvas/custom-nodes/DataMetricTriggerNode';
import DataVisualizationNode from '../components/workflow/canvas/custom-nodes/DataVisualizationNode';
import EnterpriseOAIntegrationNode from '../components/workflow/canvas/custom-nodes/EnterpriseOAIntegrationNode';
import ExternalAPINode from '../components/workflow/canvas/custom-nodes/ExternalAPINode';
import FeedbackCollectionNode from '../components/workflow/canvas/custom-nodes/FeedbackCollectionNode';
import InterviewInvitationNode from '../components/workflow/canvas/custom-nodes/InterviewInvitationNode';
import JobPostingNode from '../components/workflow/canvas/custom-nodes/JobPostingNode';
import JobStatusChangeTriggerNode from '../components/workflow/canvas/custom-nodes/JobStatusChangeTriggerNode';
import LoopExecutionNode from '../components/workflow/canvas/custom-nodes/LoopExecutionNode';
import ManualTriggerNode from '../components/workflow/canvas/custom-nodes/ManualTriggerNode';
import NewResumeSubmissionTriggerNode from '../components/workflow/canvas/custom-nodes/NewResumeSubmissionTriggerNode';
import NotificationDispatchNode from '../components/workflow/canvas/custom-nodes/NotificationDispatchNode';
import PriorityJudgmentNode from '../components/workflow/canvas/custom-nodes/PriorityJudgmentNode';
import ResumeAnalysisNode from '../components/workflow/canvas/custom-nodes/ResumeAnalysisNode';
import ResumeStatusUpdateNode from '../components/workflow/canvas/custom-nodes/ResumeStatusUpdateNode';
import SalaryInquiryNode from '../components/workflow/canvas/custom-nodes/SalaryInquiryNode';
import ScheduledTriggerNode from '../components/workflow/canvas/custom-nodes/ScheduledTriggerNode';
import SocialMediaIntegrationNode from '../components/workflow/canvas/custom-nodes/SocialMediaIntegrationNode';
import SubworkflowCallNode from '../components/workflow/canvas/custom-nodes/SubworkflowCallNode';
import TalentPoolManagementNode from '../components/workflow/canvas/custom-nodes/TalentPoolManagementNode';
import TaskAllocationNode from '../components/workflow/canvas/custom-nodes/TaskAllocationNode';
import TemplateApplicationNode from '../components/workflow/canvas/custom-nodes/TemplateApplicationNode';
import VideoInterviewIntegrationNode from '../components/workflow/canvas/custom-nodes/VideoInterviewIntegrationNode';
import WorkflowLogNode from '../components/workflow/canvas/custom-nodes/WorkflowLogNode';

export const WORKFLOW_NODE_DEFINITIONS: NodeDefinition[] = [
  // Trigger Cards
  {
    type: 'newResumeSubmissionTrigger',
    label: 'New Resume Submission Trigger',
    description: 'Starts resume screening workflows, filterable by job position',
    category: 'trigger',
    component: NewResumeSubmissionTriggerNode,
    inputs: [
      {
        name: 'resumeFormat',
        type: 'select',
        label: 'Resume Format',
        options: ['PDF', 'Word', 'Video'],
      },
      {
        name: 'jobScope',
        type: 'select',
        label: 'Trigger Scope',
        options: ['All Jobs', 'Specific Job'],
      },
    ],
  },
  {
    type: 'jobStatusChangeTrigger',
    label: 'Job Status Change Trigger',
    description:
      'Monitors job status shifts to trigger linked processes (e.g., notifying candidates when a job is closed)',
    category: 'trigger',
    component: JobStatusChangeTriggerNode,
    inputs: [
      { name: 'status', type: 'select', label: 'Status', options: ['Posted', 'Paused', 'Closed'] },
    ],
  },
  {
    type: 'dataMetricTrigger',
    label: 'Data Metric Trigger',
    description:
      'Enables data-driven workflows (e.g., "If resume count drops 15% week-over-week, switch recruitment template")',
    category: 'trigger',
    component: DataMetricTriggerNode,
    inputs: [
      {
        name: 'metric',
        type: 'select',
        label: 'Metric',
        options: ['Company Reach', 'Resume Count', 'Match Score Average'],
      },
      {
        name: 'condition',
        type: 'select',
        label: 'Condition',
        options: ['Month-over-month decline', 'Below threshold', 'Goal achievement'],
      },
    ],
  },
  {
    type: 'scheduledTrigger',
    label: 'Scheduled Trigger',
    description:
      'Automates recurring tasks (e.g., generating weekly recruitment reports) with timezone support',
    category: 'trigger',
    component: ScheduledTriggerNode,
    inputs: [
      {
        name: 'interval',
        type: 'select',
        label: 'Interval',
        options: ['Daily', 'Weekly', 'Monthly', 'Custom'],
      },
      { name: 'time', type: 'time', label: 'Execution Time' },
    ],
  },
  {
    type: 'manualTrigger',
    label: 'Manual Trigger',
    description: 'Allows on-demand workflow activation for urgent recruitment needs',
    category: 'trigger',
    component: ManualTriggerNode,
    inputs: [
      {
        name: 'parameters',
        type: 'textarea',
        label: 'Parameters',
        description: 'Manual input or selection',
      },
    ],
  },
  // Action Cards
  {
    type: 'resumeAnalysis',
    label: 'Resume Analysis',
    description: 'Enables bulk resume screening with AI analysis',
    category: 'action',
    component: ResumeAnalysisNode,
    inputs: [
      {
        name: 'resumeType',
        type: 'select',
        label: 'Resume Type',
        options: ['Text', 'Video', 'Platform-stored'],
      },
      {
        name: 'criteria',
        type: 'tags',
        label: 'Filter Criteria',
        description: 'Education/experience/skills (multi-condition combinations)',
      },
      {
        name: 'aiOptions',
        type: 'select',
        label: 'AI Analysis',
        options: ['Basic keyword extraction', 'Video emotion analysis'],
      },
    ],
    outputs: [
      { name: 'match_score', label: 'Match Score', description: 'Candidate-fit score (0-100)' },
      { name: 'skills', label: 'Skills', description: 'Extracted skill keywords array' },
      {
        name: 'video_confidence',
        label: 'Video Confidence',
        description: 'Video tone confidence score',
      },
    ],
  },
  {
    type: 'interviewInvitation',
    label: 'Interview Invitation',
    description: 'Sends personalized interview invitations at scale',
    category: 'action',
    component: InterviewInvitationNode,
    inputs: [
      { name: 'candidates', type: 'select', label: 'Candidates', options: ['Single', 'Batch'] },
      {
        name: 'template',
        type: 'select',
        label: 'Template',
        options: ['Technical', 'Operational', 'Custom'],
      },
      {
        name: 'interviewInfo',
        type: 'textarea',
        label: 'Interview Information',
        description: 'Time/format/attachments (supports variable insertion)',
      },
    ],
  },
  {
    type: 'resumeStatusUpdate',
    label: 'Resume Status Update',
    description:
      'Triggers subsequent processes (e.g., rejection feedback) and updates dashboard statistics',
    category: 'action',
    component: ResumeStatusUpdateNode,
    inputs: [
      {
        name: 'status',
        type: 'select',
        label: 'Status',
        options: ['Shortlisted', 'Under Review', 'Rejected', 'Hired'],
      },
      { name: 'candidates', type: 'select', label: 'Candidates', options: ['Single', 'Batch'] },
      {
        name: 'notes',
        type: 'textarea',
        label: 'Notes',
        description: 'Text input with variable referencing',
      },
    ],
  },
  {
    type: 'jobPosting',
    label: 'Job Posting',
    description: 'Enables one-click multi-platform job distribution',
    category: 'action',
    component: JobPostingNode,
    inputs: [
      {
        name: 'jobInfo',
        type: 'textarea',
        label: 'Job Information',
        description: 'Title/responsibilities/requirements (template-loading supported)',
      },
      {
        name: 'platforms',
        type: 'multiselect',
        label: 'Platforms',
        options: ['Swipehire', 'LinkedIn', 'Company Website'],
      },
      { name: 'publishTime', type: 'datetime', label: 'Publish Time' },
    ],
    outputs: [
      {
        name: 'position_id',
        label: 'Position ID',
        description: 'The ID of the published position.',
      },
      {
        name: 'posting_time',
        label: 'Posting Time',
        description: 'The time the position was posted.',
      },
    ],
  },
  {
    type: 'dataExport',
    label: 'Data Export',
    description: 'Custom-named files (e.g., "2025 Jun Recruitment Report_{company_name}.pdf")',
    category: 'action',
    component: DataExportNode,
    inputs: [
      {
        name: 'dataScope',
        type: 'select',
        label: 'Data Scope',
        options: ['Resume data', 'Recruitment metrics', 'Workflow logs'],
      },
      { name: 'format', type: 'select', label: 'Export Format', options: ['Excel', 'PDF', 'CSV'] },
      {
        name: 'filter',
        type: 'textarea',
        label: 'Filter Criteria',
        description: 'Time range/job type/data status',
      },
    ],
  },
  {
    type: 'talentPoolManagement',
    label: 'Talent Pool Management',
    description: 'Builds enterprise-specific talent repositories',
    category: 'action',
    component: TalentPoolManagementNode,
    inputs: [
      { name: 'operation', type: 'select', label: 'Operation', options: ['Add', 'Tag', 'Remove'] },
      {
        name: 'source',
        type: 'select',
        label: 'Candidate Source',
        options: ['Screening results', 'Historical resumes'],
      },
      {
        name: 'tags',
        type: 'tags',
        label: 'Tags',
        description: 'Customizable labels (e.g., "High Potential", "Reserve Talent")',
      },
    ],
  },
  {
    type: 'salaryInquiry',
    label: 'Salary Inquiry',
    description: 'Provides data-driven salary benchmarking for recruitment decisions',
    category: 'action',
    component: SalaryInquiryNode,
    inputs: [
      {
        name: 'dimensions',
        type: 'tags',
        label: 'Query Dimensions',
        description: 'Job role/location/experience level',
      },
      {
        name: 'dataSource',
        type: 'select',
        label: 'Data Source',
        options: ['Platform big data', 'Industry reports'],
      },
      {
        name: 'timeRange',
        type: 'select',
        label: 'Time Range',
        options: ['Past 1 year', '3 years'],
      },
    ],
    outputs: [
      { name: 'salary_range', label: 'Salary Range', description: 'The queried salary range.' },
      { name: 'market_avg', label: 'Market Average', description: 'The market average salary.' },
    ],
  },
  {
    type: 'feedbackCollection',
    label: 'Feedback Collection',
    description: 'Automatic keyword analysis and statistical reporting',
    category: 'action',
    component: FeedbackCollectionNode,
    inputs: [
      {
        name: 'target',
        type: 'select',
        label: 'Feedback Target',
        options: ['Candidates', 'Interviewers', 'HR'],
      },
      {
        name: 'format',
        type: 'select',
        label: 'Feedback Format',
        options: ['Surveys', 'Ratings', 'Text inputs'],
      },
      {
        name: 'timing',
        type: 'select',
        label: 'Trigger Time',
        options: ['Post-interview', 'Post-offer', 'Post-rejection'],
      },
    ],
  },
  {
    type: 'taskAllocation',
    label: 'Task Allocation',
    description: 'Automated notifications and overdue reminders',
    category: 'action',
    component: TaskAllocationNode,
    inputs: [
      {
        name: 'taskType',
        type: 'select',
        label: 'Task Type',
        options: ['Resume review', 'Interview scheduling', 'Background checks'],
      },
      {
        name: 'assignee',
        type: 'select',
        label: 'Assignee',
        options: ['HR team members', 'Interview panels'],
      },
      { name: 'priority', type: 'select', label: 'Priority', options: ['High', 'Medium', 'Low'] },
    ],
  },
  {
    type: 'templateApplication',
    label: 'Template Application',
    description: 'Enables rapid reuse of proven recruitment workflows',
    category: 'action',
    component: TemplateApplicationNode,
    inputs: [
      {
        name: 'templateType',
        type: 'select',
        label: 'Template Type',
        options: ['Official', 'Custom templates'],
      },
      {
        name: 'scope',
        type: 'select',
        label: 'Scope',
        options: ['Current workflow', 'Global application'],
      },
      {
        name: 'params',
        type: 'textarea',
        label: 'Parameters',
        description: 'Customizable template variables',
      },
    ],
  },
  {
    type: 'notificationDispatch',
    label: 'Notification Dispatch',
    description: 'Message-delivery',
    category: 'action',
    component: NotificationDispatchNode,
    inputs: [
      {
        name: 'channel',
        type: 'select',
        label: 'Channel',
        options: ['Email', 'SMS', 'In-platform messages'],
      },
      {
        name: 'recipient',
        type: 'select',
        label: 'Recipient',
        options: ['Candidates', 'Enterprise members'],
      },
      {
        name: 'content',
        type: 'textarea',
        label: 'Content',
        description: 'Text/HTML (variable insertion supported)',
      },
    ],
  },
  {
    type: 'workflowLog',
    label: 'Workflow Log',
    description: 'Provides data traceability for process optimization',
    category: 'action',
    component: WorkflowLogNode,
    inputs: [
      {
        name: 'logType',
        type: 'select',
        label: 'Log Type',
        options: ['Workflow nodes', 'Operation logs', 'Exception records'],
      },
      {
        name: 'logMode',
        type: 'select',
        label: 'Log Mode',
        options: ['Automatic', 'Manual tagging'],
      },
      {
        name: 'archivePeriod',
        type: 'select',
        label: 'Archive Period',
        options: ['Daily', 'Weekly', 'Monthly archiving'],
      },
    ],
  },
  // Decision Cards
  {
    type: 'conditionalBranch',
    label: 'Conditional Branch',
    description: 'Logic-judgment',
    category: 'decision',
    component: ConditionalBranchNode,
    inputs: [
      {
        name: 'conditions',
        type: 'textarea',
        label: 'Conditions',
        description:
          'IF {match_score} > 80 AND {degree} = "Master" THEN execute "Send Interview Invitation" ELSE execute "Add to Talent Pool"',
      },
    ],
  },
  {
    type: 'loopExecution',
    label: 'Loop Execution',
    description: 'Process-control',
    category: 'decision',
    component: LoopExecutionNode,
    inputs: [
      {
        name: 'loopCondition',
        type: 'textarea',
        label: 'Loop Condition',
        description: 'Unmet screening quota/insufficient candidates',
      },
      {
        name: 'loopCount',
        type: 'number',
        label: 'Loop Count',
        description: 'Fixed cycles/until condition met',
      },
      {
        name: 'interval',
        type: 'number',
        label: 'Interval (seconds)',
        description: 'Time gaps between iterations',
      },
    ],
  },
  {
    type: 'priorityJudgment',
    label: 'Priority Judgment',
    description: 'Decision-support',
    category: 'decision',
    component: PriorityJudgmentNode,
    inputs: [
      {
        name: 'dimensions',
        type: 'multiselect',
        label: 'Priority Dimensions',
        options: ['Match score', 'Urgency', 'Job importance'],
      },
      {
        name: 'sortOrder',
        type: 'select',
        label: 'Sort Order',
        options: ['Ascending', 'Descending', 'Custom weights'],
      },
      { name: 'threshold', type: 'number', label: 'High-priority trigger conditions' },
    ],
  },
  // Data Cards
  {
    type: 'dataMetricReference',
    label: 'Data Metric Reference',
    description: 'Variable-provider',
    category: 'data',
    component: DataMetricReferenceNode,
    inputs: [
      {
        name: 'metric',
        type: 'select',
        label: 'Metric',
        options: [
          'Recruitment efficiency: Company reach/resume count/interview conversion',
          'Workflow metrics: Execution frequency/average processing time',
          'Talent quality: Average match score/skill coverage rate',
        ],
      },
    ],
    outputs: [
      {
        name: 'metric_value',
        label: 'Metric Value',
        description: 'The value of the selected metric.',
      },
    ],
  },
  {
    type: 'dataVisualization',
    label: 'Data Visualization',
    description: 'Chart-generator',
    category: 'data',
    component: DataVisualizationNode,
    inputs: [
      {
        name: 'dimension',
        type: 'select',
        label: 'Dimension',
        options: ['Time series', 'Comparative analysis', 'Trend forecasting'],
      },
      { name: 'chartType', type: 'select', label: 'Chart Type', options: ['Bar', 'Line', 'Pie'] },
      {
        name: 'range',
        type: 'select',
        label: 'Range',
        options: ['Daily', 'Weekly', 'Monthly', 'Custom'],
      },
    ],
  },
  {
    type: 'dataCalculation',
    label: 'Data Calculation',
    description: 'Logic-calculation',
    category: 'data',
    component: DataCalculationNode,
    inputs: [
      {
        name: 'operation',
        type: 'select',
        label: 'Operation',
        options: [
          'Basic: +-*/rounding/percentages',
          'Statistical: Average/max/min',
          'Custom formulas: Simple function support',
        ],
      },
      {
        name: 'formula',
        type: 'textarea',
        label: 'Formula',
        description: '{offer_rate} = {hired_count} / {interview_count} * 100',
      },
    ],
    outputs: [
      {
        name: 'result',
        label: 'Calculation Result',
        description: 'The result of the calculation.',
      },
    ],
  },
  {
    type: 'dataFilter',
    label: 'Data Filter',
    description: 'Provides precise data subsets for subsequent analysis',
    category: 'data',
    component: DataFilterNode,
    inputs: [
      {
        name: 'source',
        type: 'select',
        label: 'Data Source',
        options: ['Resume library', 'Recruitment records', 'Workflow logs'],
      },
      {
        name: 'filter',
        type: 'textarea',
        label: 'Filter Criteria',
        description: 'Time/job status/custom labels',
      },
    ],
    outputs: [
      {
        name: 'filtered_data',
        label: 'Filtered Data',
        description: 'Structured data/variable arrays',
      },
    ],
  },
  // Integration Cards
  {
    type: 'aiCapabilityCall',
    label: 'AI Capability Call',
    description: 'Intelligent-service',
    category: 'integration',
    component: AICapabilityCallNode,
    inputs: [
      {
        name: 'model',
        type: 'select',
        label: 'Model',
        options: [
          'Mistral NLP: Resume keyword extraction/match scoring',
          'Speech recognition: Video resume transcription',
          'Emotion analysis: Interview tone assessment',
        ],
      },
      {
        name: 'input',
        type: 'textarea',
        label: 'Input',
        description: 'Text content/audio files/resume IDs with model configuration',
      },
    ],
    outputs: [
      { name: 'ai_keywords', label: 'AI Keywords', description: 'Keywords extracted by the AI.' },
      { name: 'ai_score', label: 'AI Score', description: 'Score from the AI evaluation.' },
    ],
  },
  {
    type: 'videoInterviewIntegration',
    label: 'Video Interview Integration',
    description: 'Tool-docking',
    category: 'integration',
    component: VideoInterviewIntegrationNode,
    inputs: [
      {
        name: 'platform',
        type: 'select',
        label: 'Platform',
        options: ['Zoom', 'Teams', 'Enterprise video systems'],
      },
      {
        name: 'details',
        type: 'textarea',
        label: 'Interview Details',
        description: 'Interview scheduling (time/participants) with integration parameters',
      },
    ],
  },
  {
    type: 'backgroundCheck',
    label: 'Background Check',
    description: 'Third-party-service',
    category: 'integration',
    component: BackgroundCheckNode,
    inputs: [
      {
        name: 'service',
        type: 'select',
        label: 'Service',
        options: ['Background check API', 'Credit reporting systems'],
      },
      {
        name: 'candidateInfo',
        type: 'textarea',
        label: 'Candidate Information',
        description: 'Candidate information (name/ID/past employers) with check scope',
      },
    ],
    outputs: [
      {
        name: 'report_summary',
        label: 'Report Summary',
        description: 'Background report summaries and risk tags',
      },
    ],
  },
  {
    type: 'enterpriseOAIntegration',
    label: 'Enterprise OA Integration',
    description: 'System-docking',
    category: 'integration',
    component: EnterpriseOAIntegrationNode,
    inputs: [
      {
        name: 'system',
        type: 'select',
        label: 'System',
        options: ['HRMS', 'ERP', 'Internal approval systems'],
      },
      {
        name: 'data',
        type: 'textarea',
        label: 'Data to Sync',
        description: 'Syncs hiring info to OA and retrieves internal job quota data',
      },
    ],
  },
  {
    type: 'socialMediaIntegration',
    label: 'Social Media Integration',
    description: 'Channel-extension',
    category: 'integration',
    component: SocialMediaIntegrationNode,
    inputs: [
      {
        name: 'platform',
        type: 'select',
        label: 'Platform',
        options: ['LinkedIn', 'Weibo', 'WeChat Official Account'],
      },
      {
        name: 'action',
        type: 'select',
        label: 'Action',
        options: [
          'Job posting synchronization',
          'Candidate social profile scraping',
          'Employer branding',
        ],
      },
    ],
  },
  {
    type: 'cloudStorageIntegration',
    label: 'Cloud Storage Integration',
    description: 'File-management',
    category: 'integration',
    component: CloudStorageIntegrationNode,
    inputs: [
      {
        name: 'service',
        type: 'select',
        label: 'Service',
        options: ['Alibaba Cloud', 'Tencent Cloud', 'Enterprise private clouds'],
      },
      {
        name: 'action',
        type: 'select',
        label: 'Action',
        options: [
          'Automatic resume attachment archiving',
          'Batch report storage',
          'Permission control',
        ],
      },
    ],
  },
  // Extension Cards
  {
    type: 'customFunction',
    label: 'Custom Function',
    description: 'Implements enterprise-specific resume scoring algorithms',
    category: 'extension',
    component: CustomFunctionNode,
    inputs: [
      { name: 'language', type: 'select', label: 'Language', options: ['JavaScript', 'Python'] },
      {
        name: 'code',
        type: 'code',
        label: 'Code',
        description: 'Custom parameter input and variable output',
      },
    ],
  },
  {
    type: 'subworkflowCall',
    label: 'Subworkflow Call',
    description: 'Invokes common modules (e.g., background check subworkflows) and nested logic',
    category: 'extension',
    component: SubworkflowCallNode,
    inputs: [
      {
        name: 'workflowId',
        type: 'select',
        label: 'Workflow to Call',
        description: 'Parent-to-child parameter transmission and child-to-parent result returns',
      },
      {
        name: 'params',
        type: 'textarea',
        label: 'Parameters',
        description: 'Pass parameters to the sub-workflow.',
      },
    ],
  },
  {
    type: 'externalAPI',
    label: 'External API',
    description: 'Connects to proprietary systems or third-party services',
    category: 'extension',
    component: ExternalAPINode,
    inputs: [
      { name: 'url', type: 'string', label: 'API URL' },
      {
        name: 'method',
        type: 'select',
        label: 'Request Method',
        options: ['GET', 'POST', 'PUT', 'DELETE'],
      },
      { name: 'auth', type: 'textarea', label: 'Authentication' },
      { name: 'params', type: 'textarea', label: 'Request Parameters' },
      { name: 'responseParsing', type: 'textarea', label: 'Response Parsing Rules' },
    ],
  },
];
