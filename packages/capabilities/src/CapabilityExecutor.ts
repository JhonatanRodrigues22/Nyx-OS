import type { NyxEventBus, NyxSystemEvents } from "@nyx-os/event-bus";
import type { NyxCapability } from "./Capability";
import type { CapabilityContext } from "./CapabilityContext";
import { emitCapabilityEvent } from "./CapabilityEvents";
import type { CapabilityExecution } from "./CapabilityTypes";

export type CapabilityExecutorOptions = {
  events: NyxEventBus<NyxSystemEvents>;
  now?: () => string;
};

export class CapabilityExecutor {
  private readonly events: NyxEventBus<NyxSystemEvents>;
  private readonly now: () => string;

  constructor(options: CapabilityExecutorOptions) {
    this.events = options.events;
    this.now = options.now ?? (() => new Date().toISOString());
  }

  async execute<TResult = unknown, TInput = unknown>(
    capability: NyxCapability<TInput, TResult>,
    context: CapabilityContext,
    input?: TInput
  ): Promise<CapabilityExecution<TResult>> {
    if (!capability.enabled) {
      const execution: CapabilityExecution<TResult> = {
        capabilityId: capability.id,
        status: "failed",
        error: `Capability disabled: ${capability.id}`,
        executedAt: this.now()
      };

      emitCapabilityEvent(this.events, "capability.failed", { execution });
      throw new Error(execution.error);
    }

    try {
      const result = await capability.execute(context, input);
      const execution: CapabilityExecution<TResult> = {
        capabilityId: capability.id,
        status: "success",
        result,
        executedAt: this.now()
      };

      emitCapabilityEvent(this.events, "capability.executed", { execution });
      return execution;
    } catch (error) {
      const execution: CapabilityExecution<TResult> = {
        capabilityId: capability.id,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown capability failure",
        executedAt: this.now()
      };

      emitCapabilityEvent(this.events, "capability.failed", { execution });
      throw error;
    }
  }
}
