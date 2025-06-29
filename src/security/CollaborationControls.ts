import { IWorkflow } from '@/contracts/IWorkflow';

export class CollaborationControlsService {
  public acquireLock(workflow: IWorkflow, userId: string): boolean {
    if (!workflow.lockedBy || (workflow.lockExpiresAt && workflow.lockExpiresAt < new Date())) {
      workflow.lockedBy = userId;
      workflow.lockExpiresAt = new Date(new Date().getTime() + 5 * 60 * 1000); // 5 minutes
      return true;
    }
    return false;
  }

  public releaseLock(workflow: IWorkflow, userId: string): boolean {
    if (workflow.lockedBy === userId) {
      workflow.lockedBy = undefined;
      workflow.lockExpiresAt = undefined;
      return true;
    }
    return false;
  }
}
