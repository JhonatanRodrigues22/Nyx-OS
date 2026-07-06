import type { NyxEventBus, NyxSystemEvents } from "@nyx-os/event-bus";
import type { NyxMemoryService } from "./Memory";
import { emitMemoryEvent } from "./MemoryEvents";
import { MemoryIndex } from "./MemoryIndex";
import { MemorySearch } from "./MemorySearch";
import { InMemoryMemoryStore, type MemoryStore } from "./MemoryStore";
import type {
  CreateMemoryInput,
  MemoryCategory,
  MemorySearchQuery,
  MemorySearchResult,
  MemorySnapshot,
  NyxMemory,
  UpdateMemoryInput
} from "./MemoryTypes";

export type MemoryManagerOptions = {
  events: NyxEventBus<NyxSystemEvents>;
  store?: MemoryStore;
  search?: MemorySearch;
  index?: MemoryIndex;
  idFactory?: () => string;
  now?: () => string;
};

let nextMemoryId = 1;

function createDefaultId(): string {
  const id = `mem_${nextMemoryId}`;

  nextMemoryId += 1;
  return id;
}

function normalizeTags(tags: string[] = []): string[] {
  return Array.from(new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean)));
}

function normalizeImportance(value: number | undefined): number {
  if (value === undefined || Number.isNaN(value)) {
    return 5;
  }

  return Math.max(0, Math.min(10, value));
}

export class MemoryManager implements NyxMemoryService {
  private readonly events: NyxEventBus<NyxSystemEvents>;
  private readonly store: MemoryStore;
  private readonly searchEngine: MemorySearch;
  private readonly index: MemoryIndex;
  private readonly idFactory: () => string;
  private readonly now: () => string;

  constructor(options: MemoryManagerOptions) {
    this.events = options.events;
    this.store = options.store ?? new InMemoryMemoryStore();
    this.searchEngine = options.search ?? new MemorySearch();
    this.index = options.index ?? new MemoryIndex();
    this.idFactory = options.idFactory ?? createDefaultId;
    this.now = options.now ?? (() => new Date().toISOString());
  }

  create(input: CreateMemoryInput): NyxMemory {
    const now = this.now();
    const memory: NyxMemory = {
      id: input.id ?? this.idFactory(),
      title: input.title,
      content: input.content,
      category: input.category,
      tags: normalizeTags(input.tags),
      createdAt: now,
      updatedAt: now,
      source: input.source ?? { type: "system", label: "Nyx OS" },
      metadata: input.metadata ?? {},
      importance: normalizeImportance(input.importance)
    };

    if (this.store.get(memory.id)) {
      throw new Error(`Memory already exists: ${memory.id}`);
    }

    this.store.save(memory);
    emitMemoryEvent(this.events, "memory.created", { memory });
    emitMemoryEvent(this.events, "memory.saved", { memory });

    return memory;
  }

  update(id: string, input: UpdateMemoryInput): NyxMemory {
    const current = this.requireMemory(id);
    const memory: NyxMemory = {
      ...current,
      ...input,
      id: current.id,
      tags: input.tags ? normalizeTags(input.tags) : current.tags,
      source: input.source ?? current.source,
      metadata: input.metadata ?? current.metadata,
      importance: input.importance === undefined ? current.importance : normalizeImportance(input.importance),
      createdAt: current.createdAt,
      updatedAt: this.now()
    };

    this.store.save(memory);
    emitMemoryEvent(this.events, "memory.updated", { memory });
    emitMemoryEvent(this.events, "memory.saved", { memory });

    return memory;
  }

  delete(id: string): void {
    const memory = this.requireMemory(id);

    this.store.delete(id);
    emitMemoryEvent(this.events, "memory.deleted", { memory });
  }

  get(id: string): NyxMemory | undefined {
    const memory = this.store.get(id);

    if (memory) {
      emitMemoryEvent(this.events, "memory.loaded", { memory });
    }

    return memory;
  }

  list(): NyxMemory[] {
    return this.store.list();
  }

  findByCategory(category: MemoryCategory): NyxMemory[] {
    return this.search({ category }).map((result) => result.memory);
  }

  findByTags(tags: string[]): NyxMemory[] {
    return this.search({ tags }).map((result) => result.memory);
  }

  search(query: MemorySearchQuery): MemorySearchResult[] {
    const results = this.searchEngine.search(this.store.list(), query);

    emitMemoryEvent(this.events, "memory.search", {
      query,
      resultCount: results.length
    });

    return results;
  }

  snapshot(): MemorySnapshot {
    return this.index.createSnapshot(this.store.list());
  }

  private requireMemory(id: string): NyxMemory {
    const memory = this.store.get(id);

    if (!memory) {
      throw new Error(`Memory not found: ${id}`);
    }

    return memory;
  }
}
