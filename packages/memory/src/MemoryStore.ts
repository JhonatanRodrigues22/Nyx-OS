import type { NyxMemory } from "./MemoryTypes";

export interface MemoryStore {
  save(memory: NyxMemory): void;
  delete(id: string): void;
  get(id: string): NyxMemory | undefined;
  list(): NyxMemory[];
  clear(): void;
}

export class InMemoryMemoryStore implements MemoryStore {
  private readonly memories = new Map<string, NyxMemory>();

  save(memory: NyxMemory): void {
    this.memories.set(memory.id, this.clone(memory));
  }

  delete(id: string): void {
    this.memories.delete(id);
  }

  get(id: string): NyxMemory | undefined {
    const memory = this.memories.get(id);

    return memory ? this.clone(memory) : undefined;
  }

  list(): NyxMemory[] {
    return Array.from(this.memories.values()).map((memory) => this.clone(memory));
  }

  clear(): void {
    this.memories.clear();
  }

  private clone(memory: NyxMemory): NyxMemory {
    return {
      ...memory,
      tags: [...memory.tags],
      source: { ...memory.source },
      metadata: { ...memory.metadata }
    };
  }
}
