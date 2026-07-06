import type { NyxCapabilityManager } from "@nyx-os/capabilities";
import type { NyxTool } from "./Tool";
import type { ToolCategory, ToolExecution, ToolSnapshot } from "./ToolTypes";

function toSnapshot(tool: NyxTool, lastExecution: ToolExecution | null): ToolSnapshot {
  return {
    id: tool.id,
    capabilityId: tool.capabilityId,
    name: tool.name,
    description: tool.description,
    version: tool.version,
    category: tool.category,
    enabled: tool.enabled,
    parameters: { ...tool.parameters },
    result: { ...tool.result },
    metadata: { ...tool.metadata },
    lastExecutedAt: lastExecution?.executedAt ?? null
  };
}

export class ToolRegistry {
  private readonly tools = new Map<string, NyxTool>();
  private readonly executions = new Map<string, ToolExecution>();

  constructor(private readonly capabilities: NyxCapabilityManager) {}

  register(tool: NyxTool): ToolSnapshot {
    if (this.tools.has(tool.id)) {
      throw new Error(`Tool already registered: ${tool.id}`);
    }

    if (!this.capabilities.get(tool.capabilityId)) {
      throw new Error(`Tool ${tool.id} requires missing capability: ${tool.capabilityId}`);
    }

    this.tools.set(tool.id, tool);

    return this.snapshot(tool);
  }

  remove(id: string): ToolSnapshot {
    const tool = this.require(id);
    const snapshot = this.snapshot(tool);

    this.tools.delete(id);
    this.executions.delete(id);

    return snapshot;
  }

  get(id: string): NyxTool | undefined {
    return this.tools.get(id);
  }

  list(): ToolSnapshot[] {
    return Array.from(this.tools.values()).map((tool) => this.snapshot(tool));
  }

  findByCategory(category: ToolCategory): ToolSnapshot[] {
    return this.list().filter((tool) => tool.category === category);
  }

  isAvailable(id: string): boolean {
    const tool = this.tools.get(id);

    return Boolean(tool?.enabled && this.capabilities.isAvailable(tool.capabilityId));
  }

  recordExecution(execution: ToolExecution): ToolSnapshot {
    this.executions.set(execution.toolId, execution);

    return this.snapshot(this.require(execution.toolId));
  }

  require(id: string): NyxTool {
    const tool = this.tools.get(id);

    if (!tool) {
      throw new Error(`Tool not registered: ${id}`);
    }

    return tool;
  }

  private snapshot(tool: NyxTool): ToolSnapshot {
    return toSnapshot(tool, this.executions.get(tool.id) ?? null);
  }
}
