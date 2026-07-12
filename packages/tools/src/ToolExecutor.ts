import type { NyxCapabilityManager } from "@nyx-os/capabilities";
import type { NyxEventBus, NyxSystemEvents } from "@nyx-os/event-bus";
import type { NyxTool } from "./Tool";
import type { ToolContext } from "./ToolContext";
import { emitToolEvent } from "./ToolEvents";
import type { ToolExecution, ToolExecutionOptions, ToolParameterDefinition, ToolParameters } from "./ToolTypes";

export type ToolExecutorOptions = {
  events: NyxEventBus<NyxSystemEvents>;
  capabilities: NyxCapabilityManager;
  now?: () => string;
};

function validateParameter(name: string, definition: ToolParameterDefinition, value: unknown): string | null {
  if (value === undefined || value === null) {
    return definition.required ? `Missing required parameter: ${name}` : null;
  }

  if (definition.type === "array") {
    return Array.isArray(value) ? null : `Invalid parameter ${name}: expected array`;
  }

  if (definition.type === "object") {
    return typeof value === "object" && !Array.isArray(value) ? null : `Invalid parameter ${name}: expected object`;
  }

  return typeof value === definition.type ? null : `Invalid parameter ${name}: expected ${definition.type}`;
}

function validateParameters(parameters: ToolParameters, input: unknown): string | null {
  const values = typeof input === "object" && input !== null && !Array.isArray(input) ? input : {};

  for (const [name, definition] of Object.entries(parameters)) {
    const error = validateParameter(name, definition, (values as Record<string, unknown>)[name]);

    if (error) {
      return error;
    }
  }

  return null;
}

export class ToolExecutor {
  private readonly events: NyxEventBus<NyxSystemEvents>;
  private readonly capabilities: NyxCapabilityManager;
  private readonly now: () => string;

  constructor(options: ToolExecutorOptions) {
    this.events = options.events;
    this.capabilities = options.capabilities;
    this.now = options.now ?? (() => new Date().toISOString());
  }

  async execute<TResult = unknown, TInput = unknown>(
    tool: NyxTool<TInput, TResult>,
    context: ToolContext,
    input?: TInput,
    options: ToolExecutionOptions = {}
  ): Promise<ToolExecution<TResult>> {
    if (!tool.enabled) {
      return this.fail(tool, `Tool disabled: ${tool.id}`, options);
    }

    if (!this.capabilities.isAvailable(tool.capabilityId)) {
      return this.fail(tool, `Tool ${tool.id} requires unavailable capability: ${tool.capabilityId}`, options);
    }

    const validationError = validateParameters(tool.parameters, input);

    if (validationError) {
      return this.fail(tool, validationError, options);
    }

    try {
      const result = await tool.execute(context, input);
      const execution: ToolExecution<TResult> = {
        toolId: tool.id,
        capabilityId: tool.capabilityId,
        status: "success",
        ...options,
        result,
        executedAt: this.now()
      };

      emitToolEvent(this.events, "tool.executed", { execution });
      return execution;
    } catch (error) {
      return this.fail(tool, error instanceof Error ? error.message : "Unknown tool failure", options);
    }
  }

  private fail<TResult>(tool: NyxTool, error: string, options: ToolExecutionOptions = {}): Promise<ToolExecution<TResult>> {
    const execution: ToolExecution<TResult> = {
      toolId: tool.id,
      capabilityId: tool.capabilityId,
      status: "failed",
      ...options,
      error,
      executedAt: this.now()
    };

    emitToolEvent(this.events, "tool.failed", { execution });
    throw new Error(error);
  }
}
