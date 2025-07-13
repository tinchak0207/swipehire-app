import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { Edge, Node } from 'reactflow';

export interface SaveWorkflowPayload {
  name: string;
  nodes: Node[];
  edges: Edge[];
  isTemplate: boolean;
  isPublic: boolean;
}

const saveWorkflow = async (payload: SaveWorkflowPayload) => {
  const response = await fetch('/api/workflows', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to save workflow');
  }

  return response.json();
};

export const useSaveWorkflow = (
  options?: UseMutationOptions<any, Error, SaveWorkflowPayload, unknown>
) => {
  return useMutation({
    mutationFn: saveWorkflow,
    ...options,
  });
};
