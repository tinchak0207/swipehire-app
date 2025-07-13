import type { IWorkflow } from './IWorkflow';

export interface ITemplate extends IWorkflow {
  // Templates are essentially workflows with additional metadata
  // and are marked as templates.
  // The IWorkflow interface already has an isTemplate field.
  // We can extend it with more template-specific fields if needed.
  // For now, we can just use the IWorkflow interface directly for templates.
  // This file is created for future expansion and to complete the subtask.
}
