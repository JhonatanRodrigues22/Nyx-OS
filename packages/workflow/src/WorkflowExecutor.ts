import type { NyxEventBus, NyxSystemEvents } from "@nyx-os/event-bus";
import type { NyxToolManager, ToolExecution } from "@nyx-os/tools";
import { emitWorkflowEvent } from "./WorkflowEvents";
import type { WorkflowDefinition, WorkflowInstance, WorkflowStep, WorkflowStepHistoryEntry } from "./WorkflowTypes";

export type WorkflowExecutorOptions = {
  events: NyxEventBus<NyxSystemEvents>;
  tools: NyxToolManager;
  now?: () => string;
  wait?: (milliseconds: number) => Promise<void>;
};

export type WorkflowRunOptions = {
  shouldPause?: () => boolean;
  createPauseSignal?: () => {
    promise: Promise<void>;
    cancel: () => void;
  };
};

function defaultWait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function cloneInstance(instance: WorkflowInstance): WorkflowInstance {
  return {
    ...instance,
    history: instance.history.map((entry) => ({ ...entry })),
    context: { ...instance.context }
  };
}

export class WorkflowExecutor {
  private readonly events: NyxEventBus<NyxSystemEvents>;
  private readonly tools: NyxToolManager;
  private readonly now: () => string;
  private readonly wait: (milliseconds: number) => Promise<void>;

  constructor(options: WorkflowExecutorOptions) {
    this.events = options.events;
    this.tools = options.tools;
    this.now = options.now ?? (() => new Date().toISOString());
    this.wait = options.wait ?? defaultWait;
  }

  async run(
    definition: WorkflowDefinition,
    instance: WorkflowInstance,
    options: WorkflowRunOptions = {}
  ): Promise<WorkflowInstance> {
    while (instance.status === "running" && instance.currentStepId) {
      const step = this.requireStep(definition, instance.currentStepId);
      const completed = await this.executeStep(definition, instance, step, options);

      if (!completed || instance.status !== "running") {
        break;
      }

      if (options.shouldPause?.()) {
        instance.status = "paused";
        emitWorkflowEvent(this.events, "workflow.paused", { instance: cloneInstance(instance) });
        break;
      }
    }

    return cloneInstance(instance);
  }

  private async executeStep(
    definition: WorkflowDefinition,
    instance: WorkflowInstance,
    step: WorkflowStep,
    options: WorkflowRunOptions
  ): Promise<boolean> {
    const maxAttempts = step.retry?.maxAttempts ?? 1;
    const completedAttempts = instance.history.filter((entry) => entry.stepId === step.id).length;

    for (let attempt = completedAttempts + 1; attempt <= maxAttempts; attempt += 1) {
      const startedAt = this.now();

      try {
        const execution = await this.tools.execute(step.toolId, this.resolveInput(step, instance), {
          source: "workflow",
          workflowId: definition.id,
          workflowInstanceId: instance.id,
          workflowStepId: step.id
        });
        const entry = this.createHistoryEntry(step, attempt, "success", startedAt, execution);

        instance.history.push(entry);
        instance.context[step.id] = execution.result;

        try {
          instance.currentStepId = this.resolveNext(definition, step, execution, instance);
        } catch (error) {
          instance.status = "failed";
          entry.status = "failed";
          entry.error = error instanceof Error ? error.message : "Unknown workflow branching failure";
          emitWorkflowEvent(this.events, "workflow.failed", { instance: cloneInstance(instance), step: entry });
          return false;
        }

        if (!instance.currentStepId) {
          instance.status = "completed";
          emitWorkflowEvent(this.events, "workflow.step.completed", { instance: cloneInstance(instance), step: entry });
          emitWorkflowEvent(this.events, "workflow.completed", { instance: cloneInstance(instance) });
        } else {
          emitWorkflowEvent(this.events, "workflow.step.completed", { instance: cloneInstance(instance), step: entry });
        }

        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown workflow step failure";
        const entry = this.createHistoryEntry(step, attempt, "failed", startedAt, undefined, message);

        instance.history.push(entry);

        if (attempt >= maxAttempts) {
          instance.status = "failed";
          emitWorkflowEvent(this.events, "workflow.failed", { instance: cloneInstance(instance), step: entry });
          return false;
        }

        if (options.shouldPause?.()) {
          instance.status = "paused";
          emitWorkflowEvent(this.events, "workflow.paused", { instance: cloneInstance(instance), step: entry });
          return false;
        }

        if (step.retry?.backoffMs && (await this.waitForBackoff(step.retry.backoffMs, options))) {
          instance.status = "paused";
          emitWorkflowEvent(this.events, "workflow.paused", { instance: cloneInstance(instance), step: entry });
          return false;
        }

        if (options.shouldPause?.()) {
          instance.status = "paused";
          emitWorkflowEvent(this.events, "workflow.paused", { instance: cloneInstance(instance), step: entry });
          return false;
        }
      }
    }

    return false;
  }

  private resolveInput(step: WorkflowStep, instance: WorkflowInstance): unknown {
    return typeof step.input === "function" ? step.input(instance.context) : step.input;
  }

  private async waitForBackoff(milliseconds: number, options: WorkflowRunOptions): Promise<boolean> {
    const pauseSignal = options.createPauseSignal?.();

    if (!pauseSignal) {
      await this.wait(milliseconds);
      return false;
    }

    try {
      return await Promise.race([
        this.wait(milliseconds).then(() => false),
        pauseSignal.promise.then(() => true)
      ]);
    } finally {
      pauseSignal.cancel();
    }
  }

  private resolveNext(
    definition: WorkflowDefinition,
    step: WorkflowStep,
    execution: ToolExecution,
    instance: WorkflowInstance
  ): string | null {
    const next = typeof step.next === "function" ? step.next(execution, instance.context) : step.next;

    if (next && !definition.steps.some((candidate) => candidate.id === next)) {
      throw new Error(`Workflow ${definition.id} step ${step.id} resolved missing next step: ${next}`);
    }

    return next;
  }

  private requireStep(definition: WorkflowDefinition, stepId: string): WorkflowStep {
    const step = definition.steps.find((candidate) => candidate.id === stepId);

    if (!step) {
      throw new Error(`Workflow ${definition.id} step not found: ${stepId}`);
    }

    return step;
  }

  private createHistoryEntry(
    step: WorkflowStep,
    attempt: number,
    status: "success" | "failed",
    startedAt: string,
    execution?: ToolExecution,
    error?: string
  ): WorkflowStepHistoryEntry {
    return {
      stepId: step.id,
      toolId: step.toolId,
      status,
      attempt,
      execution,
      error,
      startedAt,
      completedAt: this.now()
    };
  }
}
