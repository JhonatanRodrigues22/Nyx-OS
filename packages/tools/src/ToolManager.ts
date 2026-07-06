import type { NyxCapabilityManager } from "@nyx-os/capabilities";
import type { NyxEventBus, NyxSystemEvents } from "@nyx-os/event-bus";
import type { NyxTool } from "./Tool";
import type { ToolContext } from "./ToolContext";
import { emitToolEvent } from "./ToolEvents";
import { ToolExecutor } from "./ToolExecutor";
import { ToolRegistry } from "./ToolRegistry";
import type { ToolCategory, ToolExecution, ToolSnapshot } from "./ToolTypes";

export type ToolManagerOptions = {
  events: NyxEventBus<NyxSystemEvents>;
  capabilities: NyxCapabilityManager;
  createContext: () => ToolContext;
  registry?: ToolRegistry;
  executor?: ToolExecutor;
};

export interface NyxToolManager {
  register(tool: NyxTool): ToolSnapshot;
  remove(id: string): ToolSnapshot;
  get(id: string): NyxTool | undefined;
  list(): ToolSnapshot[];
  findByCategory(category: ToolCategory): ToolSnapshot[];
  isAvailable(id: string): boolean;
  execute<TResult = unknown, TInput = unknown>(id: string, input?: TInput): Promise<ToolExecution<TResult>>;
}

export class ToolManager implements NyxToolManager {
  private readonly events: NyxEventBus<NyxSystemEvents>;
  private readonly createContext: () => ToolContext;
  private readonly registry: ToolRegistry;
  private readonly executor: ToolExecutor;

  constructor(options: ToolManagerOptions) {
    this.events = options.events;
    this.createContext = options.createContext;
    this.registry = options.registry ?? new ToolRegistry(options.capabilities);
    this.executor =
      options.executor ?? new ToolExecutor({ events: options.events, capabilities: options.capabilities });
  }

  register(tool: NyxTool): ToolSnapshot {
    const snapshot = this.registry.register(tool);

    emitToolEvent(this.events, "tool.registered", { tool: snapshot });

    return snapshot;
  }

  remove(id: string): ToolSnapshot {
    const snapshot = this.registry.remove(id);

    emitToolEvent(this.events, "tool.removed", { tool: snapshot });

    return snapshot;
  }

  get(id: string): NyxTool | undefined {
    return this.registry.get(id);
  }

  list(): ToolSnapshot[] {
    return this.registry.list();
  }

  findByCategory(category: ToolCategory): ToolSnapshot[] {
    return this.registry.findByCategory(category);
  }

  isAvailable(id: string): boolean {
    return this.registry.isAvailable(id);
  }

  async execute<TResult = unknown, TInput = unknown>(id: string, input?: TInput): Promise<ToolExecution<TResult>> {
    const tool = this.registry.require(id) as NyxTool<TInput, TResult>;
    const execution = await this.executor.execute(tool, this.createContext(), input);

    this.registry.recordExecution(execution);

    return execution;
  }
}
