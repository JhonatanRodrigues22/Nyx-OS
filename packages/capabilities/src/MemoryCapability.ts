import type { NyxCapability } from "./Capability";
import type { CapabilityContext } from "./CapabilityContext";

export class MemoryCapability implements NyxCapability<{ text?: string }, { total: number; results: unknown[] }> {
  readonly id = "memory.search";
  readonly name = "Memory Search";
  readonly description = "Runs a simple textual memory search through the official Memory Engine.";
  readonly version = "0.1.0";
  readonly category = "memory" as const;
  readonly tags = ["memory", "search", "context"];
  readonly enabled = true;
  readonly metadata = {
    internal: true
  };

  execute(context: CapabilityContext, input: { text?: string } = {}): { total: number; results: unknown[] } {
    const results = input.text ? context.memory.search({ text: input.text }) : [];

    return {
      total: context.memory.snapshot().total,
      results
    };
  }
}
