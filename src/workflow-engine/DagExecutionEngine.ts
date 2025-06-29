import { Node } from 'reactflow';
import { ResumeAnalysisService } from '@/ai-services/ResumeAnalysisService';
import {
  IAnalyzeResumeConfig,
  IConditionConfig,
  ISendInviteConfig,
  IWorkflow,
  WorkflowNode,
} from '@/contracts/IWorkflow';

export class DagExecutionEngine {
  private workflow: IWorkflow;
  private variables: Map<string, any>;
  private adj: Map<string, WorkflowNode[]>;
  private skippedNodes: Set<string>;

  constructor(workflow: IWorkflow) {
    this.workflow = workflow;
    this.variables = new Map();
    this.adj = new Map();
    this.skippedNodes = new Set();
    this.buildAdjList();
  }

  private buildAdjList() {
    for (const node of this.workflow.nodes) {
      this.adj.set(node.id, []);
    }

    for (const edge of this.workflow.edges) {
      const sourceNeighbors = this.adj.get(edge.source);
      const targetNode = this.workflow.nodes.find((n) => n.id === edge.target);
      if (sourceNeighbors && targetNode) {
        sourceNeighbors.push(targetNode);
      }
    }
  }

  public async execute() {
    const sortedNodes = this.topologicalSort(this.workflow.nodes);
    for (const node of sortedNodes) {
      if (this.skippedNodes.has(node.id)) {
        console.log(`Skipping node ${node.id} due to failed condition.`);
        continue;
      }
      await this.processNode(node);
    }
  }

  private async processNode(node: WorkflowNode) {
    const { cardType } = node.data;

    switch (cardType) {
      case 'AnalyzeResume':
        await this.handleAnalyzeResume(node as Node<IAnalyzeResumeConfig>);
        break;
      case 'Condition':
        await this.handleCondition(node as Node<IConditionConfig>);
        break;
      case 'SendInvite':
        await this.handleSendInvite(node as Node<ISendInviteConfig>);
        break;
      default:
        console.warn(`Unknown card type: ${cardType}`);
    }
  }

  private async handleAnalyzeResume(node: Node<IAnalyzeResumeConfig>) {
    console.log(`Analyzing resume for node ${node.id}`);
    const resumeAnalysisService = new ResumeAnalysisService();
    const result = await resumeAnalysisService.analyzeResume(this.variables.get('resume_path'));
    this.variables.set(`${node.id}.match_score`, result.match_score);
    console.log('Resume analysis result:', result);
  }

  private async handleCondition(node: Node<IConditionConfig>) {
    console.log(`Evaluating condition for node ${node.id}`);
    const { variable, operator, value } = node.data;
    const variableName = variable.replace(/[{}]/g, '');
    const actualValue = this.variables.get(variableName);

    if (actualValue === undefined) {
      console.warn(`Variable ${variableName} not found`);
      return;
    }

    let result = false;
    switch (operator) {
      case 'eq':
        result = actualValue == value;
        break;
      case 'neq':
        result = actualValue != value;
        break;
      case 'gt':
        result = actualValue > value;
        break;
      case 'lt':
        result = actualValue < value;
        break;
      case 'gte':
        result = actualValue >= value;
        break;
      case 'lte':
        result = actualValue <= value;
        break;
    }

    console.log(`Condition result for node ${node.id}: ${result}`);
    this.variables.set(`${node.id}.result`, result);

    if (!result) {
      this.skipSubsequentNodes(node);
    }
  }

  private skipSubsequentNodes(node: WorkflowNode) {
    const neighbors = this.adj.get(node.id) || [];
    for (const neighbor of neighbors) {
      this.skippedNodes.add(neighbor.id);
      this.skipSubsequentNodes(neighbor);
    }
  }

  private async handleSendInvite(node: Node<ISendInviteConfig>) {
    console.log(`Sending invite for node ${node.id}`);
    const { template } = node.data;
    const resolvedTemplate = template.replace(/{\w+\.\w+}/g, (match) => {
      const variableName = match.replace(/[{}]/g, '');
      return this.variables.get(variableName) || match;
    });
    console.log(`Rendered template: ${resolvedTemplate}`);

    // Assume an EmailService is available
    // const emailService = new EmailService();
    // await emailService.sendEmail({
    //   to: this.variables.get('candidate_email'),
    //   subject: 'Invitation to Interview',
    //   body: resolvedTemplate,
    // });
  }

  private topologicalSort(nodes: WorkflowNode[]): WorkflowNode[] {
    const inDegree = new Map<string, number>();
    const adj = new Map<string, WorkflowNode[]>();

    for (const node of nodes) {
      inDegree.set(node.id, 0);
      adj.set(node.id, []);
    }

    for (const node of nodes) {
      for (const edge of this.workflow.edges) {
        if (edge.source === node.id) {
          adj.get(node.id)!.push(nodes.find((n) => n.id === edge.target)!);
          inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
        }
      }
    }

    const queue = nodes.filter((node) => inDegree.get(node.id) === 0);
    const result: WorkflowNode[] = [];

    while (queue.length > 0) {
      const node = queue.shift()!;
      result.push(node);

      for (const neighbor of adj.get(node.id)!) {
        inDegree.set(neighbor.id, inDegree.get(neighbor.id)! - 1);
        if (inDegree.get(neighbor.id) === 0) {
          queue.push(neighbor);
        }
      }
    }

    if (result.length !== nodes.length) {
      throw new Error('Cycle detected in graph');
    }

    return result;
  }
}
