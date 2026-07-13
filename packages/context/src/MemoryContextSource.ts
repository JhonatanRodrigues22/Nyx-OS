import type { NyxMemoryService } from "@nyx-os/memory";
import type { ContextContribution, ContextSource } from "./ContextTypes";

export type MemoryContextSourceOptions = {
  memory: NyxMemoryService;
  priority?: number;
  limit?: number;
};

export class MemoryContextSource implements ContextSource {
  readonly name = "memory";
  private readonly memory: NyxMemoryService;
  private readonly priority: number;
  private readonly limit: number;

  constructor(options: MemoryContextSourceOptions) {
    this.memory = options.memory;
    this.priority = options.priority ?? 70;
    this.limit = options.limit ?? 3;
  }

  async collect(query?: string): Promise<ContextContribution> {
    const results = query
      ? this.memory.search({ text: query }).map((result) => result.memory)
      : this.memory.list();
    const memories = results.slice(0, this.limit);
    const content = memories.map((memory) => `${memory.title}: ${memory.content}`).join("\n");

    return {
      sourceName: this.name,
      priority: this.priority,
      content: content || "No relevant memories."
    };
  }
}
