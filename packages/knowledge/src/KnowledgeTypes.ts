export type KnowledgeMetadata = Record<string, string | number | boolean | null | string[]>;

export type KnowledgeSource = {
  type: string;
  id?: string;
  label?: string;
  uri?: string;
};

export type KnowledgeDocument = {
  id: string;
  title: string;
  source: KnowledgeSource;
  content: string;
  metadata: KnowledgeMetadata;
};

export type KnowledgeChunk = {
  id: string;
  documentId: string;
  index: number;
  content: string;
};

export type KnowledgeSearchQuery = {
  text: string;
  limit?: number;
  documentId?: string;
};

export type KnowledgeSearchResult = {
  chunk: KnowledgeChunk;
  document: KnowledgeDocument;
  score: number;
};

export interface ChunkingStrategy {
  chunk(document: KnowledgeDocument): KnowledgeChunk[];
}

export interface KnowledgeSearch {
  search(
    query: KnowledgeSearchQuery,
    chunks: KnowledgeChunk[],
    documents: KnowledgeDocument[]
  ): KnowledgeSearchResult[];
}
