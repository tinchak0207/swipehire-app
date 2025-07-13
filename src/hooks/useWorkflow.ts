import useSWR from 'swr';
import type { IWorkflow } from '../contracts/IWorkflow';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useWorkflow(id: string) {
  const { data, error, mutate } = useSWR<IWorkflow>(`/api/workflows/${id}`, fetcher);

  const updateWorkflow = async (updatedWorkflow: Partial<IWorkflow>) => {
    if (!data) return;

    // Optimistic UI update
    mutate({ ...data, ...updatedWorkflow }, false);

    // Persist changes to the backend
    await fetch(`/api/workflows/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedWorkflow),
    });

    // Revalidate to get the latest state from the server
    mutate();
  };

  return {
    workflow: data,
    isLoading: !error && !data,
    isError: error,
    updateWorkflow,
  };
}
