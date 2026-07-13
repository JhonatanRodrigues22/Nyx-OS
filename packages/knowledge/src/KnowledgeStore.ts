import type { KnowledgeChunk, KnowledgeDocument } from "./KnowledgeTypes";

export interface KnowledgeStore {
  saveDocument(document: KnowledgeDocument): void;
  saveChunks(documentId: string, chunks: KnowledgeChunk[]): void;
  getDocument(id: string): KnowledgeDocument | undefined;
  listDocuments(): KnowledgeDocument[];
  listChunks(documentId?: string): KnowledgeChunk[];
  clear(): void;
}

export class InMemoryKnowledgeStore implements KnowledgeStore {
  private readonly documents = new Map<string, KnowledgeDocument>();
  private readonly chunks = new Map<string, KnowledgeChunk[]>();

  saveDocument(document: KnowledgeDocument): void {
    if (this.documents.has(document.id)) {
      throw new Error(`Knowledge document already exists: ${document.id}`);
    }

    this.documents.set(document.id, this.cloneDocument(document));
  }

  saveChunks(documentId: string, chunks: KnowledgeChunk[]): void {
    this.chunks.set(documentId, chunks.map((chunk) => this.cloneChunk(chunk)));
  }

  getDocument(id: string): KnowledgeDocument | undefined {
    const document = this.documents.get(id);

    return document ? this.cloneDocument(document) : undefined;
  }

  listDocuments(): KnowledgeDocument[] {
    return Array.from(this.documents.values()).map((document) => this.cloneDocument(document));
  }

  listChunks(documentId?: string): KnowledgeChunk[] {
    if (documentId) {
      return (this.chunks.get(documentId) ?? []).map((chunk) => this.cloneChunk(chunk));
    }

    return Array.from(this.chunks.values())
      .flat()
      .map((chunk) => this.cloneChunk(chunk));
  }

  clear(): void {
    this.documents.clear();
    this.chunks.clear();
  }

  private cloneDocument(document: KnowledgeDocument): KnowledgeDocument {
    return {
      ...document,
      source: { ...document.source },
      metadata: { ...document.metadata }
    };
  }

  private cloneChunk(chunk: KnowledgeChunk): KnowledgeChunk {
    return { ...chunk };
  }
}
