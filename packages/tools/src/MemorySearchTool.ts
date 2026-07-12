import type { NyxTool } from "./Tool";
import type { ToolContext } from "./ToolContext";

export type MemorySearchToolInput = {
  text: string;
};

export class MemorySearchTool implements NyxTool<MemorySearchToolInput, { total: number; results: unknown[] }> {
  readonly id = "memory.search";
  readonly capabilityId = "memory.search";
  readonly name = "Memory Search";
  readonly description = "Searches textual memories through the official Memory Engine.";
  readonly version = "0.1.0";
  readonly category = "memory" as const;
  readonly enabled = true;
  readonly parameters = {
    text: {
      type: "string" as const,
      required: true,
      description: "Text used to search memory entries."
    }
  };
  readonly result = {
    description: "Total memory count and matching memory entries."
  };
  readonly metadata = {
    internal: true
  };

  execute(context: ToolContext, input?: MemorySearchToolInput): { total: number; results: unknown[] } {
    return {
      total: context.memory.snapshot().total,
      results: context.memory.search({ text: input?.text ?? "" })
    };
  }
}
