import type { MemoryCategory, MemorySnapshot, NyxMemory } from "./MemoryTypes";

const categories: MemoryCategory[] = [
  "project",
  "knowledge",
  "conversation",
  "system",
  "user",
  "automation",
  "temporary",
  "custom"
];

export class MemoryIndex {
  createSnapshot(memories: NyxMemory[]): MemorySnapshot {
    const categoryCounts = categories.reduce<Record<MemoryCategory, number>>((accumulator, category) => {
      accumulator[category] = 0;
      return accumulator;
    }, {} as Record<MemoryCategory, number>);
    const tagCounts: Record<string, number> = {};

    memories.forEach((memory) => {
      categoryCounts[memory.category] += 1;
      memory.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
      });
    });

    return {
      total: memories.length,
      categories: categoryCounts,
      tags: tagCounts
    };
  }
}
