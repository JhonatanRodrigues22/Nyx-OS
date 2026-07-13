import type { KnowledgeSearchEngine } from "@nyx-os/knowledge";
import type { ContextContribution, ContextSource } from "./ContextTypes";

export type KnowledgeContextSourceOptions = {
  knowledge: KnowledgeSearchEngine;
  priority?: number;
  limit?: number;
};

export class KnowledgeContextSource implements ContextSource {
  readonly name = "knowledge";
  private readonly knowledge: KnowledgeSearchEngine;
  private readonly priority: number;
  private readonly limit: number;

  constructor(options: KnowledgeContextSourceOptions) {
    this.knowledge = options.knowledge;
    this.priority = options.priority ?? 60;
    this.limit = options.limit ?? 3;
  }

  async collect(query?: string): Promise<ContextContribution> {
    const results = query
      ? this.knowledge.search({ text: query, limit: this.limit })
      : [];
    const content = results
      .map((result) => `${result.document.title}#${result.chunk.index}: ${result.chunk.content}`)
      .join("\n");

    return {
      sourceName: this.name,
      priority: this.priority,
      content: content || "No relevant knowledge chunks."
    };
  }
}
