export type MemoryCategory =
  | "project"
  | "knowledge"
  | "conversation"
  | "system"
  | "user"
  | "automation"
  | "temporary"
  | "custom";

export type MemorySource = {
  type: string;
  id?: string;
  label?: string;
};

export type MemoryMetadata = Record<string, string | number | boolean | null | string[]>;

export type NyxMemory = {
  id: string;
  title: string;
  content: string;
  category: MemoryCategory;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  source: MemorySource;
  metadata: MemoryMetadata;
  importance: number;
};

export type CreateMemoryInput = {
  id?: string;
  title: string;
  content: string;
  category: MemoryCategory;
  tags?: string[];
  source?: MemorySource;
  metadata?: MemoryMetadata;
  importance?: number;
};

export type UpdateMemoryInput = Partial<Omit<CreateMemoryInput, "id">>;

export type MemorySearchQuery = {
  id?: string;
  text?: string;
  category?: MemoryCategory;
  tags?: string[];
};

export type MemorySearchResult = {
  memory: NyxMemory;
  score: number;
};

export type MemorySnapshot = {
  total: number;
  categories: Record<MemoryCategory, number>;
  tags: Record<string, number>;
};
