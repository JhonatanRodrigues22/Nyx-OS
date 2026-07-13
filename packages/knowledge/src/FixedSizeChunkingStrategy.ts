import type { ChunkingStrategy, KnowledgeChunk, KnowledgeDocument } from "./KnowledgeTypes";

export type FixedSizeChunkingOptions = {
  chunkSize?: number;
  overlap?: number;
};

function normalizeChunkingOptions(options: FixedSizeChunkingOptions) {
  const chunkSize = options.chunkSize ?? 500;
  const overlap = options.overlap ?? 50;

  if (!Number.isInteger(chunkSize) || chunkSize <= 0) {
    throw new Error(`Invalid chunk size: ${chunkSize}`);
  }

  if (!Number.isInteger(overlap) || overlap < 0 || overlap >= chunkSize) {
    throw new Error(`Invalid chunk overlap: ${overlap}`);
  }

  return {
    chunkSize,
    overlap
  };
}

export class FixedSizeChunkingStrategy implements ChunkingStrategy {
  private readonly chunkSize: number;
  private readonly overlap: number;

  constructor(options: FixedSizeChunkingOptions = {}) {
    const normalized = normalizeChunkingOptions(options);

    this.chunkSize = normalized.chunkSize;
    this.overlap = normalized.overlap;
  }

  chunk(document: KnowledgeDocument): KnowledgeChunk[] {
    if (!document.content) {
      return [];
    }

    const chunks: KnowledgeChunk[] = [];
    const step = this.chunkSize - this.overlap;
    let start = 0;

    while (start < document.content.length) {
      const content = document.content.slice(start, start + this.chunkSize);

      chunks.push({
        id: `${document.id}#${chunks.length}`,
        documentId: document.id,
        index: chunks.length,
        content
      });

      start += step;
    }

    return chunks;
  }
}
