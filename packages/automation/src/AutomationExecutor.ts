import type { NyxEventBus, NyxSystemEvents } from "@nyx-os/event-bus";
import type { NyxToolManager } from "@nyx-os/tools";
import { emitAutomationExecutionEvent } from "./AutomationEvents";
import type { Automation, AutomationExecution, AutomationTriggerSource } from "./AutomationTypes";

export type AutomationExecutorOptions = {
  events: NyxEventBus<NyxSystemEvents>;
  tools: NyxToolManager;
  historyLimit?: number;
  now?: () => string;
};

export class AutomationExecutor {
  private readonly events: NyxEventBus<NyxSystemEvents>;
  private readonly tools: NyxToolManager;
  private readonly historyLimit: number;
  private readonly now: () => string;
  private readonly history: AutomationExecution[] = [];

  constructor(options: AutomationExecutorOptions) {
    this.events = options.events;
    this.tools = options.tools;
    this.historyLimit = options.historyLimit ?? 20;
    this.now = options.now ?? (() => new Date().toISOString());
  }

  async execute<TResult = unknown>(automation: Automation, trigger: AutomationTriggerSource): Promise<AutomationExecution<TResult>> {
    if (!automation.enabled) {
      throw new Error(`Automation disabled: ${automation.id}`);
    }

    try {
      const toolExecution = await this.tools.execute<TResult>(automation.action.toolId, automation.action.input);
      const execution: AutomationExecution<TResult> = {
        automationId: automation.id,
        toolId: automation.action.toolId,
        trigger,
        status: "success",
        toolExecution,
        executedAt: this.now()
      };

      this.record(execution);
      emitAutomationExecutionEvent(this.events, "automation.executed", execution);

      return execution;
    } catch (error) {
      const execution: AutomationExecution<TResult> = {
        automationId: automation.id,
        toolId: automation.action.toolId,
        trigger,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown automation failure",
        executedAt: this.now()
      };

      this.record(execution);
      emitAutomationExecutionEvent(this.events, "automation.failed", execution);
      throw error;
    }
  }

  listHistory(): AutomationExecution[] {
    return this.history.map((execution) => ({ ...execution }));
  }

  private record(execution: AutomationExecution): void {
    this.history.unshift(execution);
    this.history.splice(this.historyLimit);
  }
}
