import { FixedSizeChunkingStrategy } from "./FixedSizeChunkingStrategy";
import { InMemoryKnowledgeStore, type KnowledgeStore } from "./KnowledgeStore";
import type { ChunkingStrategy, KnowledgeChunk, KnowledgeDocument } from "./KnowledgeTypes";

export type KnowledgeIngestResult = {
  document: KnowledgeDocument;
  chunks: KnowledgeChunk[];
};

export type KnowledgeIngestorOptions = {
  store?: KnowledgeStore;
  chunking?: ChunkingStrategy;
};

export class KnowledgeIngestor {
  private readonly store: KnowledgeStore;
  private readonly chunking: ChunkingStrategy;

  constructor(options: KnowledgeIngestorOptions = {}) {
    this.store = options.store ?? new InMemoryKnowledgeStore();
    this.chunking = options.chunking ?? new FixedSizeChunkingStrategy();
  }

  ingest(document: KnowledgeDocument): KnowledgeIngestResult {
    const chunks = this.chunking.chunk(document);

    this.store.saveDocument(document);
    this.store.saveChunks(document.id, chunks);

    return {
      document: this.store.getDocument(document.id) ?? document,
      chunks: this.store.listChunks(document.id)
    };
  }

  getStore(): KnowledgeStore {
    return this.store;
  }
}
