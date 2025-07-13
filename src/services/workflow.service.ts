import type { Edge, Node as WorkflowNode } from 'reactflow';
import type { IWorkflow } from '../contracts/IWorkflow';

// This is a placeholder for the workflow execution engine.
// A real implementation would use a more robust graph traversal algorithm.

class WorkflowService {
  async run(workflow: IWorkflow): Promise<void> {
    console.log(`Running workflow: ${workflow.name}`);

    const nodes = new Map(workflow.nodes.map((node) => [node.id, node]));
    const edges = workflow.edges;

    // Find the trigger node (a node with no incoming edges)
    const triggerNode = this.findTriggerNode(workflow.nodes, edges);

    if (!triggerNode) {
      console.error('No trigger node found in the workflow.');
      return;
    }

    await this.executeNode(triggerNode, nodes, edges);
  }

  private async executeNode(
    node: WorkflowNode,
    nodes: Map<string, WorkflowNode>,
    edges: Edge[]
  ): Promise<void> {
    console.log(`Executing node: ${node.data.cardType} (${node.id})`);

    // In a real implementation, you would execute the logic for each card type here.
    // For example, for an 'AnalyzeResume' card, you would call the ai.service.

    const downstreamEdges = edges.filter((edge) => edge.source === node.id);

    for (const edge of downstreamEdges) {
      const nextNode = nodes.get(edge.target);
      if (nextNode) {
        await this.executeNode(nextNode, nodes, edges);
      }
    }
  }

  private findTriggerNode(nodes: WorkflowNode[], edges: Edge[]): WorkflowNode | undefined {
    const targetNodeIds = new Set(edges.map((edge) => edge.target));
    return nodes.find((node) => !targetNodeIds.has(node.id));
  }
}

export const workflowService = new WorkflowService();
