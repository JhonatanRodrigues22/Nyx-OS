import type { ContextContribution, ContextRequest, ContextResult, ContextSource } from "./ContextTypes";

export type ContextEngineOptions = {
  sources?: ContextSource[];
};

function omission(sourceName: string, reason: string): string {
  return `${sourceName}: ${reason}`;
}

export class ContextEngine {
  private readonly sources: ContextSource[] = [];

  constructor(options: ContextEngineOptions = {}) {
    options.sources?.forEach((source) => this.register(source));
  }

  register(source: ContextSource): void {
    if (this.sources.some((candidate) => candidate.name === source.name)) {
      throw new Error(`Context source already registered: ${source.name}`);
    }

    this.sources.push(source);
  }

  listSources(): ContextSource[] {
    return [...this.sources];
  }

  async build(request: ContextRequest): Promise<ContextResult> {
    if (!Number.isInteger(request.maxChars) || request.maxChars < 0) {
      throw new Error(`Invalid context budget: ${request.maxChars}`);
    }

    const collected = await this.collect(request.query);
    const ordered = collected.sections.sort(
      (left, right) => right.priority - left.priority || left.sourceName.localeCompare(right.sourceName)
    );
    const result = this.applyBudget(ordered, request.maxChars);

    return {
      sections: result.sections,
      truncated: result.truncated,
      omittedSources: [...collected.omittedSources, ...result.omittedSources]
    };
  }

  private async collect(query?: string): Promise<ContextResult> {
    const results = await Promise.all(
      this.sources.map(async (source) => {
        try {
          return {
            contribution: await source.collect(query),
            omittedSource: null
          };
        } catch (error) {
          return {
            contribution: null,
            omittedSource: omission(source.name, error instanceof Error ? error.message : "unknown error")
          };
        }
      })
    );

    return {
      sections: results
        .map((result) => result.contribution)
        .filter((contribution): contribution is ContextContribution => Boolean(contribution)),
      truncated: false,
      omittedSources: results
        .map((result) => result.omittedSource)
        .filter((omittedSource): omittedSource is string => Boolean(omittedSource))
    };
  }

  private applyBudget(sections: ContextContribution[], maxChars: number): ContextResult {
    const included: ContextContribution[] = [];
    const omittedSources: string[] = [];
    let usedChars = 0;
    let truncated = false;

    for (const section of sections) {
      const remaining = maxChars - usedChars;

      if (remaining <= 0) {
        omittedSources.push(omission(section.sourceName, "context budget exceeded"));
        truncated = true;
        continue;
      }

      if (section.content.length <= remaining) {
        included.push(section);
        usedChars += section.content.length;
        continue;
      }

      included.push({
        ...section,
        content: section.content.slice(0, remaining)
      });
      omittedSources.push(omission(section.sourceName, "content truncated by context budget"));
      usedChars = maxChars;
      truncated = true;
    }

    return {
      sections: included,
      truncated,
      omittedSources
    };
  }
}
