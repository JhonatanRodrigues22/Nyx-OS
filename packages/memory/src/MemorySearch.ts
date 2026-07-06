import type { MemorySearchQuery, MemorySearchResult, NyxMemory } from "./MemoryTypes";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function includesText(memory: NyxMemory, text: string): boolean {
  const haystack = normalize(`${memory.title} ${memory.content} ${memory.tags.join(" ")}`);

  return haystack.includes(normalize(text));
}

export class MemorySearch {
  search(memories: NyxMemory[], query: MemorySearchQuery): MemorySearchResult[] {
    return memories
      .map((memory) => ({
        memory,
        score: this.score(memory, query)
      }))
      .filter((result) => result.score > 0)
      .sort((left, right) => right.score - left.score || right.memory.importance - left.memory.importance);
  }

  private score(memory: NyxMemory, query: MemorySearchQuery): number {
    let score = 0;

    if (query.id) {
      if (memory.id !== query.id) {
        return 0;
      }

      score += 100;
    }

    if (query.category) {
      if (memory.category !== query.category) {
        return 0;
      }

      score += 20;
    }

    if (query.tags?.length) {
      const memoryTags = new Set(memory.tags.map(normalize));
      const matchingTags = query.tags.filter((tag) => memoryTags.has(normalize(tag))).length;

      if (matchingTags === 0) {
        return 0;
      }

      score += matchingTags * 15;
    }

    if (query.text) {
      if (!includesText(memory, query.text)) {
        return 0;
      }

      score += normalize(memory.title).includes(normalize(query.text)) ? 30 : 10;
    }

    if (!query.id && !query.category && !query.tags?.length && !query.text) {
      score = 1;
    }

    return score + Math.max(0, Math.min(10, memory.importance));
  }
}
