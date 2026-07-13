import type { ToolExecution } from "@nyx-os/tools";

export type WorkflowContext = Record<string, unknown>;

export type WorkflowStepNext = string | null | ((result: ToolExecution, context: WorkflowContext) => string | null);

export type WorkflowStepRetry = {
  maxAttempts: number;
  backoffMs: number;
};

export type WorkflowStep<TInput = unknown> = {
  id: string;
  name: string;
  toolId: string;
  input?: TInput | ((context: WorkflowContext) => TInput);
  next: WorkflowStepNext;
  retry?: WorkflowStepRetry;
};

export type WorkflowDefinition = {
  id: string;
  name: string;
  steps: WorkflowStep[];
};

export type WorkflowInstanceStatus = "running" | "paused" | "completed" | "failed";

export type WorkflowStepHistoryEntry = {
  stepId: string;
  toolId: string;
  status: "success" | "failed";
  attempt: number;
  execution?: ToolExecution;
  error?: string;
  startedAt: string;
  completedAt: string;
};

export type WorkflowInstance = {
  id: string;
  workflowId: string;
  status: WorkflowInstanceStatus;
  currentStepId: string | null;
  history: WorkflowStepHistoryEntry[];
  context: WorkflowContext;
};
