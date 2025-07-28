import { Mistral } from '@mistralai/mistralai';
import { sql } from '@vercel/postgres';
import type { Edge, Node } from 'reactflow';
import { analyzeResume } from './resumeAnalyzer.js';

const apiKey = process.env['MISTRAL_API_KEY'];
if (!apiKey) {
  throw new Error('MISTRAL_API_KEY is not defined in the environment variables');
}
const client = new Mistral({ apiKey });

const executeNode = async (node: Node, payload: any, workflowId: string) => {
  switch (node.type) {
    case 'newCandidate':
      await sql`UPDATE workflows SET resume_count = resume_count + 1 WHERE id = ${workflowId}`;
      return payload;
    case 'analyzeResume':
      return analyzeResume(payload, node.data);
    case 'condition':
      // For simplicity, the condition is hardcoded for now
      // A real implementation would parse the condition string
      return payload.match_score > 80 ? 'true' : 'false';
    case 'sendCommunication':
      console.log('Sending communication:', node.data.message);
      return payload;
    case 'invokeAI': {
      const response = await client.chat.complete({
        model: 'mistral-large-latest',
        messages: [
          {
            role: 'user',
            content: node.data.prompt,
          },
        ],
      });
      if (!response?.choices?.[0]?.message?.content) {
        throw new Error('Invalid AI response format');
      }
      return { ...payload, ai_suggestion: response.choices[0].message.content };
    }
    default:
      return payload;
  }
};

interface Workflow {
  id: string;
  definition: {
    nodes: Node[];
    edges: Edge[];
  };
}

export const runWorkflow = async (workflow: Workflow, initialPayload: any) => {
  const { nodes, edges } = workflow.definition;
  let payload = initialPayload;

  const findStartNode = (): Node | undefined =>
    nodes.find((node: Node) => node.type === 'newCandidate');
  const findNextNode = (sourceNodeId: string, sourceHandle: string | null): Node | undefined => {
    const edge = edges.find(
      (edge: Edge) => edge.source === sourceNodeId && edge.sourceHandle === sourceHandle
    );
    return edge ? nodes.find((node: Node) => node.id === edge.target) : undefined;
  };

  let currentNode: Node | undefined = findStartNode();
  while (currentNode) {
    const result = await executeNode(currentNode, payload, workflow.id);
    if (currentNode.type === 'condition') {
      const nextNode: Node | undefined = findNextNode(currentNode.id, result);
      payload = { ...payload, ...result };
      currentNode = nextNode;
    } else {
      const nextNode: Node | undefined = findNextNode(currentNode.id, null);
      payload = { ...payload, ...result };
      currentNode = nextNode;
    }
  }

  console.log('Workflow finished');
};
