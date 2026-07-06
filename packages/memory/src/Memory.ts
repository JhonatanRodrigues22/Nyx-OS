import type {
  CreateMemoryInput,
  MemoryCategory,
  MemorySearchQuery,
  MemorySearchResult,
  MemorySnapshot,
  NyxMemory,
  UpdateMemoryInput
} from "./MemoryTypes";

export interface NyxMemoryService {
  create(input: CreateMemoryInput): NyxMemory;
  update(id: string, input: UpdateMemoryInput): NyxMemory;
  delete(id: string): void;
  get(id: string): NyxMemory | undefined;
  list(): NyxMemory[];
  findByCategory(category: MemoryCategory): NyxMemory[];
  findByTags(tags: string[]): NyxMemory[];
  search(query: MemorySearchQuery): MemorySearchResult[];
  snapshot(): MemorySnapshot;
}
